import { test } from "node:test";
import assert from "node:assert/strict";
import { createRouter } from "../extension/router.js";

function fixture({ groups = [], overrides = {}, enabled = true } = {}) {
  const tabs = new Map([1, 2, 3].map(id => [id, {
    id, url: `https://github.com/example/project/pull/${id}`,
    windowId: 10, groupId: -1, active: id === 1, pinned: false, incognito: false,
    ...overrides
  }]));
  const calls = [];
  const settings = { enabled, rules: [{ prefix: "https://github.com/example/project", group: "work", color: "green" }] };
  const api = {
    storage: { local: { get: async () => ({ settings }) } },
    tabs: {
      get: async id => { if (!tabs.has(id)) throw new Error("gone"); return { ...tabs.get(id) }; },
      group: async args => {
        calls.push(["group", args]);
        const id = args.groupId ?? 100 + groups.length;
        if (!args.groupId) groups.push({ id, windowId: args.createProperties.windowId, title: "" });
        for (const tabId of args.tabIds) tabs.get(tabId).groupId = id;
        return id;
      },
      move: async (id, args) => { calls.push(["move", id, args]); tabs.get(id).windowId = args.windowId; },
      update: async (id, args) => { calls.push(["tab-update", id, args]); Object.assign(tabs.get(id), args); }
    },
    tabGroups: {
      query: async () => groups.map(group => ({ ...group })),
      update: async (id, args) => {
        calls.push(["group-update", id, args]);
        const group = groups.find(item => item.id === id);
        Object.assign(group, args); return { ...group };
      }
    },
    windows: {
      get: async () => ({ focused: true }),
      update: async (id, args) => calls.push(["window-update", id, args])
    }
  };
  return { api, tabs, groups, calls, settings, route: createRouter(api) };
}

test("simultaneous PR links create one group and reuse it", async () => {
  const f = fixture();
  assert.deepEqual(await Promise.all([f.route(1), f.route(2), f.route(3)]), ["routed", "routed", "routed"]);
  assert.equal(f.groups.length, 1);
  assert.equal(f.groups[0].title, "work");
  assert.equal(f.groups[0].color, "green");
  assert.equal(new Set([...f.tabs.values()].map(tab => tab.groupId)).size, 1);
});
test("reuses same-window group, preserves its color, reveals active tab", async () => {
  const f = fixture({ groups: [{ id: 42, windowId: 10, title: "work", color: "red", collapsed: true }] });
  assert.equal(await f.route(1), "routed");
  assert.equal(f.tabs.get(1).groupId, 42);
  assert.equal(f.groups[0].color, "red");
  assert.equal(f.groups[0].collapsed, false);
});
test("routes into a unique group in another window and follows active link", async () => {
  const f = fixture({ groups: [{ id: 42, windowId: 20, title: "work" }] });
  await f.route(1);
  assert.equal(f.tabs.get(1).windowId, 20);
  assert.equal(f.tabs.get(1).groupId, 42);
  assert.ok(f.calls.some(call => call[0] === "window-update"));
});
test("background tabs never steal focus across windows", async () => {
  const f = fixture({ groups: [{ id: 42, windowId: 20, title: "work" }] });
  await f.route(2);
  assert.ok(!f.calls.some(call => call[0] === "window-update"));
});
test("ambiguous groups in other windows leave tab untouched", async () => {
  const f = fixture({ groups: [{ id: 41, windowId: 20, title: "work" }, { id: 42, windowId: 30, title: "work" }] });
  assert.equal(await f.route(1), "ambiguous");
  assert.equal(f.calls.length, 0);
});
test("same-window group wins over groups in other windows", async () => {
  const f = fixture({ groups: [{ id: 41, windowId: 20, title: "work" }, { id: 42, windowId: 10, title: "work" }] });
  await f.route(1);
  assert.equal(f.tabs.get(1).groupId, 42);
});
test("skips pinned and private tabs, paused routing, unmatched URLs and closed tabs", async () => {
  for (const overrides of [{ pinned: true }, { incognito: true }]) {
    const f = fixture({ overrides }); assert.equal(await f.route(1), "skipped"); assert.equal(f.calls.length, 0);
  }
  assert.equal(await fixture({ enabled: false }).route(1), "paused");
  assert.equal(await fixture({ overrides: { url: "https://example.org" } }).route(1), "unmatched");
  assert.equal(await fixture().route(999), "closed");
});
test("repeated events do not move an already grouped tab", async () => {
  const f = fixture();
  await f.route(1);
  const count = f.calls.length;
  assert.equal(await f.route(1), "already-grouped");
  assert.equal(f.calls.length, count);
});
test("navigation during lookup cancels stale work", async () => {
  const f = fixture();
  f.api.tabGroups.query = async () => { f.tabs.get(1).url = "https://example.org"; return []; };
  assert.equal(await f.route(1), "changed");
  assert.equal(f.calls.length, 0);
});
test("queue survives an API failure and uses current settings", async () => {
  const f = fixture();
  const original = f.api.tabGroups.query;
  f.api.tabGroups.query = async () => { throw new Error("temporary failure"); };
  await assert.rejects(f.route(1));
  f.api.tabGroups.query = original;
  assert.equal(await f.route(2), "routed");
  f.settings.enabled = false;
  assert.equal(await f.route(3), "paused");
});
test("group names are matched literally", async () => {
  const f = fixture({ groups: [{ id: 42, windowId: 10, title: "work-other" }] });
  f.settings.rules[0].group = "work*";
  await f.route(1);
  assert.equal(f.groups.length, 2);
  assert.equal(f.groups[1].title, "work*");
});
