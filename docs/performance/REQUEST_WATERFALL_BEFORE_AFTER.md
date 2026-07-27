# Request Waterfall Before / After

## Before
1. Login mount: warm + lab-principals (ok)
2. Login submit: **await warmCareApi** then login (serial)
3. Login success: full store flush (API) ~24s
4. Today: projection then secondary sequential

## After
1. Login mount: fire-and-forget warm + principals
2. Login submit: immediate login (no await warm)
3. Login success: audit-only flush
4. Today: shell paint + parallel secondary domains

Bootstrap request sources audited: App notif poll 15s, Today once, Login principals once.
