# Safe “Set up care for someone new” Flow

1. Entry card → account create (zero recipients)  
2. AuthorizationGate opens on **provisional** mode when intent=`set_up_care`  
3. User enters preferred name + claimed authority only  
4. `POST /provisional-recipients` → status `draft`  
5. No search, no name match, no seed data  
6. Bind/activate only with explicit care_recipient_id later  

P0 invariants preserved: no default Evelyn, no Marcus identity, no package seed fallback.
