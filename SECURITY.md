# Security

The latest released version is supported. Please report vulnerabilities through **Security → Report a vulnerability** on GitHub. Avoid posting credentials, private repository names, or browsing data in public issues.

Tab Router has no runtime dependencies and no network access in its implementation. Development dependencies are pinned in `package-lock.json`. Permissions and package contents should be reviewed for every release.

A report should include the version, Firefox version, expected behavior, observed behavior, and minimal reproduction steps using example URLs.

## Development dependency advisory

On 2026-10-20, `npm audit` reports GHSA-86w9-cpqp-85rv in `node-forge`, pulled in through `web-ext` → `@devicefarmer/adbkit` (Android debugging tooling). The extension ships none of these packages and does not support Android. There is no compatible patched dependency offered by the audit tool at this time; its suggested downgrade of `web-ext` to 5.1.0 is not applied. Recheck this advisory when updating development tools. `npm audit --omit=dev` checks the shipped dependency set.
