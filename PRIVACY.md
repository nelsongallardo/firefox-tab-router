# Privacy

Tab Router processes tab URLs locally to choose a destination group. It does not collect or transmit personal data, browsing history, telemetry, or crash reports.

## Local data

- User-created URL rules, destination group names, colors, and the routing enabled setting are saved in Firefox extension local storage.
- Tab URLs and group information are used transiently in memory. They are not saved as a browsing log.
- Errors produce a generic local console message without URLs or exception contents.
- Rules are not synchronized through Firefox Sync. Uninstalling the extension normally removes its local storage.

## Access

The `tabs` permission allows access to the URLs and titles of accessible tabs. The implementation uses URLs and tab metadata needed for routing; it does not use titles. `tabGroups` gives access to group names and state. `storage` saves settings.

No host permissions, content scripts, cookies access, history permission, or remote code are included. Private browsing is disabled. No network request API is used, and the extension’s content security policy sets `connect-src 'none'`.

This describes extension behavior, not all browser activity. Firefox can contact Mozilla for signing checks and other browser services. Downloading a release from GitHub or submitting an add-on to Mozilla is subject to those services’ own policies. A matching page still loads normally in Firefox.

## Updates

For installations from Firefox Add-ons, Firefox manages updates according to your browser settings. Self-distributed builds can be updated manually. Review release notes and source changes before installing a new version. Open source and Mozilla signing are useful checks, not guarantees that software has no defects.
