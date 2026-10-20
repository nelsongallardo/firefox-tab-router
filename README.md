# Tab Router for Firefox

Open a project link from your terminal, editor, chat app, or browser and have it land in the right **native Firefox tab group**.

Tab Router matches URLs against rules you define locally. For example:

| Website or repository URL | Destination group |
| --- | --- |
| `https://github.com/example/startup` | `startup` |
| `https://university.example/course` | `masters` |
| `http://localhost:3000` | `development` |

Plain JavaScript. No runtime dependencies, remote code, analytics, or network requests. Firefox desktop **142 or newer**.

## Install

This extension is distributed **unlisted**: Mozilla signs it, but it does not appear in the public Firefox Add-ons catalogue. Its source is public here.

1. Download the signed `.xpi` from [GitHub Releases](https://github.com/nelsongallardo/firefox-tab-router/releases), when available.
2. In Firefox, open `about:addons`, choose the gear menu → **Install Add-on From File**, and select the `.xpi`.
3. Review the permissions and install.
4. The settings page opens. Add a URL and the exact name of your existing group, then **Save changes**.
5. Open a matching link from another app to try it.

An unsigned `.zip` is a submission/development package, **not** an installable release for normal Firefox. For development, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `extension/manifest.json`. Temporary installation lasts until Firefox restarts.

Updates are manual: install a newer signed `.xpi` with the same extension ID. Your saved rules are retained. There is no automatic update endpoint.

## Rules and behavior

- Enter a full `https://` or `http://` URL. A rule matches the exact origin and the specified path plus its descendants.
- `https://github.com/example/project` matches the repository root, `/pull/42`, and `/issues/1`. It does **not** match `project-other`, another hostname, or HTTP.
- Query strings and fragments in opened links are ignored. Rule URLs themselves cannot contain queries, fragments, credentials, or wildcards. Paths are case-sensitive; hostname case is normalized.
- Rules run top to bottom; the first match wins. Use the arrow buttons to reorder them.
- Group names are exact and case-sensitive. Existing group colors are preserved; color settings apply to newly created groups.
- An existing group in the tab’s window wins. Otherwise a single matching group in another window receives the tab. Active tabs from the focused window bring that destination window forward; background tabs do not.
- If multiple other windows contain the same group name, the tab stays put and the toolbar displays `?`. Give those groups distinct names. A subsequent successful route clears the badge.
- If there is no matching open group, the extension creates one in the tab’s window. **Saved and closed groups are not restored**; a new group may share their name.
- Pinned and private tabs are skipped. Private browsing is disabled in the manifest.
- Routing happens on tab creation and URL changes. A tab may briefly appear outside its destination group before it is moved.
- Saving rules does not sweep existing tabs into groups. Firefox session restore can emit tab creation events and therefore trigger routing.
- Manual regrouping is respected until a tab’s URL changes again. Navigating an existing tab to another matching project can move it.
- No automatic collapsing, tab deletion, duplicate removal, container switching, or browser-profile switching.

Use the **test URL** field to preview a destination without opening or moving a tab. Disable **Automatic routing** and save to pause.

## Privacy and permissions

| Permission | Purpose |
| --- | --- |
| `tabs` | Read tab URLs to match rules and manage matching tabs. This permission also technically exposes tab titles, although Tab Router does not use them. |
| `tabGroups` | Find groups by name and create/update routing destinations. |
| `storage` | Save rules and the enabled/paused setting on this device. |

There are no host permissions or content scripts. The extension does not read page contents, cookies, passwords, or GitHub API tokens. It needs no GitHub login of its own.

Rules are stored in `browser.storage.local`, not Firefox Sync. URLs are processed in memory; browsing history is not recorded. A restrictive content security policy blocks extension-originated connections. See [PRIVACY.md](PRIVACY.md) for scope and limitations.

## Development

Requires Node.js 22+ and Firefox desktop.

```sh
npm ci
npm run check
npm run build
npm start
```

`npm start` uses Mozilla’s `web-ext` tool and a separate temporary Firefox profile. Never use `--keep-profile-changes` with your everyday profile.

The files under `extension/` are the shipped source. There is no bundler or transpilation. `web-ext` is a development dependency only. `npm run build` creates an unsigned ZIP in `artifacts/`.

### Layout

```text
extension/
  manifest.json       Permissions, metadata, and entry points
  rules.js            URL validation and boundary-aware matching
  router.js           Serialized tab/group operations
  background.js       Firefox event listeners
  options.*           Local rule editor and preview
  icon.svg            Extension icon
test/                 Node tests with a mocked Firefox API
docs/                 Signing, release, and manual QA instructions
```

The router serializes operations to avoid duplicate groups when several links open together, re-reads tab state before mutation, and continues processing after an API error. Tests cover URL boundaries, concurrent routing, focus behavior, ambiguous groups, settings changes, and stale events. Mock tests complement real-browser checks; they do not prove Firefox API compatibility.

## Signing and releases

See [docs/RELEASING.md](docs/RELEASING.md) for Mozilla’s unlisted signing process, secret handling, and the release checklist. See [docs/TESTING.md](docs/TESTING.md) for browser checks.

## Contributing

Open an issue with your Firefox version and a minimal example using non-sensitive URLs. Run `npm run check` before submitting a pull request. Keep runtime code dependency-free and avoid adding network access or broad permissions without a clear use case.

For security reports, use the repository’s private vulnerability reporting feature; see [SECURITY.md](SECURITY.md). Do not post private URLs or credentials in public issues.

## License

[MIT](LICENSE). An independent project; not affiliated with Mozilla.
