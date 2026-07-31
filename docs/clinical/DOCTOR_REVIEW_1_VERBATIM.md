# DOCTOR REVIEW 1 — VERBATIM PHYSICIAN-VALIDATION RULE SET

**Status:** AUTHORITATIVE SOURCE for Doctor Review 1  
**Ingested by:** Agent Zero  
**Ingest date:** 2026-07-30  
**Source type:** Qualified physician-validation (complete paste; not paraphrased)  
**Supersession note:** Sections titled “Updated locked interpretation” and “One adjustment from the earlier interpretation” refine earlier layout guidance. Earlier sections are preserved for lineage; where they conflict on main-page visibility vs Learn more, the updated interpretation controls.

---

## Verbatim text (complete)

This is locked in as the physician-validation rule set for Caretaker Relay.

The doctor’s central judgment is important: the Today screen and overall layout are already strong. The answer is not to crowd Today with an electronic medical chart. The answer is a clean progressive-disclosure system:

Show the caregiver what matters now. Keep the complete clinical picture one tap away.

### 1. Care-recipient identity strip

Beside Evelyn Carter’s name, show:

Evelyn Carter · Age 68

Then add a small, low-screen-real-estate control:

Learn more

That opens a structured care-recipient summary containing:

* Full legal name, preferred name, age and date of birth
* Allergies
* Emergency contact
* Diagnoses
* Code status
* Advance directive, healthcare power of attorney and POLST status
* Baseline orientation
* Mobility and assistance level
* Diet/swallowing status
* Important devices such as oxygen, tracheostomy, feeding tube, catheter or glucose monitor
* Living situation
* Clinical contacts

Privacy rule: particularly sensitive fields must be visibility-controlled by role and consent. Do not ask whether the entire identity panel should be confidential; control each sensitive section according to authorization.

Code-status rule: Relay must understand phrases such as:

* Full code
* DNR / Do Not Resuscitate
* DNI / Do Not Intubate
* Comfort-focused treatment
* Selective treatment
* Advance directive
* POLST

But these cannot be ordinary caregiver-entered labels presented as verified orders. A POLST is a signed medical order, while an advance directive expresses broader wishes and appoints decision-makers; Relay must preserve that distinction and display the document source, signer, effective date and verification state.

### 2. Today remains simple

Today should continue showing only the essentials:

* What needs attention now
* What happens next
* Medications due
* Ordered checks due
* Appointments and transportation
* ADLs or assistance due
* Meals, hydration and diet instructions
* Refills or supplies
* A small personal-engagement item
* Important changes from the person’s normal baseline

It should not put the entire medical history on the page.

Each meaningful Today item may have a small:

Why? or Learn more

For example:

Physical therapy at 3:00 PM  
For recovery following left hip injury  
Weight bearing: as tolerated with walker  
[Learn more]

### 3. Medication answers must become complete

When asked, “What medications is she on?”, Relay should answer with:

* Medication
* Strength
* Dose
* Route
* Frequency
* Exact scheduled times or time windows
* With food / without food
* Reason or linked condition, when verified
* Relevant ordered checks
* Last given
* Next due
* Prescriber
* Refill status
* Source and verification date

A medication list without frequency is incomplete.

However, there is an essential safety boundary: Relay must not independently invent instructions such as checking blood glucose before metformin or checking blood pressure before every blood-pressure medication. It should surface those steps when they are present in a clinician-approved care plan, prescription, standing order or verified protocol. Otherwise it may say:

“No pre-dose blood-glucose instruction is recorded. Check the care plan or confirm with the prescribing clinician.”

Medication reconciliation requires comparing the complete medication regimen against current clinical orders and resolving discrepancies rather than silently inferring instructions.

### 4. The complete clinical picture

The Learn more area should organize—not dump—the following domains:

**Health and treatment**

* Confirmed diagnoses
* Caregiver observations and concerns
* Other comorbidities
* Past injuries
* Surgical history
* Upcoming procedures
* Labs
* Imaging
* Vaccinations
* Current and historical therapies
* Reason for each therapy
* Medical and behavioral-health providers

**Baseline and body systems**

* Mental status and orientation baseline
* Communication ability
* Vision and hearing
* Airway and breathing support
* Oxygen use
* Cardiovascular baseline and recent vitals
* Nutrition, diet, swallowing and feeding route
* Toileting and urinary/bowel status
* Catheters or ostomies
* Skin integrity and wounds
* Pain
* Mobility, transfers and fall risk
* Weight-bearing restrictions
* Assistive devices
* ADL ability
* Sleep and behavioral patterns

