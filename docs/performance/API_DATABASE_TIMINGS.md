# API / Database Timings

## Before (public, process warm)
- health: ~0.25s
- login: ~24–26s (dominated by full Prisma care-graph flush)
- register: ~54s (flush + login flush)

## After (expected)
- health: unchanged ~0.25s
- login: bcrypt + foundation session + small audit writes (target << 5s warm)
- register: one structural flush + login without second full flush

Re-measure after deploy; record in JUDGE_BROWSER_PERFORMANCE_RESULTS.json.
