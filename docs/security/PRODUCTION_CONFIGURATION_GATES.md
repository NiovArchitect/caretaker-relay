# Production Configuration Gates

validateCareProductionConfig() at buildCareApp.

Hard fail (production NODE_ENV): insecure JWT, multi-instance without Redis, lab login in regulated, test verify codes, regulated_ai without BAA flags.

Soft: AI disabled → fixture mode when regulated_restricted without BAA.

Health exposes deployment_config without secrets.
