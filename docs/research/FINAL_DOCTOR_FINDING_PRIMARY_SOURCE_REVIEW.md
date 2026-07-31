# FINAL DOCTOR FINDING PRIMARY SOURCE REVIEW

## Physician artifact

Primary clinical-professional source is the qualified physician-validation paste preserved in:

- `docs/clinical/DOCTOR_REVIEW_1_VERBATIM.md`
- `docs/clinical/DOCTOR_REVIEW_2_VERBATIM.md` (layout supersession)

These are **not** statute and **not** automatic universal clinical law. They are formal validation inputs converted to product acceptance criteria after applicability analysis.

## Official reference stack (physician-directed)

| Reference | Use in Relay | Do not use for |
|-----------|--------------|----------------|
| **CMS OASIS-E2** (effective 2026-04-01 per physician note) | Home-health assessment concepts, structured domains, terminology alignment | Automated scoring as treatment decisions |
| **interRAI Home Care** | Core-plus-supplement IA matching progressive disclosure | Copying instrument language/scoring without **license review** |
| **AHRQ medication reconciliation** | Completeness, provenance, discrepancy management patterns | Silent inference of missing orders |
| **National POLST + state forms** | POLST vs advance directive distinction; portable orders | Inventing a universal code-status schema |

## Applicability discipline

1. Extract finding exactly  
2. Understand clinical context  
3. Determine software vs policy vs legal vs qualified-human  
4. Reproduce public gap when claiming product defect  
5. Repair lowest correct layer  
6. Never make AI clinical authority  

## Research residual

| Item | Status |
|------|--------|
| interRAI licensing | EXTERNAL — legal review required |
| State POLST form pack | EXTERNAL — jurisdiction config |
| OASIS-E2 field mapping matrix | RESEARCH_IN_PROGRESS (IA only) |
| AHRQ med-rec discrepancy UI | DESIGN_REQUIRED |

**As of ingest date 2026-07-30:** CMS OASIS-E2 effective date cited by physician (April 1, 2026) is treated as physician-supplied reference direction; official CMS page revalidation recommended before claiming regulatory compliance.
