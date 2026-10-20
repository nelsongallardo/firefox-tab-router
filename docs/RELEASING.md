# Mozilla listing, signing, and releases

Mozilla signing is required for normal Firefox installations. Public catalogue versions use the **listed** channel. **Unlisted** versions are self-distributed and do not create a public store listing.

## Public listing workflow

1. Run `npm ci`, `npm run check`, and `npm run build`.
2. Complete the relevant [browser checks](TESTING.md).
3. Sign in at the [Mozilla Developer Hub](https://addons.mozilla.org/developers/).
4. For this existing add-on, choose **Upload New Version**, then **Change** under Where to Host Version and select **On this site**. Do not create a second add-on or change the extension ID.
5. Upload `artifacts/tab_router-<version>.zip`.
6. The package contains readable source directly; no compilation, minification, or generated code is used. Answer the source/build question accordingly.
7. Use [LISTING.md](LISTING.md) for the description, support URL, privacy details, MIT license, and reviewer notes. Target Firefox desktop only.
8. Submit and inspect the resulting status. A successful upload or validation is not proof of approval or public availability.
9. Once approved, verify the public store page offers installation and test the signed version.

If Mozilla requests a source archive, provide the exact release commit. The extension itself needs no build step. Review any new developer agreement yourself.

## Versioning and publication

1. Increment `extension/manifest.json`, `package.json`, and `package-lock.json`. Use a version higher than previous listed and unlisted uploads.
2. Update CHANGELOG.md, run appropriate checks, and commit.
3. Build and submit that exact source state. Keep `tab-router@nelsongallardo` unchanged.
4. Verify any downloaded `.xpi` contains Mozilla signature files under `META-INF/` and the expected manifest. Install it in Firefox for actual signature verification.
5. Create a Git tag and GitHub release for the tested commit when the signed release is available. Attach the signed `.xpi` and SHA-256 checksum if distributing through GitHub. Label unsigned submission ZIPs clearly.
6. Include tests and known limitations in release notes, and update README.md with the verified store URL/status.

Listed versions use Mozilla-hosted updates, subject to the user's Firefox update settings. No custom `update_url` is needed. A pending public listing does not provide a usable installation link yet.

## Optional unlisted signing

For separate self-distributed builds, `npm run sign:unlisted` explicitly selects `--channel unlisted`. This does not submit a public listing. Without a custom update manifest, plan for manual installation of newer signed builds or migration to an approved listed version with a higher version number.

`web-ext` reads `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` from the environment. Keep credentials in a secret manager or local shell environment, never in the repository, command history, screenshots, issues, or chat.

## Official references

- [Submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Signing and distribution](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)
- [Updating extensions](https://extensionworkshop.com/documentation/manage/updating-your-extension/)
- [web-ext command reference](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
