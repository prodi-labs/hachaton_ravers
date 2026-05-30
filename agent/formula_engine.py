"""Deterministic Formula Engine for the Private Sandbox.

Option B: the financial number is ALWAYS computed here from hardcoded formulas +
hardcoded assumptions (deterministic, not an AI estimate). The LLM only picks the
initiative type, extracts the magnitude, and writes the causal-chain *wording* —
it never produces the number.

Savings are returned as SIGNED NEGATIVE euros (a cost reduction), e.g. -200000.0.
"""

from __future__ import annotations

# --- Reference assumptions ---------------------------------------------------
# Single config object so real values can be swapped in later without touching
# the formula logic. Each entry: human-readable name -> (value, unit).
ASSUMPTIONS: dict[str, tuple[float, str]] = {
    "annual_production_volume": (10_000_000, "units/year"),
    "current_line_speed": (1_000, "units/hour"),
    "machine_power_kw": (500, "kW"),
    "energy_price_per_kwh": (0.15, "€/kWh"),
    "workers_per_shift": (8, "FTE"),
    "hourly_labour_rate": (25, "€/hour"),
    "operating_hours_per_year": (6_000, "hours"),
    "annual_downtime_rate": (0.10, "fraction"),
}

# Guard: percentages above this are flagged as unrealistic before computing.
MAGNITUDE_WARNING_THRESHOLD = 50.0


def _val(name: str) -> float:
    return ASSUMPTIONS[name][0]


def _assumptions(*names: str) -> list[dict]:
    """Return the listed assumptions in UI-ready form."""
    return [
        {"name": n, "value": ASSUMPTIONS[n][0], "unit": ASSUMPTIONS[n][1]}
        for n in names
    ]


# --- Initiative formulas -----------------------------------------------------
# Each returns (saving_eur_signed_negative, assumptions_used).


def _line_speed(pct: float) -> tuple[float, list[dict]]:
    """Higher line speed -> same volume in less runtime -> less energy & labour."""
    volume = _val("annual_production_volume")
    speed = _val("current_line_speed")
    new_speed = speed * (1 + pct / 100.0)
    baseline_runtime = volume / speed
    new_runtime = volume / new_speed
    delta_runtime = baseline_runtime - new_runtime

    energy_saving = delta_runtime * _val("machine_power_kw") * _val("energy_price_per_kwh")
    labour_saving = delta_runtime * _val("workers_per_shift") * _val("hourly_labour_rate")
    saving = -(energy_saving + labour_saving)
    return saving, _assumptions(
        "annual_production_volume",
        "current_line_speed",
        "machine_power_kw",
        "energy_price_per_kwh",
        "workers_per_shift",
        "hourly_labour_rate",
    )


def _worker_shifts(pct: float) -> tuple[float, list[dict]]:
    """Added shift capacity converts expensive overtime hours into normal-rate hours.

    `pct` = share of current overtime hours absorbed by the new shift.
    """
    volume = _val("annual_production_volume")
    speed = _val("current_line_speed")
    baseline_runtime = volume / speed
    overtime_hours = max(0.0, baseline_runtime - _val("operating_hours_per_year"))
    hours_shifted = overtime_hours * pct / 100.0
    # Overtime is paid at 1.5x; moving to a normal shift saves the 0.5x premium.
    saving = -(hours_shifted * _val("workers_per_shift") * _val("hourly_labour_rate") * 0.5)
    return saving, _assumptions(
        "annual_production_volume",
        "current_line_speed",
        "operating_hours_per_year",
        "workers_per_shift",
        "hourly_labour_rate",
    )


def _downtime_reduction(pct: float) -> tuple[float, list[dict]]:
    """Less unplanned downtime -> recovered runtime -> less energy & labour waste."""
    downtime_hours = _val("operating_hours_per_year") * _val("annual_downtime_rate")
    recovered_hours = downtime_hours * pct / 100.0
    hourly_cost = (
        _val("machine_power_kw") * _val("energy_price_per_kwh")
        + _val("workers_per_shift") * _val("hourly_labour_rate")
    )
    saving = -(recovered_hours * hourly_cost)
    return saving, _assumptions(
        "operating_hours_per_year",
        "annual_downtime_rate",
        "machine_power_kw",
        "energy_price_per_kwh",
        "workers_per_shift",
        "hourly_labour_rate",
    )


# --- Initiative registry -----------------------------------------------------
INITIATIVES: dict[str, dict] = {
    "line_speed": {
        "label": "Increase Line Speed",
        "fn": _line_speed,
        "reference_chain": [
            "Higher line speed → higher throughput",
            "Higher throughput → same volume produced in less machine runtime",
            "Less machine runtime → lower energy cost",
            "Fewer production hours → fewer labour hours → lower labour cost",
        ],
    },
    "worker_shifts": {
        "label": "Optimise Worker Shifts",
        "fn": _worker_shifts,
        "reference_chain": [
            "Added shift capacity → fewer overtime hours needed",
            "Overtime hours move to normal-rate hours",
            "Lower overtime premium → lower labour cost",
        ],
    },
    "downtime_reduction": {
        "label": "Reduce Machine Downtime",
        "fn": _downtime_reduction,
        "reference_chain": [
            "Less unplanned downtime → recovered productive runtime",
            "Same output achieved in fewer paid hours",
            "Lower wasted energy and labour → lower cost",
        ],
    },
}


def calculate(initiative_type: str, magnitude_pct: float, confirmed: bool = False) -> dict:
    """Deterministically compute the financial impact of an initiative.

    Args:
        initiative_type: one of INITIATIVES keys (line_speed, worker_shifts,
            downtime_reduction).
        magnitude_pct: the size of the change, e.g. 10 for "+10%".
        confirmed: pass True to compute despite an unrealistic-magnitude warning.

    Returns a dict the agent relays to the UI. On success includes a signed-negative
    `saving`. On unsupported type or unconfirmed unrealistic magnitude, returns a
    flagged dict with no `saving`.
    """
    key = initiative_type.strip().lower()
    spec = INITIATIVES.get(key)
    if spec is None:
        return {
            "supported": False,
            "message": (
                f"'{initiative_type}' is not a modelled initiative yet. "
                "Supported: increase line speed, optimise worker shifts, "
                "reduce machine downtime."
            ),
        }

    if magnitude_pct > MAGNITUDE_WARNING_THRESHOLD and not confirmed:
        return {
            "supported": True,
            "needs_confirmation": True,
            "message": (
                f"A {magnitude_pct:.0f}% change is unusually large and may be "
                "unrealistic. Confirm with the user before computing "
                "(re-call with confirmed=true)."
            ),
        }

    saving, assumptions = spec["fn"](magnitude_pct)
    return {
        "supported": True,
        "needs_confirmation": False,
        "initiative_type": key,
        "initiative_label": spec["label"],
        "input_summary": f"+{magnitude_pct:g}%",
        "reference_chain": spec["reference_chain"],
        "assumptions": assumptions,
        "saving": round(saving, 2),
    }
