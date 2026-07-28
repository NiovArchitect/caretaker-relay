# Screen purpose and signal budgets

Contract module in app: `src/lib/pagePurpose.ts`

| Screen | Purpose question | Primary budget |
|--------|------------------|----------------|
| Today | What matters now? | 5 |
| Care | What is the current care picture? | 8 |
| My shift | What must I do this assignment? | 6 |
| Tasks / open work | Who owns what? | 8 |
| Schedule | What is happening and when? | 8 |
| Notifications | What needs acknowledgment? | 5 |
| People | Who is authorized or assigned? | 10 |
| Privacy | Who can access what and why? | 10 |
| Documents | What sources await review? | 6 |
| Relay | What can I ask, report, or do? | 4 |

## Rules

- One primary purpose per screen  
- Duplicate care facts collapsed or linked  
- No raw internal enums, intent names, or receipt destination IDs in UI  
- Pending vs active medication always distinguishable on Care  
- History and density beyond budget → collapse / history  

## Enforcement status

| Area | Status |
|------|--------|
| Purpose leads on Today, Care, People, Privacy, Documents, Relay | shipped |
| Today needsYou / notification caps | shipped |
| Full page-by-page density re-census | partial |

Founder phone remains required for mobile density truth.  
