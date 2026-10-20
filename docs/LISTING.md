# Firefox Add-ons listing

## Confirmed brief

Help Firefox users who organise work, study, and projects with native tab groups install Tab Router. Lead with automatic URL routing, then explain local storage, free access, and open source. The store provides the **Add to Firefox** action. Audience familiarity with native groups is assumed; no account or technical setup is required.

## Store metadata

- Name: Tab Router
- Suggested slug: tab-router-native-groups
- Category: Tabs
- License: MIT
- Homepage: https://github.com/nelsongallardo/firefox-tab-router
- Support: https://github.com/nelsongallardo/firefox-tab-router/issues
- Privacy: https://github.com/nelsongallardo/firefox-tab-router/blob/main/PRIVACY.md
- Payment: none
- Firefox desktop: 142+

### Summary

Automatically send links to the right native Firefox tab group. Set local URL rules for work, study, and projects. Free, open source, no tracking.

### Description

Open a link. Land in the right group.

Tab Router sends matching links to your native Firefox tab groups using rules you choose. Keep project pull requests, course pages, and work sites together when you open links from your browser, editor, terminal, or chat app.

GET STARTED
1. Click the Tab Router toolbar button to open settings.
2. Add a website or repository URL and the exact destination group name.
3. Save your changes, then open a matching link.

For example, route https://github.com/example/project to a group named “work”. Pull requests and issues in that repository will follow the same rule. The example is illustrative; no rules are enabled by default.

YOUR RULES, ON YOUR DEVICE
Rules are stored locally. Tab Router has no tracking, analytics, accounts, or extension network requests. It is free and open source. The tabs permission lets it read URLs for matching; tabGroups manages destinations; storage saves your settings. It does not read page contents.

CONTROL WHERE LINKS GO
• Match a whole website or a specific URL path.
• Order rules: the first match wins.
• Preview a link’s destination before opening it.
• Pause automatic routing whenever you want.
• Reuse an open group or create one if needed.

Requires Firefox 142 or later on desktop. Group names are case-sensitive. A matching group in the current window takes priority; otherwise, a unique match in another window receives the tab. Ambiguous matches are left alone. Saved or closed groups are not reopened. Pinned and private tabs are skipped.

Rules apply to new tabs and URL changes; saving does not reorganise all existing tabs. A tab may briefly appear outside its group before moving.

### Reviewer notes

This is readable, unbundled JavaScript. All shipped source is inside extension/. There is no compilation, minification, remote code, or runtime dependency. The ZIP contains the actual source; no separate source build is necessary.

Requires Firefox desktop 142+ for native tab group APIs. No account is needed. Install, open the toolbar settings, and add https://example.com/project → work, then Save changes. Open https://example.com/project/pull/42 and observe the new work group. Open https://example.com/project-other to verify it is not grouped. Disable Automatic routing and save to pause. The website need not exist for URL matching to work.

Permissions: tabs reads URLs and manages matching tabs, tabGroups finds/creates destinations, storage retains local rules. Private browsing is disabled. No host permissions or content scripts. No data is collected or transmitted; CSP blocks extension connections.

Automated validation: 16 Node tests and 7 real Firefox 158 integration checks passed on the identical routing code in 1.0.0. Version 1.0.1 changes only package version metadata; permissions and routing are unchanged.

## Copy choices

Chosen opening: “Open a link. Land in the right group.” It describes the visible result, while the summary names native Firefox groups for search clarity.

Alternatives:
- “Keep project links with their project.” More project-specific; less useful for broader study and personal groups.
- “Let URL rules organise your tab groups.” More explicit about configuration, but less immediate.

CTA candidates for owned documentation: “Add to Firefox” (chosen, matches the store), “Install Tab Router” (clear product name), “Set up your first route” (useful after installation). The AMO button itself is controlled by Mozilla.

Claims are grounded in the manifest, routing implementation, and PRIVACY.md. “No tracking” describes this extension, not Firefox or the linked websites. No security guarantee, usage statistic, or endorsement is claimed.
