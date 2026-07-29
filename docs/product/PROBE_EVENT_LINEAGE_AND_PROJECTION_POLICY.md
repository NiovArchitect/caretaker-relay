# Probe event lineage and projection policy

## Lineage classes
- intentional_demo_story — may appear in demo projections
- automated_test_probe — exclude from primary UI projections
- smoke_harness — exclude
- performance_probe — exclude
- developer_seed — exclude unless intentional demo
- user_entered_synthetic — keep

## Implementation
`isSmokeResidueLine` + `isProbeExcludedEvent` filter Relay RECENT_CHANGES, Today attention, notification badge groups.

Audit/raw store rows are not deleted.
