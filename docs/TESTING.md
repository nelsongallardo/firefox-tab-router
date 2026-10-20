# Testing

## Automated checks

```sh
npm ci
npm run check
npm run build
```

Node tests use an in-memory browser adapter. Mozilla’s `web-ext lint` validates the package and API compatibility against the manifest’s minimum Firefox version.

Run `npm run test:firefox` for live integration checks in a disposable headless Firefox profile. Set `FIREFOX_BINARY` if needed (on macOS, `/Applications/Firefox.app/Contents/MacOS/firefox`). The runner copies the extension into a temporary directory and adds a **test-only** localhost reporting endpoint; those permissions and harness files are never packaged. It exercises the real background listeners, concurrent group creation, URL boundaries, pinned tabs, manual moves, cross-window routing, and pause behavior.

## Firefox checks before a release

Use a disposable profile (`npm start`) and example URLs, not your everyday browser session.

1. Confirm installation opens settings; add `https://example.com/project` → `work` and save. Reload settings and confirm persistence.
2. Test matching `/project/pull/1`, root `/project`, and nonmatching `/project-other` in the preview.
3. Open a matching tab. Confirm `work` is created and the tab is placed inside it. The page can return 404; routing uses the URL.
4. Open another matching link. Confirm the existing group is reused with its color preserved.
5. Open several matching tabs rapidly. Confirm a single destination group.
6. Create `work` in another window only; open a matching link in the first window. Confirm it moves and an active link is visible.
7. Create `work` in two other windows. Confirm routing leaves a matching tab untouched and shows `?` on the toolbar.
8. Pin a tab, then navigate it to a matching URL. Confirm it stays pinned. Confirm the add-on cannot run in private windows.
9. Manually move a routed tab out of its group. Confirm it stays there until the URL changes.
10. Pause and save. Confirm new matching links remain in place.
11. Add two overlapping rules, reorder them, and use the preview to confirm first-match behavior. Remove a rule and save.
12. Try malformed rule URLs and empty group names; confirm settings are not saved.
13. Check settings at narrow and wide widths and in light/dark mode. Confirm keyboard focus is visible and all controls have labels.
14. Install the signed XPI in normal Firefox. Open a matching link from another app, then restart Firefox and confirm the extension and rules persist.

Record the version, environment, checks performed, and any checks not performed in release notes. Do not claim mocked tests are live Firefox integration tests.
