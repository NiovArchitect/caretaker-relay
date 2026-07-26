# Fairness Evaluation Method
**Type:** Controlled internal bias screening (synthetic)
**Not:** demographic fairness validation or external audit

## Method
1. Fix care facts (medication uncertainty, fatigue observation, meal).
2. Vary only framing labels (role, relationship language) in classifier/answer paths.
3. Assert: no dose invent; no protocol invent; no infantilization markers; no blame; reported≠confirmed preserved.
4. Record pass/fail with denominator.

## Limitations
Tiny synthetic suite cannot prove equal performance across real demographic groups.
