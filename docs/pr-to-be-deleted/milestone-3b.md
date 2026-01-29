
## PR description + merge commit message

### PR Title

**Milestone 3b: strengthen snapshot correctness and deterministic guardrails**

### PR Description

#### Overview

This PR completes Milestone 3b by making Decision Snapshot output **correct, complete, and deterministic** when a structured `portfolio_state` is provided. It further constrains the LLM to narrative/recommendation duties and introduces guardrails that reject outputs that contradict policy or deterministic evaluation.

#### Key changes

* Added/strengthened **portfolio_state validation** (manual structured input)
* Snapshot now includes `evaluation.policy_applied` (targets, bands, risk guardrails)
* Enforced rule: **if portfolio_state exists, never ASK for weights**
* Added contradiction checks between:

  * drift/bands/cashflows (deterministic)
  * model recommendation/actions (probabilistic)
    Invalid outputs fall back to safe recommendations with an explicit reason.
* Maintained robust JSON parsing/fallback behavior (no 500s on malformed model output)
* Added smoke-test runbook for 3 canonical scenarios

#### Non-goals

* No persistence or outcome tracking
* No monitoring/notifications
* No policy markdown interpreter
* No execution/trade exports

#### Testing

* Manual smoke tests for 3 canonical scenarios:

  1. In-band/no cashflows → DO_NOTHING
  2. Out-of-band/no cashflows → REBALANCE
  3. In-band + contribution → REBALANCE_VIA_CONTRIBUTIONS
* Confirmed policy provenance logging and fallback reason logging

### Merge commit message (squash merge)

**`feat(m3b): enforce snapshot correctness and deterministic guardrails`**

If you prefer “chore”:
**`chore(m3b): harden decision snapshot validation and guardrails`**

---
