# Unlisted signing and releases

Mozilla signing is required for normal Firefox installations. **Unlisted** means self-distributed: the add-on is signed by Mozilla but absent from its public catalogue. Public source and GitHub release downloads are compatible with unlisted distribution.

## First submission through the browser

1. Run `npm ci`, `npm run check`, and `npm run build`.
2. Complete [the real-browser checks](TESTING.md).
3. Sign in at the [Mozilla Developer Hub](https://addons.mozilla.org/developers/).
4. Choose **Submit a New Add-on**. Review any developer agreement yourself.
5. Select **On your own** (unlisted/self-distribution).
6. Upload `artifacts/tab_router-1.0.0.zip` (use the current version’s filename).
7. The package contains readable source directly; no compilation, minification, or generated code is used.
8. Complete any required metadata. Declare no data collection. Submit for signing.
9. Wait for Mozilla validation/review. Do not describe an unsigned or pending package as signed.
10. Download the signed `.xpi`, install it, and test a matching external link.

If Mozilla requests source files, upload a source archive of the exact release commit. No build step is needed for the extension itself.

## CLI signing

API credentials are created in the Developer Hub. Keep them in a secret manager or local shell environment, never in this repository, command history, screenshots, issues, or chat.

`web-ext` reads `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` from the environment:

```sh
npm run sign
```

The package script explicitly passes `--channel unlisted`. An initial submission may require additional metadata; follow `web-ext`’s response or use the browser workflow. API availability is not a guarantee of immediate signing.

## Versioning and publication

1. Increment the version in `extension/manifest.json` and `package.json` and update `package-lock.json`.
2. Update `CHANGELOG.md`, run checks and browser QA, then commit.
3. Build and sign that exact source state. Keep the ID `tab-router@nelsongallardo` unchanged.
4. Verify the downloaded `.xpi` contains Mozilla signature files under `META-INF/` and the expected manifest. Install it in Firefox for actual signature verification.
5. Create a Git tag and GitHub release for the tested commit. Attach only the signed `.xpi` as the installable artifact, plus its SHA-256 checksum. Label unsigned submission ZIPs clearly if attaching them.
6. Include test results and known limitations in release notes.

No `update_url` is configured. Users install updates manually through **Install Add-on From File**; the same ID preserves settings. Adding automatic updates would need a separately reviewed HTTPS update manifest and release process.

## Official references

- [Signing and distribution overview](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- [Self-distribution](https://extensionworkshop.com/documentation/publish/self-distribution/)
- [web-ext command reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
