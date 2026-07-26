# Startup / Network Audit
- Login API can cold-start on free Render tier
- UI stayed on login form during wait (until #310 blanked everything after partial success)
- LoginGate now keeps form visible with wait hint and try-again messaging
