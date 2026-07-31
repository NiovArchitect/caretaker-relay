# FINAL CLINICAL CHARTING COMPLETENESS CONTRACT

**Purpose:** Physician-validated completeness rules for medication, observation, and profile answers.  
**Authority boundary:** Completeness checks never invent clinical content.

## Medication list completeness

A medication answer is **incomplete** without:

| Field | Required |
|-------|----------|
| Medication name | Yes |
| Strength | Yes when on file |
| Dose | Yes when on file |
| Route | Yes when on file |
| Frequency | **Yes — list without frequency is incomplete** |
| Scheduled times / windows | Yes when on file |
| With / without food | When on file |
| Reason / linked condition | When **verified** |
| Ordered checks | Only when in care plan / order / protocol |
| Last given | When charted |
| Next due | When schedulable |
| Prescriber | When on file |
| Refill status | When on file |
| Source + verification date | Yes when asserting plan truth |

### Forbidden invention

- Pre-dose BG before metformin unless ordered  
- Pre-dose BP before antihypertensives unless ordered  
- Silent inference during reconciliation  

**Allowed gap copy:**

> No pre-dose blood-glucose instruction is recorded. Check the care plan or confirm with the prescribing clinician.

## Observation vs retrieve

| User act | System path |
|----------|-------------|
| “last vitals” / “surgeries” / “oxygen?” | INFORMATION_QUERY → retrieve |
| “She now needs help walking” | CARE_REPORT → confirm → document |
| “I gave metformin…” | Administration / PRN path (existing) |

## Missing data states

| State | Response pattern |
|-------|------------------|
| Absent | “No verified X is currently on file for {name}.” |
| Unverified | “Notes exist but are not verified orders.” |
| Unauthorized | “You are not authorized to view X.” |

Never: “Was this taken, refused, missed or discontinued?” for a pure retrieve.

## PRN completeness (locked prior contract)

Reason + result remain required for PRN episode completeness per `FINAL_PRN_MEDICATION_CHARTING_CONTRACT.md`. This doctor campaign does not reopen PRN architecture.

## False complete charts

A chart surface is **false complete** if it:

- Shows invented code status  
- Shows meds without frequency as “complete”  
- Treats observations as diagnoses  
- Claims POLST without signer/source/date  
- Marks gaps as empty success without gap language  
