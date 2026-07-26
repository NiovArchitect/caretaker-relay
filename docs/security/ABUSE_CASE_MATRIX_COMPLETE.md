# Abuse Case Matrix

| ID | Abuse | Expected | Test |
|----|-------|----------|------|
| A1 | Create account then call /state | 403 | public + unit |
| A2 | Role claim family → Evelyn | 403 | prior release |
| A3 | Unauth /answer | 401 | unit |
| A4 | Wrong household | 403 | redteam |
| A5 | Logout then reuse token | 401 | hardening |
| A6 | Access request without approve | still 403 | prior |
| A7 | Provisional name match steal | no match API | bind explicit only |
| A8 | Daniel invite | 403 | redteam |
| A9 | Export without capability | 403 | hardening |
| A10 | LLM with REQUIRE_BAA | 403 block | unit gate |
| A11 | Access matrix without membership | 403 | prior |
| A12 | Scope edit by non-controller | 403 | hardening |
