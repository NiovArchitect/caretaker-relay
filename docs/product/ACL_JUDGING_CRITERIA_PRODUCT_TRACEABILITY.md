# ACL judging criteria → product capability traceability

**Product center:** Care recipient (not caregiver-private chatbot)  
**Live app:** https://care.niovlabs.com @ `95b5e687`  

## Criteria matrix

| ACL lens | Product evidence | Status |
|----------|------------------|--------|
| **A. Responsiveness to need** | Today priorities; handoffs; coverage timeline; Relay operating-plan answers; appointment logistics; work ownership | PASS |
| **B. Caregiver burden reduction** | Signal-first Today; Relay answers without screen search; message/schedule previews; cancel drafts; no meal misroute for chat actions | PASS |
| **C. Quality / continuity of care** | CareCoverageTimeline previous/current/next; handoff lifecycle; appointment lineage; med report vs plan boundary | PASS |
| **D. User-centered implementation** | Lab plain language; human times; identity names; work clarity labels; no required workflow enums for primary paths | PASS |
| **E. Usability / integration** | Mobile/desktop public paths; multi-role shells; multi-recipient switch isolation | PASS |
| **F. Transparency** | Verify panel source/status; operational previews state in-app vs external; schedule “internal only” | PASS |
| **G. Human-in-the-loop** | Looks right / Correct / **Cancel** on drafts; handoff ack separate from task accept | PASS |
| **H. Privacy / dignity / choice** | Recipient-scoped rid(); conversation partition; multi-recipient isolation; self-create has no care access | PASS |
| **I. Evidence / safety** | Med discrepancies block inventing dose; no silent care-truth writes; epistemic labels | PASS |
| **J. Collaboration** | In-app care-team message route; coverage-grounded previous/next; handoff collaboration objects | PASS (governed internal messaging; no false SMS) |
| **K. Scalability** | Not hard-coded UI journeys; router classifies natural language; coverage/timeline server authority | PASS with synthetic lab scale |

## Collaboration model (recipient-centered)

- Active recipient + principal + coverage drive projections (not login order).  
- Previous caregiver answers use timeline.previous (e.g. Daniel Kim hours).  
- Next caregiver / handoff use timeline.next and handoff lifecycle.  
- Role-to-role: in-app notifications only unless external delivery configured.  

## Unsupported / not claimed

- External SMS/email delivery  
- External clinic booking systems  
- BAA / production PHI  
- Full 200-utterance automated bank (founder 7 + regression banks exist; expand as follow-on)

**ACL CRITERIA WITHOUT PRODUCT EVIDENCE: 0** (each row has concrete product surface)
