# Worker C — QA, Review, Release (read-only)

**Runtime cap:** 15 min · **Permission:** read-only · **Stop:** after this artifact

## Selected exact agent files

| Path | Role | Responsibility | Authority | Phase | Output |
|------|------|----------------|-----------|-------|--------|
| `/Users/genghishameha/agency-agents/testing/testing-reality-checker.md` | Reality Checker | Pixel evidence over claims | RO | 2,6,8 | Evidence gate |
| `/Users/genghishameha/agency-agents/testing/testing-evidence-collector.md` | Evidence Collector | Screenshot matrix structure | RO | 2,6 | Matrix paths |
| `/Users/genghishameha/agency-agents/testing/testing-test-automation-engineer.md` | Test Automation | Targeted UI tests, no torture | RO | 6 | Test result |
| `/Users/genghishameha/agency-agents/engineering/engineering-sre.md` | SRE | Deploy parity, one deploy | RO | 7–8 | Deploy gates |
| `/Users/genghishameha/agency-agents/engineering/engineering-devops-automator.md` | DevOps | Render deploy sequence | RO | 7 | Deploy commands |
| `/Users/genghishameha/agency-agents/engineering/engineering-git-workflow-master.md` | Git workflow | Design-only commit | RO | 7 | Clean commit |
| `/Users/genghishameha/agency-agents/testing/testing-test-results-analyzer.md` | Results analyzer | Interpret PASS/PARTIAL | RO | 8 | Verdict |
| `/Users/genghishameha/agency-agents/security/security-appsec-engineer.md` | AppSec | No secrets in design commit | RO | 7 | Security note |
| `/Users/genghishameha/agency-agents/specialized/agents-orchestrator.md` | Orchestrator pattern | Worker bounds | RO | 1 | Process control |
| `/Users/genghishameha/agency-agents/project-management/project-management-studio-operations.md` | Studio ops | Freeze restore criteria | RO | 8 | Freeze status |

## Evidence standards

- Screenshots under versioned dirs; never overwrite prior
- Baseline vs final named distinctly
- Public smoke after deploy of exact SHA

## Screenshot matrix requirements

Viewports: 1920, 1440, 1366, 1024×768, 820×1180, 390×844, 360×740  
Surfaces: login, today, care, people, documents, relay open, coord, handoff, empty, loading, mobile bottom nav

## Test & deployment gates

1. `npm run build` PASS  
2. Targeted vitest (no jump-latest torture)  
3. Design-only git commit  
4. Deploy app service only  
5. Source SHA == deploy SHA  
6. One public visual smoke  
7. API SHA unchanged  

## Process control

- Max 3 RO workers; 1 writer  
- Background workers 0 at phase boundaries  
- No indefinite polls  
