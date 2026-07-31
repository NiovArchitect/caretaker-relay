# FINAL CODE STATUS PROVENANCE CONTRACT

## Distinctions

| Type | Meaning |
|------|---------|
| POLST | Portable medical order when valid in jurisdiction |
| ADVANCE_DIRECTIVE | Wishes / broader intent |
| HCPOA | Decision-maker authority |
| CODE_STATUS_ORDER | Other signed order |
| CAREGIVER_REPORT | Unverified — never act as order |

## Fields

documentType, jurisdiction, sourceDocument, signer, signerRole, signedDate, effectiveDate, verificationState, reviewedDate, supersession, storageReference, currentStatusSummary

## Display states

verified_medical_order · reported_unverified · document_missing · superseded · revoked · expired

## Gates

POLST/AD conflation: 0  
Caregiver-entered code status as verified order: 0  
Universal invented national POLST schema: forbidden  

State-form packs: EXTERNAL / research residual.
