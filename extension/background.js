import { createRouter } from "./router.js";

const route = createRouter(browser);

function onTab(tabId) {
  route(tabId).then(async result => {
    if (result === "ambiguous") {
      await browser.action.setBadgeText({ text: "?" });
      await browser.action.setTitle({ title: "Tab Router: matching groups exist in multiple windows. Open settings for help." });
    } else if (result === "routed") {
      await browser.action.setBadgeText({ text: "" });
      await browser.action.setTitle({ title: "Tab Router — manage routing rules" });
    }
  }).catch(() => {
    // Do not log URLs or browsing history, even on failure.
    console.warn("Tab Router could not route a tab. It may have closed or moved.");
  });
}

browser.tabs.onCreated.addListener(tab => onTab(tab.id));
browser.tabs.onUpdated.addListener((tabId, change) => {
  if (typeof change.url === "string") onTab(tabId);
});
browser.action.onClicked.addListener(() => browser.runtime.openOptionsPage());
browser.runtime.onInstalled.addListener(details => {
  if (details.reason === "install") browser.runtime.openOptionsPage();
});
