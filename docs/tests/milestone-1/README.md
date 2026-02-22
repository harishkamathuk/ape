# Milestone 1 Evidence (Scenarios 3-5)

Proofs are executed via the canonical decision boundary (test harness). Legacy /api/chat is non-authoritative and will be removed.

These proofs are generated from deterministic unit tests that call `runDecision(...)` directly in `agent/lib/services/decisionService.test.ts` with mocked policy/model dependencies.

## Index

- [Scenario 3 - Drawdown breach](./scenario-3-drawdown-breach.md)
- [Scenario 4 - Risk capacity breach](./scenario-4-risk-capacity-breach.md)
- [Scenario 5 - Unauthorized approval/execution](./scenario-5-unauthorized-approval-execution.md)
