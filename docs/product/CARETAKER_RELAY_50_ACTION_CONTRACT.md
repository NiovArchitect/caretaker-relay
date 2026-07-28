# Caretaker Relay — 50 action category contract

**Levels:** A fully executable · B draftable · C reportable · D review-required · E unsupported  

| # | Category | Level | Executor | Saved | Surfaces | Handoff |
|---|----------|-------|----------|-------|----------|---------|
| 1 | Med administration | C | care confirm loop | med record + event | Care meds, timeline, Relay | whatChanged |
| 2 | Med refusal | C | confirm loop | note event | Today, Care, Relay | stillNeeds |
| 3 | Med missed | C | confirm loop | note event | Today, Care, Relay | stillNeeds |
| 4 | Med uncertain admin | C/D | confirm loop | note UNCERTAIN | Care, review | stillNeeds |
| 5 | Possible duplicate dose | C/D | confirm loop | note | Today, Care | stillNeeds |
| 6 | Med plan change | D | confirm → task | task pending | Care pending, Today | stillNeeds |
| 7 | Med discontinuation | D | confirm → task | task pending | Care pending, Today | stillNeeds |
| 8 | Med time change | D | confirm → task | task | Care, Schedule | stillNeeds |
| 9 | Supply low | A/C | confirm → task | task | Open work, Today | stillNeeds |
| 10 | Refill follow-up | B | task + notify | task | Open work | optional |
| 11 | Effect after medication | C | confirm → observation | observation | Care, Today, Relay | watch |
| 12 | Med correction | C | correction path | supersede event | Care history | whatChanged |
| 13 | Med review request | B | notify + task | notification | Notifications | stillNeeds |
| 14 | Fever observation | C | confirm | observation | Today, Care | watch |
| 15 | Pain observation | C | confirm | observation | Today, Care | watch |
| 16 | Fatigue observation | C | confirm | observation | Care | watch |
| 17 | Mood observation | C | confirm | observation | Care | optional |
| 18 | Behavior observation | C | confirm | observation | Care, handoff | watch |
| 19 | Sleep observation | C | confirm | observation | Care | optional |
| 20 | Meal recorded | C | confirm | meal | Care, Today | whatChanged |
| 21 | Meal refusal | C | confirm | observation/note | Today, Care | stillNeeds |
| 22 | Hydration | C | confirm | observation | Care | optional |
| 23 | Mobility | C | confirm | observation | Care, handoff | watch |
| 24 | Toileting | C | confirm | observation | Care | optional |
| 25 | Skin concern | C/D | confirm | observation | Care, Today | stillNeeds |
| 26 | Fall / incident | C/D | confirm + notify | observation high | Today, notify | stillNeeds |
| 27 | Symptom improved | C | confirm | observation | Care, Relay | whatChanged |
| 28 | Symptom worsened | C/D | confirm | observation | Today, handoff | stillNeeds |
| 29 | Appointment request | B | schedule proposal | proposal | Schedule, Today | optional |
| 30 | Appointment reschedule | B | schedule transition | appointment | Schedule | whatChanged |
| 31 | Appointment cancel | B | schedule transition | appointment | Schedule | whatChanged |
| 32 | Provider confirmation request | B | notify/task | update | Notifications | stillNeeds |
| 33 | Transport task | A/B | open work | work_item | Open work, Schedule | stillNeeds |
| 34 | Transport reassignment | A | open work reassign | work_item | Open work | stillNeeds |
| 35 | Leave-by reminder | B | reminder | reminder | Schedule | optional |
| 36 | Day-before reminder | B | reminder | reminder | Schedule | optional |
| 37 | Create task | A | open work create | work_item | Open work, Today | stillNeeds |
| 38 | Assign / claim task | A | open work claim | work_item | Open work | stillNeeds |
| 39 | Accept task | A | open work accept | work_item | Open work | optional |
| 40 | Decline task | A | open work decline | work_item | Open work | stillNeeds |
| 41 | Clarify task | A | open work clarify | work_item | Open work | stillNeeds |
| 42 | Reassign task | A | open work reassign | work_item | Open work | stillNeeds |
| 43 | Escalate task | A | open work escalate | work_item | Open work, notify | stillNeeds |
| 44 | Complete task | A | open work complete | work_item | Open work | whatChanged |
| 45 | Generate / send handoff | A | handoff lifecycle | handoff | My shift, Today | self |
| 46 | Acknowledge handoff | A | handoff transition | handoff | My shift | clears pending |
| 47 | Invite helper | A | invite API | invitation | People | N/A |
| 48 | Request / revoke access | D/A | access APIs | membership | People, Privacy | audit |
| 49 | Document fact candidate | D | documents + review | candidate | Documents | optional |
| 50 | External book / clinical order | E | honest decline | none or draft note | Relay message | N/A |

**Rule:** A and C may complete with caregiver confirm of a report. D never mutates active medication plan without authorized review. E never claims success.