**Personal and environmental context**

* Who lives in the home
* Stairs and bedroom location
* Accessibility concerns
* Daily routine
* Hobbies
* Favorite programs, games, music and activities
* Communication preferences
* Religious, cultural and personal preferences when voluntarily shared
* What comforts or upsets the person

Reproductive history—such as pregnancy status, hysterectomy history or last menstrual period—should appear only when clinically relevant, appropriately authorized and actually needed, not as a blanket requirement for every woman.

### 5. “What should I do today?” becomes a real shift plan

This question should produce an actionable, time-aware caregiver plan:

It is 11:00 AM. Here is Evelyn’s current plan:

**Now**

* Check and document the ordered pre-lunch blood glucose.
* Prepare lunch according to her verified diet.

**12:00 PM**

* Give metformin 500 mg with food.

**Before leaving**

* Confirm walker is available.
* Bring therapy paperwork.

**3:00 PM**

* Physical therapy for left hip recovery.

**When there is downtime**

* Evelyn enjoys cards and watches her afternoon program at 1:30 PM.

**Watch for**

* Dizziness after lunch.
* A meaningful change from her normal orientation or mobility.

Every instruction must be traceable to a care plan, verified preference, appointment, medication order or confirmed observation.

### 6. Relay must understand three languages

Relay needs one underlying care model but three communication levels:

Layperson:  
“Can she walk by herself?”

Caregiver:  
“What help does she need getting around?”

Professional:  
“What is her ambulatory and weight-bearing status?”

All must resolve to the same structured information.

Likewise:

* “Is she acting like herself?” → orientation/cognitive baseline
* “What can she eat?” → diet, texture and swallowing status
* “What machines does she use?” → oxygen and medical devices
* “Can she take care of herself?” → ADLs
* “What does she have?” → diagnoses, clearly separated from observations
* “What is her code?” → verified code-status orders and advance-care documents

### 7. The screenshots reveal a serious Relay classification defect

The captured responses show that Relay is treating simple information requests such as:

* “last vitals”
* “vital signs”
* “orientation status”
* “any therapies”
* “surgeries”
* “other comorbidities”

as though the caregiver is trying to submit a new medication or care update.

That is why it repeatedly says:

“I heard you, but I could not form a durable care item…”

This is the wrong intent path.

Relay needs at least these distinct intents:

1. Retrieve existing information
2. Record an observation
3. Report that something occurred
4. Propose or record a plan change
5. Ask what to do today
6. Clarify missing information
7. Communicate with the care team

A read-only query must never produce medication-entry clarification language.

When data are absent, the correct response is:

“No verified surgical history is currently on file for Evelyn.”

Then:

“This is an important gap. An authorized person can add it or request confirmation from her clinician.”

Not:

“Was this taken, refused, missed or discontinued?”

The response to “ambulation or mobility status” also wrongly attempted to create a generic caregiver-reported observation. It should first retrieve verified mobility information. Only after the user reports a new fact—such as “She now needs help walking”—should Relay initiate confirmation and documentation.

### 8. Additional confirmed product defects

The physician found a real action failure:

Selecting I can help on the prescription-refill item returns a JSON body error.

That is a release-blocking workflow defect, not cosmetic feedback. The action must:

* Create or accept the task
* Assign it to the user
* Preserve the prescription/refill context
* Show the next step
* Never expose raw API or JSON errors to the caregiver

Also, when “Is the patient on oxygen?” returned appointments, that indicates an intent/retrieval mismatch and must be included in the semantic regression suite.

### 9. The vetted clinical reference direction

There is not one free “medical reference book” that Caretaker Relay should copy wholesale and use to make care decisions. The strongest approach is a reference stack:

CMS OASIS-E2 for standardized home-health assessment concepts. CMS’s current OASIS-E2 guidance became effective April 1, 2026 and covers structured home-health assessment data.

interRAI Home Care for comprehensive assessment of chronic and post-acute home-care needs, including function, health, supports and service use. Its core-plus-supplement approach closely matches the physician’s recommendation to keep the main view simple and reveal deeper assessment areas only when relevant. Licensing would need to be reviewed before incorporating its actual instrument language or scoring.

AHRQ medication-reconciliation resources for medication completeness, provenance and discrepancy management.

National POLST guidance and applicable state forms for portable medical orders and advance-care distinctions. Caretaker Relay must use the legally applicable state document rather than inventing a universal code-status structure.

These references should shape the information architecture, terminology, completeness checks and provenance rules. They should not turn Relay into an unsupervised diagnostic or treatment engine.

