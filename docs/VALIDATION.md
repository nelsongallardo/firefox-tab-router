# Validation record

## 1.0.0 — 2026-10-20

- Node.js 22.22.3: 16 automated unit/adapter tests passed.
- Mozilla `web-ext` 10.8.0: lint passed with zero errors, notices, or warnings.
- Real Firefox 158.0 on macOS, disposable headless profile: seven integration checks passed using the actual extension event listeners.
  - First matching tab creates a native group.
  - Concurrent tab events reuse that group.
  - Similar repository names do not match.
  - Pinned tabs remain pinned.
  - Manual moves persist until a URL change.
  - Links from another window join the unique existing group.
  - Pausing takes effect for new tabs.
- The integration harness waits for the install-time settings page before creating tabs, because Firefox can reuse a loading tab when opening that page.
- The packaged ZIP contains only the eight files in `extension/`. Development dependencies and the test-only localhost reporting code are excluded.

The declared minimum is Firefox 142, validated by Mozilla’s linter; live tests were performed on Firefox 158, not every supported release. Ambiguous-window behavior and stale-event cancellation are covered by mocked tests. Manual visual QA and signed-install verification are recorded separately when performed.
