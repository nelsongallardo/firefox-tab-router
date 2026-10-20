import { DEFAULT_SETTINGS, matchRule, validateSettings } from "./rules.js";

// One queue prevents simultaneous tabs from creating duplicate groups.
// Re-read tabs and settings when work starts; events can contain stale state.
export function createRouter(api) {
  let queue = Promise.resolve();

  async function route(tabId) {
    let tab;
    try { tab = await api.tabs.get(tabId); } catch { return "closed"; }
    if (tab.pinned || tab.incognito || !tab.url) return "skipped";
    const stored = await api.storage.local.get("settings");
    const settings = validateSettings(stored.settings ?? DEFAULT_SETTINGS);
    if (!settings.enabled) return "paused";
    const rule = matchRule(tab.url, settings.rules);
    if (!rule) return "unmatched";

    const allGroups = await api.tabGroups.query({});
    // Match literal titles (query.title accepts wildcard syntax).
    const matching = allGroups.filter(group => group.title === rule.group);
    const local = matching.filter(group => group.windowId === tab.windowId);
    let group;
    if (local.length) {
      group = local.find(item => item.id === tab.groupId) ?? local.sort((a, b) => a.id - b.id)[0];
    } else if (matching.length === 1) {
      group = matching[0];
    } else if (matching.length > 1) {
      // Never guess which other window should receive a tab.
      return "ambiguous";
    }
    if (group?.id === tab.groupId) return "already-grouped";

    // The tab may navigate or be manually grouped while API calls are pending.
    const fresh = await api.tabs.get(tabId);
    if (fresh.url !== tab.url || fresh.groupId !== tab.groupId ||
        fresh.windowId !== tab.windowId || fresh.pinned || fresh.incognito) return "changed";
    tab = fresh;
    if (group && group.windowId !== tab.windowId) {
      const sourceWindow = await api.windows.get(tab.windowId);
      await api.tabs.move(tabId, { windowId: group.windowId, index: -1 });
      await api.tabs.group({ tabIds: [tabId], groupId: group.id });
      if (tab.active && sourceWindow.focused) {
        await api.tabs.update(tabId, { active: true });
        await api.windows.update(group.windowId, { focused: true });
      }
    } else if (group) {
      await api.tabs.group({ tabIds: [tabId], groupId: group.id });
    } else {
      const id = await api.tabs.group({ tabIds: [tabId], createProperties: { windowId: tab.windowId } });
      group = await api.tabGroups.update(id, { title: rule.group, color: rule.color });
    }
    // Reveal an active routed tab without collapsing any other groups.
    if (tab.active && group) await api.tabGroups.update(group.id, { collapsed: false });
    return "routed";
  }

  return function enqueue(tabId) {
    const result = queue.then(() => route(tabId));
    queue = result.catch(() => {});
    return result;
  };
}
