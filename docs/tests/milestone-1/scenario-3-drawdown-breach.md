# Scenario 3 - Drawdown Breach

## Purpose

Prove the canonical decision boundary defers when rolling 12-month drawdown exceeds the policy maximum.

## Invocation

- Command (PowerShell, from `agent/`):
  - `$env:APE_EVIDENCE='1'; npm run test -- lib/services/decisionService.test.ts -t "drawdown exceeds policy maximum"`
- Test name:
  - `defers when drawdown exceeds policy maximum (scenario 3)`

## Payload / Inputs (governance-relevant)

- `risk_inputs.rolling_12m_drawdown_pct = 0.3`
- `risk_inputs.risk_capacity_breached = false`
- Policy mock (`policyLoader`) sets `max_rolling_12m_drawdown_pct = 0.2`

## Expected Outcome (deterministic)

- `recommendation.type = DEFER_AND_REVIEW`

## Decision Snapshot Excerpt (evaluation + provenance proof)

```json
{
  "outcome_state": "ERROR_NONRECOVERABLE",
  "recommendation": { "type": "DEFER_AND_REVIEW" },
  "governance": {
    "investment_policy": {
      "policy_id": "ape-policy",
      "policy_version": "0.1-test",
      "policy_source": "test"
    }
  },
  "evaluation": {
    "policy_applied": {
      "status": "blocked",
      "risk_guardrails_used": ["DPQ-004"],
      "evaluated_policies": ["DPQ-001", "DPQ-004", "DPQ-002", "DPQ-003"]
    },
    "risk_checks": {
      "drawdown_proximity": "Rolling 12-month drawdown 0.3 vs limit 0.2.",
      "risk_capacity_breached": false,
      "notes": "Risk guardrail breach detected; decision deferred."
    }
  },
  "inputs_observed": [
    {
      "input_key": "risk_inputs.rolling_12m_drawdown_pct",
      "value": 0.3,
      "source": "request"
    },
    {
      "input_key": "risk_inputs.risk_capacity_breached",
      "value": false,
      "source": "request"
    }
  ],
  "policy_items_referenced": [{ "dpq_id": "DPQ-001" }, { "dpq_id": "DPQ-004" }]
}
```

## Evidence Reference

- Commit hash: `PENDING_COMMIT_HASH`
- Test output source: terminal output from the invocation above (captured inline from `APE_EVIDENCE_BEGIN scenario-3-drawdown-breach` ... `APE_EVIDENCE_END scenario-3-drawdown-breach`)

## Notes

- The mock model proposed `REBALANCE`; deterministic guardrails overrode to `DEFER_AND_REVIEW`, which is reflected in the snapshot excerpt.
