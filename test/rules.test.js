import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRule, parsePrefix, validateSettings } from "../extension/rules.js";

const rule = { prefix: "https://github.com/example/project", group: "work", color: "green" };
test("matches repository root, PRs, query strings and fragments", () => {
  for (const suffix of ["", "/", "/pull/42", "/issues/2?tab=comments#discussion"]) {
    assert.equal(matchRule(rule.prefix + suffix, [rule]), rule);
  }
});
test("enforces origin and path boundaries", () => {
  for (const url of [
    "https://github.com/example/project-other/pull/1",
    "https://github.com.attacker.test/example/project",
    "https://attacker.test/?url=https://github.com/example/project",
    "http://github.com/example/project", "https://github.com:444/example/project",
    "https://user:password@github.com/example/project",
    "https://github.com/example/project/../other", "about:blank", "not a URL"
  ]) assert.equal(matchRule(url, [rule]), undefined, url);
});
test("normalizes origins and trailing slashes without broadening paths", () => {
  assert.equal(parsePrefix(" HTTPS://GITHUB.COM:443/example/project/ ").prefix, rule.prefix);
  assert.equal(matchRule("https://github.com/anything", [{ ...rule, prefix: "https://github.com" }])?.group, "work");
});
test("first rule wins", () => {
  const broad = { ...rule, prefix: "https://github.com", group: "general" };
  assert.equal(matchRule(rule.prefix, [rule, broad]), rule);
  assert.equal(matchRule(rule.prefix, [broad, rule]), broad);
});
test("invalid configuration is rejected before saving", () => {
  for (const prefix of ["github.com", "file:///tmp/test", "https://*.example.com", "https://example.com/?q=x", "https://example.com/#x", "https://u:p@example.com"]) {
    assert.throws(() => validateSettings({ enabled: true, rules: [{ ...rule, prefix }] }));
  }
  assert.throws(() => validateSettings({ enabled: true, rules: [{ ...rule, group: " " }] }));
  assert.throws(() => validateSettings({ enabled: true, rules: [{ ...rule, color: "invalid" }] }));
  assert.throws(() => validateSettings({ enabled: true, rules: Array(101).fill(rule) }));
  assert.deepEqual(validateSettings({ enabled: true, rules: [] }), { enabled: true, rules: [] });
});
