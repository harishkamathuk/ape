# Scenario 5 - Unauthorized Approval/Execution

## Purpose

Prove the canonical decision boundary defers when a non-system actor requests approval/execution authority.

## Invocation

- Command (PowerShell, from `agent/`):
  - `$env:APE_EVIDENCE='1'; npm run test -- lib/services/decisionService.test.ts -t "unauthorized approval is requested"`
- Test name:
  - `defers when unauthorized approval is requested (scenario 5)`

## Payload / Inputs (governance-relevant)

- `authority.actor_role = USER`
- `authority.decision_intent = APPROVE`
- `risk_inputs.rolling_12m_drawdown_pct = 0.1`
- `risk_inputs.risk_capacity_breached = false`

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
      "drawdown_proximity": "Rolling 12-month drawdown 0.1 vs limit 0.2.",
      "risk_capacity_breached": false,
      "notes": "Authority violation detected; decision deferred."
    }
  },
  "inputs_observed": [
    {
      "input_key": "authority.actor_role",
      "value": "USER",
      "source": "request"
    },
    {
      "input_key": "authority.decision_intent",
      "value": "APPROVE",
      "source": "request"
    }
  ],
  "policy_items_referenced": [{ "dpq_id": "DPQ-001" }, { "dpq_id": "DPQ-004" }],
  "warnings": [
    {
      "code": "AUTHORITY_VIOLATION",
      "message": "Unauthorized approval/execution attempt detected.",
      "fields": ["authority.actor_role", "authority.decision_intent"]
    }
  ]
}
```

## Evidence Reference

- Commit hash: `d4270462a2af0a5e4050e889836ca65a29439c1a`
- Test output source: terminal output from the invocation above (captured inline from `APE_EVIDENCE_BEGIN scenario-5-unauthorized-approval-execution` ... `APE_EVIDENCE_END scenario-5-unauthorized-approval-execution`)

## Notes

- The snapshot warning `AUTHORITY_VIOLATION` proves the authority guardrail was evaluated and enforced.
