# Multi-medication referent contract

1. “What medication changes are waiting?” lists each pending candidate distinctly (ordinal 1..n).
2. Ambiguous follow-ups (“When was it reported?”) must clarify which candidate.
3. “The second one” binds focus.selectedMedicationCandidate for subsequent turns.
4. “Has she taken it?” treats pending plan change as not administration history.
5. Recipient switch clears focus (conversation_id is principal×recipient).
6. No silent guessing when ≥2 candidates exist.
