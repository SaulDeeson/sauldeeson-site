import { portals, releaseEmail, sampleNotes, formatNotes, milestones } from "./workflow-data.js";

const motion = matchMedia("(prefers-reduced-motion: reduce)");

function replay(element, className) {
  element.classList.remove(className);
  if (motion.matches) return;
  void element.offsetWidth;
  element.classList.add(className);
}

function choices(root, group, update) {
  root.querySelectorAll('[data-choice="' + group + '"]').forEach(button => {
    button.addEventListener("click", () => {
      root.querySelectorAll('[data-choice="' + group + '"]').forEach(option => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      update(button.value);
    });
  });
}

function switchButton(group, value, label, selected = false) {
  return `<button type="button" data-choice="${group}" value="${value}" aria-pressed="${selected}">${label}</button>`;
}

function panel(container, id, title, description, content) {
  const article = document.createElement("article");
  article.className = "surface demo";
  article.id = id;
  article.innerHTML = `
    <header class="demo-heading">
      <h3>${title}</h3>
      <p>${description}</p>
    </header>
    <div class="demo-body">${content}</div>`;
  container.append(article);
  return article;
}

function addTransfer(container) {
  const root = panel(container, "article-transfer", "Cross-region article transfer",
    "I built a Python tool for moving articles between the EU, NA and APAC portals. It looks up media by filename, uploads missing assets, rewrites links and flags fields that need a second look.", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Destination portal">
        ${switchButton("realm", "NA", "North America", true)}
        ${switchButton("realm", "APAC", "Asia-Pacific")}
      </div>
      <div class="demo-switches" role="group" aria-label="Destination media library">
        ${switchButton("media", "reuse", "Asset exists", true)}
        ${switchButton("media", "upload", "Asset missing")}
      </div>
    </div>
    <div class="demo-board transfer-board">
      <div class="transfer-track">
        <div class="transfer-node"><span class="board-label">EU portal</span><strong>Article JSON</strong><code>media_id: 4217</code></div>
        <i class="transfer-line" aria-hidden="true"></i>
        <div class="transfer-node media-node"><span class="board-label">Media lookup</span><strong>hero-banner.webp</strong><span class="media-action"></span></div>
        <i class="transfer-line" aria-hidden="true"></i>
        <div class="transfer-node"><span class="board-label transfer-realm"></span><strong>Import-ready JSON</strong><code class="transfer-id"></code></div>
      </div>
      <div class="transfer-meta">
        <div><span class="board-label">Regional link</span><code class="transfer-link"></code></div>
        <details open>
          <summary class="board-label">Run log</summary>
          <ul class="transfer-log" aria-live="polite"></ul>
        </details>
      </div>
    </div>`);
  const board = root.querySelector(".transfer-board");
  const log = root.querySelector(".transfer-log");
  let region = "NA";
  let upload = false;

  function draw(animate) {
    const id = (region === "NA" ? 6800 : 9200) + (upload ? 81 : 13);
    board.dataset.media = upload ? "upload" : "reuse";
    root.querySelector(".media-action").textContent = upload ? "Upload into the CMS" : "Reuse by filename";
    root.querySelector(".transfer-realm").textContent = region + " portal";
    root.querySelector(".transfer-id").textContent = "media_id: " + id;
    root.querySelector(".transfer-link").textContent = portals[region].domain + "/en/news/updates/";
    const steps = [
      (upload ? "Uploaded asset" : "Reused asset") + " · " + region + " ID " + id,
      "Check title length and fill the missing CTA label"
    ];
    log.replaceChildren(...steps.map(step => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }));
    if (animate) replay(board, "transferring");
  }

  choices(root, "realm", value => { region = value; draw(true); });
  choices(root, "media", value => { upload = value === "upload"; draw(true); });
  draw(false);
}

function addMicropatch(container) {
  const root = panel(container, "micropatch", "Weekly micropatch publishing",
    "I turned a 30-minute article setup into a 10-minute Python workflow, then into a roughly one-minute Chrome extension. Editors paste a release email and review drafts for each region.", `
    <div class="patch-times" aria-label="Setup time with each approach">
      <div><strong>~30 min</strong><span>Manual</span></div>
      <div><strong>~10 min</strong><span>Python</span></div>
      <div><strong>~1 min</strong><span>Extension</span></div>
    </div>
    <div class="demo-board patch-board">
      <div class="mail-source">
        <div><span class="board-label">Release email</span><strong>17 Sep · 05:00 UTC</strong></div>
        <button class="board-button" type="button">Generate drafts</button>
      </div>
      <div class="patch-branches" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="drafts" aria-label="Regional drafts">
        ${Object.keys(portals).map(region => `<div class="draft"><span class="board-label">${region}</span><strong>Article draft</strong><span class="draft-time">Waiting for email</span></div>`).join("")}
      </div>
      <p class="board-foot draft-note" aria-live="polite">Drafts are prepared for editor review.</p>
    </div>`);
  const board = root.querySelector(".patch-board");
  const date = new Date(releaseEmail.date);
  root.querySelector(".board-button").addEventListener("click", () => {
    root.querySelectorAll(".draft-time").forEach((draft, index) => {
      const portal = Object.values(portals)[index];
      draft.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: portal.zone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      }).format(date);
    });
    root.querySelector(".draft-note").textContent = "3 drafts ready to review · " + releaseEmail.notes;
    replay(board, "dispatching");
  });
}

function addNotes(container) {
  const root = panel(container, "patch-notes", "Patch notes formatter",
    "I built an internal webpage for editors to turn incoming notes into consistent, ready-to-paste article copy.", `
    <div class="demo-board notes-board">
      <div class="notes-columns">
        <label><span class="board-label">Incoming notes</span><textarea spellcheck="false" rows="7" maxlength="5000"></textarea></label>
        <div class="notes-output"><span class="board-label">Formatted copy</span><pre></pre></div>
      </div>
      <div class="notes-footer">
        <span class="board-foot copy-feedback" role="status">Edit the example to see the formatting update.</span>
        <button class="board-button" type="button">Copy text</button>
      </div>
    </div>`);
  const input = root.querySelector("textarea");
  const output = root.querySelector("pre");
  const button = root.querySelector(".board-button");
  const feedback = root.querySelector(".copy-feedback");

  function draw() {
    const formatted = formatNotes(input.value);
    output.textContent = formatted || "Formatted notes will appear here.";
    button.disabled = !formatted;
  }

  input.value = sampleNotes;
  draw();
  input.addEventListener("input", () => {
    draw();
    replay(output, "reformatting");
  });
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(output.textContent);
      feedback.textContent = "Formatted notes copied.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(output);
      selection.removeAllRanges();
      selection.addRange(range);
      feedback.textContent = "Formatted notes selected.";
    }
  });
}

function addMilestones(container) {
  const root = panel(container, "milestone-planning", "Milestone planning",
    "My Targetprocess tool surfaced overdue, due and upcoming work. Filtering by editor helped me plan cover and see where there was space for another assignment.", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Assigned editor">
        ${switchButton("editor", "all", "All editors", true)}
        ${["A", "B", "C"].map(editor => switchButton("editor", editor, "Editor " + editor)).join("")}
      </div>
    </div>
    <div class="demo-board timeline-board">
      <label class="timeline-date"><span class="board-label">Review date · September</span><output for="review-date">15 Sep</output></label>
      <input id="review-date" type="range" min="14" max="22" value="15" aria-label="Review date in September">
      <div class="timeline-track" aria-hidden="true"></div>
      <div class="timeline-scale" aria-hidden="true"><span>14 Sep</span><span>18 Sep</span><span>22 Sep</span></div>
      <ol class="timeline-tasks" aria-label="Milestones"></ol>
    </div>`);
  const slider = root.querySelector("input");
  const tasks = root.querySelector(".timeline-tasks");
  const track = root.querySelector(".timeline-track");
  let editor = "all";

  function draw(animate) {
    const day = Number(slider.value);
    root.querySelector("output").textContent = day + " Sep";
    slider.setAttribute("aria-valuetext", day + " September");
    const visible = milestones.filter(item => editor === "all" || item.editor === editor);
    const progress = date => (date - Number(slider.min)) / (Number(slider.max) - Number(slider.min)) * 100 + "%";
    const status = item => item.day === day ? "Due today" : item.day < day ? "Overdue" : "Upcoming";
    track.style.setProperty("--review-date", progress(day));
    track.replaceChildren(...visible.map(item => {
      const point = document.createElement("i");
      point.style.left = progress(item.day);
      point.dataset.state = status(item);
      return point;
    }));
    tasks.replaceChildren(...visible.map(item => {
      const row = document.createElement("li");
      const state = status(item);
      row.dataset.state = state;
      row.innerHTML = `<span class="milestone-date">${item.day} Sep</span><span>${item.task}<small>Editor ${item.editor}</small></span><strong>${state}</strong>`;
      return row;
    }));
    if (animate) replay(tasks, "rescheduling");
  }

  choices(root, "editor", value => { editor = value; draw(true); });
  slider.addEventListener("input", () => draw(true));
  draw(false);
}

function addJira(container) {
  const root = panel(container, "jira-workflow", "Jira approvals & reminders",
    "I set up rules to move work through approvals, return it for changes and remind reviewers when a decision was due.", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Approval event">
        ${switchButton("event", "approved", "Approve")}
        ${switchButton("event", "due", "Review due")}
        ${switchButton("event", "changes", "Request changes")}
      </div>
    </div>
    <div class="demo-board jira-board" data-state="approval">
      <div class="jira-track">
        <div class="jira-stage" data-step="editing"><span class="board-label">In progress</span></div>
        <div class="jira-stage" data-step="approval"><span class="board-label">Approval</span></div>
        <div class="jira-stage" data-step="qa"><span class="board-label">QA</span></div>
        <div class="jira-ticket" aria-hidden="true">WO-104</div>
      </div>
      <p class="board-foot jira-status" aria-live="polite">WO-104 is waiting for approval.</p>
      <button class="board-button jira-reset" type="button">Reset issue</button>
    </div>`);
  const board = root.querySelector(".jira-board");
  const status = root.querySelector(".jira-status");
  const reset = root.querySelector(".jira-reset");
  const actions = {
    approved: ["qa", "Approved · WO-104 moved to QA."],
    due: ["approval", "Reminder sent · WO-104 stays in Approval."],
    changes: ["editing", "Changes requested · WO-104 returned to In progress."]
  };
  choices(root, "event", event => {
    const [stage, message] = actions[event];
    board.dataset.state = stage;
    status.textContent = message;
    board.classList.remove("reminding");
    if (event === "due") replay(board, "reminding");
  });
  reset.addEventListener("click", () => {
    board.classList.remove("reminding");
    board.dataset.state = "approval";
    status.textContent = "WO-104 is waiting for approval.";
    root.querySelectorAll("[data-choice]").forEach(button => button.setAttribute("aria-pressed", "false"));
  });
}

function addSupports(container) {
  const root = panel(container, "support-setup", "Localised support setup",
    "I built a Chrome extension that brings localised copy into one form for the portal and Wargaming Game Center. A batch that took around 30 minutes now takes about 10.", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Localisation source">
        ${switchButton("source", "Confluence", "Confluence", true)}
        ${switchButton("source", "Excel", "Excel")}
      </div>
      <label class="demo-toggle"><input type="checkbox"> Simulate a missing title</label>
    </div>
    <div class="demo-board supports-board">
      <div class="support-flow">
        <div><span class="board-label">Localised copy</span><strong class="support-source">Confluence</strong></div>
        <span class="support-arrow" aria-hidden="true">→</span>
        <div><span class="board-label">Extension</span><strong>One form</strong></div>
      </div>
      <div class="support-branches" aria-hidden="true"></div>
      <div class="support-targets">
        <div><span class="board-label">Portal</span><strong>3 entries ready</strong></div>
        <div><span class="board-label">Game Center</span><strong class="support-client">2 entries ready</strong></div>
      </div>
      <p class="board-foot support-status" aria-live="polite">5 entries ready for editor review.</p>
    </div>`);
  const board = root.querySelector(".supports-board");
  const missing = root.querySelector("input");
  const status = root.querySelector(".support-status");

  function draw() {
    board.dataset.missing = String(missing.checked);
    root.querySelector(".support-client").textContent = missing.checked ? "1 entry needs a title" : "2 entries ready";
    status.textContent = missing.checked ? "4 of 5 ready · Add the Polish title for the in-client event card." : "5 entries ready for editor review.";
    replay(board, "mapping-copy");
  }

  choices(root, "source", source => {
    root.querySelector(".support-source").textContent = source;
    draw();
  });
  missing.addEventListener("change", draw);
}

export function addWorkflows(container) {
  addTransfer(container);
  addMicropatch(container);
  addNotes(container);
  addMilestones(container);
  addJira(container);
  addSupports(container);
}
