# Personalized Relay fallback contract

## Prohibited cold phrases (when recipient known)

- “I don’t have enough information.”  
- “What would you like to update?”  
- Bare “I can help with medications, appointments, and handoffs.”  

## Required pattern

1. State what was understood (name recipient)  
2. Preserve safe facts when possible  
3. Name the exact ambiguity  
4. One focused question  
5. Explain next result  

Implemented in `buildPersonalizedClarification` (fixture path) and expected from Grok `uncertainties` / candidate labels (Mode B).  
