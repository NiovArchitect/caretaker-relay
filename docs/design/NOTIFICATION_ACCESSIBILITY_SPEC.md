# Notification Accessibility Spec

**Product:** Caretaker Relay  
**Visual baseline:** Approved glass/premium system (do not redesign brand)  
**Authority:** WCAG 2.2 + founder observations

---

## Principles

1. **Color is never the only signal.**  
2. **Icons + labels + text + border shape** carry meaning.  
3. **Motion is optional enhancement**, never required for understanding.  
4. **Connection status** (system) must not compete with care urgency.

---

## Notification anatomy

| Field | Required | Notes |
|-------|----------|-------|
| Icon | Yes | Kind glyph or symbol |
| Kind label | Yes | e.g. Medication, Appointment |
| Title | Yes | Plain language |
| Description | Yes | What / why / next |
| Severity border | Yes | Left edge + class |
| Action | Yes | Real navigation/action |
| Acknowledge | Recommended | Stops pulse |
| `role="status"` / sr-only severity | Yes for urgent | Screen reader |

---

## Severity (not color-only)

| Severity | Border | Label text | Motion |
|----------|--------|------------|--------|
| urgent | Rose left border | “Medication” / “Urgent care attention” | Slow glow (optional) |
| attention | Coral left border | Kind label | None by default |
| info | Teal left border | Kind label | None |

Connection: cool teal-green chip + “Connected” text — **not** the same rose/coral care palette.

---

## Ambient pulse rules

Allowed for **unacknowledged urgent** items only:

- Period ≥ 3s (implementation: 3.2s ease-in-out)  
- Opacity / soft box-shadow only  
- No strobe, no rapid invert  
- **Never > 3 flashes/sec**  
- On acknowledge: stop pulse  
- `@media (prefers-reduced-motion: reduce)`: animation **off**; static double border emphasis instead  

---

## Kind catalog

- medication_due  
- appointment_soon  
- verification_needed  
- care_update  
- handoff_ready  
- provider_update  
- access_invitation  
- important_change  

---

## In-product only (this build)

Label only what exists:

- **In-app notification** — implemented  
- Browser Notification API — not requested on first load  
- Email/SMS/mobile push — not claimed  

---

## QA checklist

- [ ] Color-blind simulation: kinds still distinguishable via icon + label  
- [ ] Reduced motion: no pulse animation; static urgent state remains  
- [ ] Keyboard: attention actions reachable  
- [ ] Screen reader: severity/kind announced  
- [ ] Connection chip never uses rose urgency styling  
