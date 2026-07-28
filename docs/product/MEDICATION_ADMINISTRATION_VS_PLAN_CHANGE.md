# Medication administration vs plan change

| Kind | Example | Event type | Active plan? |
|------|---------|------------|--------------|
| Administration report | “I gave Tylenol 300 mg” | `medication_administration` | No |
| Plan-change report/request | “Please add Tylenol 300 mg” | `task` (needs verification) | No until authorized |
| Recommendation | “Should I give Tylenol?” | `note` (no advice) | No |
| Authorized confirmation | Reviewer confirms plan | Plan update workflow | Yes |

Caregiver chat never silently creates an active medication order.
