import { COLORS, DEFAULT_SETTINGS, matchRule, validateSettings } from "./rules.js";

const $ = selector => document.querySelector(selector);
let dirty = false;
let loaded = false;

function markDirty() {
  dirty = true;
  $("#status").className = "";
  $("#status").textContent = "Unsaved changes";
  preview();
}

function values() {
  return {
    enabled: $("#enabled").checked,
    rules: [...document.querySelectorAll(".route")].map(row => ({
      prefix: row.querySelector("[name=prefix]").value,
      group: row.querySelector("[name=group]").value,
      color: row.querySelector("[name=color]").value
    }))
  };
}

function updateRows() {
  const rows = [...document.querySelectorAll(".route")];
  $("#count").textContent = rows.length;
  $("#empty").hidden = rows.length > 0;
  $("#add").disabled = rows.length >= 100;
  rows.forEach((row, index) => {
    row.querySelector("strong").textContent = `Route ${String(index + 1).padStart(2, "0")}`;
    row.querySelector("[data-move=up]").disabled = index === 0;
    row.querySelector("[data-move=down]").disabled = index === rows.length - 1;
  });
}

function addRow(rule = { prefix: "", group: "", color: "green" }) {
  const row = document.createElement("section");
  row.className = "route";
  const top = document.createElement("div");
  top.className = "route-top";
  top.append(document.createElement("strong"));
  for (const [name, text] of [["up", "↑"], ["down", "↓"], ["remove", "Remove"]]) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "small"; button.textContent = text;
    button.dataset.move = name;
    button.setAttribute("aria-label", `${name === "remove" ? "Remove" : `Move ${name}`} route`);
    button.addEventListener("click", () => {
      if (name === "remove") row.remove();
      else if (name === "up" && row.previousElementSibling) row.previousElementSibling.before(row);
      else if (name === "down" && row.nextElementSibling) row.nextElementSibling.after(row);
      updateRows(); markDirty();
    });
    top.append(button);
  }
  row.append(top);
  const fields = document.createElement("div"); fields.className = "fields";
  for (const [name, labelText, placeholder] of [
    ["prefix", "Website or repository URL", "https://github.com/example/project"],
    ["group", "Destination group", "work"],
    ["color", "New group color", ""]
  ]) {
    const label = document.createElement("label"); label.textContent = labelText;
    if (name === "prefix") label.className = "url-field";
    const input = document.createElement(name === "color" ? "select" : "input");
    input.name = name;
    if (name === "color") {
      for (const color of COLORS) {
        const option = document.createElement("option");
        option.value = color; option.textContent = color[0].toUpperCase() + color.slice(1);
        input.append(option);
      }
    } else {
      input.type = name === "prefix" ? "url" : "text";
      input.placeholder = placeholder;
      input.required = true;
      input.maxLength = name === "prefix" ? 2048 : 80;
      input.spellcheck = false;
    }
    input.value = rule[name];
    label.append(input); fields.append(label);
  }
  row.append(fields); $("#rules").append(row);
  updateRows();
  return row;
}

function preview() {
  const output = $("#test-result");
  if (!$("#test-url").value) {
    output.textContent = "Paste a link to preview its destination. No tab will be moved.";
    return;
  }
  try {
    const settings = validateSettings(values());
    const rule = matchRule($("#test-url").value, settings.rules);
    output.textContent = !settings.enabled ? "Routing is paused." :
      rule ? `Destination → ${rule.group}` : "No matching route. This tab stays where it is.";
  } catch (error) { output.textContent = error.message; }
}

$("#add").addEventListener("click", () => {
  const row = addRow();
  row.querySelector("input").focus();
  markDirty();
});
$("#settings").addEventListener("input", markDirty);
$("#test-url").addEventListener("input", preview);
$("#settings").addEventListener("submit", async event => {
  event.preventDefault();
  if (!loaded) return;
  try {
    const settings = validateSettings(values());
    await browser.storage.local.set({ settings });
    dirty = false;
    $("#status").className = "";
    $("#status").textContent = "Saved. Your routes apply to new tabs and URL changes.";
    preview();
  } catch (error) {
    $("#status").className = "error";
    $("#status").textContent = error.message;
  }
});
window.addEventListener("beforeunload", event => {
  if (dirty) { event.preventDefault(); event.returnValue = ""; }
});

try {
  const result = await browser.storage.local.get("settings");
  const settings = validateSettings(result.settings ?? DEFAULT_SETTINGS);
  $("#enabled").checked = settings.enabled;
  settings.rules.forEach(addRow);
  updateRows();
  loaded = true;
} catch {
  $("#status").className = "error";
  $("#status").textContent = "Settings could not be loaded. Reload this page before editing.";
  document.querySelectorAll("button, input").forEach(input => { input.disabled = true; });
}
