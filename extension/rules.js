export const COLORS = ["blue", "green", "yellow", "orange", "red", "pink", "purple", "cyan", "grey"];
export const DEFAULT_SETTINGS = { enabled: true, rules: [] };

export function parsePrefix(value) {
  if (typeof value !== "string" || value.length > 2048) throw new Error("Enter a URL shorter than 2,048 characters.");
  const input = value.trim();
  if (!/^https?:\/\//i.test(input)) throw new Error("Start the URL with https:// or http://.");
  let url;
  try { url = new URL(input); } catch { throw new Error("Enter a valid website URL."); }
  if (url.username || url.password || input.includes("?") || input.includes("#") || input.includes("*")) {
    throw new Error("Use a website or path without credentials, query strings, fragments, or wildcards.");
  }
  const path = url.pathname.replace(/\/+$/, "");
  return { origin: url.origin, path, prefix: `${url.origin}${path}` };
}

export function validateSettings(value) {
  if (!value || typeof value.enabled !== "boolean" || !Array.isArray(value.rules)) {
    throw new Error("Invalid routing settings.");
  }
  if (value.rules.length > 100) throw new Error("Use no more than 100 rules.");
  const rules = value.rules.map((rule, index) => {
    try {
      const { prefix } = parsePrefix(rule.prefix);
      const group = typeof rule.group === "string" ? rule.group.trim() : "";
      if (!group || group.length > 80) throw new Error("Use a group name between 1 and 80 characters.");
      if (!COLORS.includes(rule.color)) throw new Error("Choose a valid group color.");
      return { prefix, group, color: rule.color };
    } catch (error) {
      throw new Error(`Rule ${index + 1}: ${error.message}`);
    }
  });
  return { enabled: value.enabled, rules };
}

export function matchRule(value, rules) {
  let url;
  try { url = new URL(value); } catch { return undefined; }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
  return rules.find(rule => {
    const prefix = parsePrefix(rule.prefix);
    return url.origin === prefix.origin &&
      (url.pathname === prefix.path || url.pathname.startsWith(`${prefix.path}/`));
  });
}
