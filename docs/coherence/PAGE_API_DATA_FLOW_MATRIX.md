# Page / API / Data Flow Matrix

| Surface | Primary APIs | AuthZ | Audit surface |
|---------|--------------|-------|---------------|
| Login/Signup | /auth/login, /auth/register | Credentials | ACCOUNT_*, LOGIN |
| AuthorizationGate | /access-requests, /provisional-recipients | Self | ACCESS_REQUEST_*, PROVISIONAL_* |
| Today | /today, /state | membership | CARE_DATA_VIEW state |
| Care | /profile, notes | min-necessary | CARE_DATA_VIEW profile |
| People | /circle, invitations, /access | membership/control | access, invitations |
| Coordination | /coordination | membership | coordination |
| Documents | domain docs | membership | documents |
| Relay | /answer, /understand | membership + AI gate | relay_answer |
| Notifications | /notifications | principal | notifications |
| Export | /export | export capability | export |

COMPLETE for care product surfaces.