### Final locked principle

Caretaker Relay is not merely a task list and not a miniature hospital chart.

It must become:

A role-aware, plain-language care command center that shows the caregiver what matters now, preserves the full verified care picture behind Learn more, understands both ordinary and clinical language, and never confuses a question with a clinical update.

The physician’s feedback should now be treated as a formal clinical-professional validation artifact and converted into acceptance criteria, regression prompts and release gates—not left as general feedback.

That clarification improves the structure. She is not prescribing one rigid screen layout; she is defining the minimum clinical picture that must be available and giving us freedom to organize it intelligently.

### Updated locked interpretation

The main care-recipient area can show these items directly:

Evelyn Carter · Age 68  
DOB: May 14, 1958  
Code status: Full Code  
Emergency contact: Robert Carter · Son

Allergies should also remain highly visible because they can immediately affect food, medication and care decisions.

Then Caretaker Relay can provide a compact section such as:

History & Physical  
or, for lay users:

Health & Care Details

The label can adapt by role:

* Caregiver view: Health & Care Details
* Clinician view: History & Physical
* Mixed view: Health & Care Details (H&P)

That avoids forcing family caregivers to understand clinical abbreviations while still making the product feel legitimate to medical professionals.

### Recommended structure

**Main page**

Keep the first page operational and immediately readable:

* Name and age
* Date of birth
* Code status
* Allergies
* Emergency contact
* What needs attention today
* Medications due
* Appointments
* Important changes
* Compact access to the full patient profile

**Health & Care Details / H&P**

This becomes the organized clinical and functional picture:

Medical history

* Diagnoses
* Comorbidities
* Previous injuries
* Surgeries
* Allergies
* Vaccination status
* Advance directives

Recent clinical information

* Most recent vital signs
* Most recent labs
* Imaging
* Upcoming procedures
* Relevant clinician notes or instructions

Function and daily living

* Ambulation
* Weight-bearing status
* Transfers
* Assistive devices
* Fall risk
* Bathing
* Dressing
* Toileting
* Eating
* Brushing teeth and oral care
* Grooming
* Level of assistance required

Nutrition

* Regular, soft, minced, puréed or liquid diet
* Oral, feeding tube or intravenous nutrition
* Swallowing restrictions
* Low-sodium, diabetic or other prescribed diet
* Assistance or supervision while eating

Therapies

* Physical therapy
* Occupational therapy
* Speech therapy
* Behavioral or psychosocial therapy
* Why each therapy is occurring
* Frequency and current goals

Baseline status

* Orientation and cognition
* Communication
* Vision and hearing
* Skin condition
* Elimination
* Oxygen and airway support
* Pain baseline

### The important product principle

The physician is essentially saying:

Do not obsess over whether every item has its own page or lives inside H&P. Make sure the full information exists, is logically grouped and can be found quickly.

So we should not build a sprawling navigation system with separate tabs for:

* Labs
* Imaging
* ADLs
* Mobility
* Therapies
* Nutrition
* Surgeries
* Vitals

That could become overwhelming.

Instead, use one well-organized Health & Care Details surface with expandable sections. Vitals or labs can also appear elsewhere when context requires them. For example:

* Today may show an abnormal or overdue blood-pressure check.
* The H&P keeps the recent-vitals history.
* Relay can answer, “What were her last vital signs?”
* A medication card can show the relevant ordered check.

The same information can have multiple contextual entry points without creating conflicting copies of the truth.

### One adjustment from the earlier interpretation

Her clarification means Learn more does not need to hide every patient detail. The essential identity and safety information can remain directly visible on the main page. Learn more—or the H&P control—should reveal the comprehensive picture.

So the refined rule is:

Identity and immediate safety information stay visible. Full medical and functional history stays one tap away.

This addition is now part of the locked physician-validation requirements.

---

## Lineage / supersession map

| Earlier section | Later clarification | Controlling rule |
|-----------------|---------------------|------------------|
| §1: Age beside name + Learn more for allergies, code status, emergency contact | Updated locked interpretation: DOB, code status, emergency contact, allergies may be **directly visible** on main page | **Updated locked interpretation** |
| §1/§4: Full clinical picture only behind Learn more | Same progressive disclosure, but essential safety strip is not hidden | Safety strip visible; full H&P one tap away |
| §4 domain list | Recommended structure organizes domains under Health & Care Details / H&P with expandable sections, not separate tabs | **Recommended structure** + no navigation sprawl |
| Final locked principle | Unchanged by layout clarification | Still authoritative product principle |

## End of verbatim ingest
)
