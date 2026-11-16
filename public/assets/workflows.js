import { portals, releaseEmail, sampleNotes, formatNotes, milestones, toolDescriptions, dashboardSample, supportPlacements, languagesPerSupport } from "./workflow-data.js";

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

function panel(container, id, title, content) {
  const article = document.createElement("article");
  article.className = "surface demo";
  article.id = id;
  article.innerHTML = `
    <header class="demo-heading">
      <h3>${title}</h3>
      <div class="demo-description">${toolDescriptions[id].map(paragraph => `<p>${paragraph}</p>`).join("")}</div>
    </header>
    <div class="demo-body">${content}</div>`;
  container.append(article);
  return article;
}

function addTransfer(container) {
  const layout = '<ol class="article-layout" aria-label="Article blocks in order"><li>Hero banner</li><li>Article copy</li><li>Event widget</li></ol>';
  const root = panel(container, "article-transfer", "Cross-region article transfer", `
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
        <div class="transfer-node">
          <span class="board-label">EU portal</span><strong>Original article export</strong>${layout}
          <code>media_id: 4217</code>
        </div>
        <i class="transfer-line" aria-hidden="true"></i>
        <div class="transfer-node media-node">
          <span class="board-label">Python tool</span><strong>Match assets by filename</strong><code>hero-banner.webp</code>
          <p class="media-action" aria-live="polite"></p>
        </div>
        <i class="transfer-line" aria-hidden="true"></i>
        <div class="transfer-node">
          <span class="board-label transfer-realm"></span><strong>Import-ready article</strong>${layout}
          <code class="transfer-id"></code>
        </div>
      </div>
      <div class="transfer-meta">
        <div><span class="board-label">Link in the EU export</span><code>worldoftanks.eu/en/news/updates/</code><span class="board-label final-link">Link in the new file</span><code class="transfer-link"></code></div>
        <details open>
          <summary class="board-label">Run log</summary>
          <ul class="transfer-log" aria-live="polite"></ul>
        </details>
      </div>
    </div>
    <div class="transfer-manual">
      <h4>Manual transfer</h4>
      <ol class="manual-steps">
        <li>Open the North America and Asia-Pacific CMSs</li>
        <li>Recreate the layout, blocks and widgets in each CMS</li>
        <li>Copy the content, select each asset and update the links</li>
      </ol>
    </div>`);
  const board = root.querySelector(".transfer-board");
  const log = root.querySelector(".transfer-log");
  let region = "NA";
  let upload = false;

  function draw(animate) {
    const id = (region === "NA" ? 6800 : 9200) + (upload ? 81 : 13);
    board.dataset.media = upload ? "upload" : "reuse";
    root.querySelector(".media-action").textContent = upload
      ? "Missing banner. The tool automatically uploads it to the " + region + " CMS."
      : "Banner found in the " + region + " CMS. The tool reuses it.";
    root.querySelector(".transfer-realm").textContent = region + " portal";
    root.querySelector(".transfer-id").textContent = "media_id: " + id;
    root.querySelector(".transfer-link").textContent = portals[region].domain + "/en/news/updates/";
    const steps = [
      (upload ? "Automatically uploaded the banner" : "Matched and reused the banner") + " · " + region + " ID " + id,
      "Updated the asset ID and links. Kept the blocks and widget in their original order.",
      "Localization check · Title is over its limit. The button label is a placeholder."
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
  const root = panel(container, "micropatch", "Weekly micropatch publishing", `
    <div class="patch-times" aria-label="Setup time with each approach">
      <div><strong>~30 min</strong><span>Manual</span></div>
      <div><strong>~10 min</strong><span>Python</span></div>
      <div><strong>~1 min</strong><span>Extension</span></div>
    </div>
    <div class="demo-board patch-board">
      <div class="mail-source">
        <div><span class="board-label">Release email</span><strong>17 Sep · 05:00 UTC</strong></div>
        <button class="board-button patch-start" type="button">Use this email</button>
      </div>
      <p class="board-foot release-notes">Patch note · ${releaseEmail.notes}</p>
      <div class="patch-branches" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="drafts" aria-label="Regional drafts and CMS imports">
        ${Object.keys(portals).map(region => `
          <div class="patch-lane" data-region="${region}">
            <div class="draft"><span class="board-label">${region} template</span><strong>Article draft</strong><span class="draft-time">Waiting for email</span></div>
            <i class="patch-import-line" aria-hidden="true"></i>
            <div class="draft cms-draft"><span class="board-label">${region} CMS</span><strong>Awaiting import</strong></div>
          </div>`).join("")}
      </div>
      <div class="patch-actions">
        <label class="demo-toggle"><input class="patch-review" type="checkbox" disabled> Editorial review complete</label>
        <button class="board-button patch-publish" type="button" disabled>Schedule publication</button>
      </div>
      <p class="board-foot draft-note" aria-live="polite">Use the email to build three drafts and import each into its CMS.</p>
    </div>`);
  const board = root.querySelector(".patch-board");
  const start = root.querySelector(".patch-start");
  const review = root.querySelector(".patch-review");
  const publish = root.querySelector(".patch-publish");
  const status = root.querySelector(".draft-note");
  const cmsStates = root.querySelectorAll(".cms-draft strong");
  const date = new Date(releaseEmail.date);

  start.addEventListener("click", () => {
    root.querySelectorAll(".patch-lane").forEach(lane => {
      const { zone } = portals[lane.dataset.region];
      lane.querySelector(".draft-time").textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: zone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
      }).format(date);
    });
    cmsStates.forEach(state => { state.textContent = "Imported for review"; });
    review.checked = false;
    review.disabled = false;
    publish.disabled = true;
    board.dataset.stage = "imported";
    status.textContent = "All three CMSs have a draft. Check the regional details before scheduling publication.";
    replay(board, "dispatching");
  });

  review.addEventListener("change", () => {
    publish.disabled = !review.checked;
    board.dataset.stage = review.checked ? "reviewed" : "imported";
    cmsStates.forEach(state => { state.textContent = review.checked ? "Ready to schedule" : "Imported for review"; });
    status.textContent = review.checked
      ? "All three drafts are ready to schedule."
      : "All three CMSs have a draft. Check the regional details before scheduling publication.";
  });

  publish.addEventListener("click", () => {
    board.dataset.stage = "scheduled";
    cmsStates.forEach(state => { state.textContent = "Scheduled"; });
    review.disabled = true;
    publish.disabled = true;
    status.textContent = "Simulation complete. All three articles are scheduled for the release time in the email.";
    start.focus({ preventScroll: true });
    replay(board, "scheduling");
  });
}

function addNotes(container) {
  const root = panel(container, "patch-notes", "Patch notes formatter", `
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
  const root = panel(container, "milestone-planning", "Milestone planning", `
    <p class="demo-guide">See what needs attention today, plan cover for an absence or look for room to take on a new task.</p>
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Planning scenario">
        ${switchButton("review", "daily", "Daily review", true)}
        ${switchButton("review", "cover", "Plan cover")}
        ${switchButton("review", "workload", "Compare workloads")}
      </div>
    </div>
    <div class="demo-board timeline-board">
      <div class="planning-input"><div><span class="board-label">Source</span><strong>Open milestones from Targetprocess</strong></div><div><span class="board-label">Review date</span><strong>15 September</strong></div></div>
      <p class="board-foot planning-scenario"></p>
      <div class="planning-results"></div>
      <p class="board-foot planning-decision" aria-live="polite"></p>
    </div>`);
  const board = root.querySelector(".timeline-board");
  const results = root.querySelector(".planning-results");
  const scenario = root.querySelector(".planning-scenario");
  const decision = root.querySelector(".planning-decision");
  const today = 15;

  function draw(mode, animate) {
    let groups;
    let action;
    if (mode === "cover") {
      const editor = milestones.filter(item => item.owner === "Editor A");
      scenario.textContent = "Filter by Editor A before their absence, 16–22 September.";
      groups = [
        { title: "Before the absence", items: editor.filter(item => item.day <= today) },
        { title: "During the absence", items: editor.filter(item => item.day > today && item.day <= 22) }
      ];
      action = "Assign another editor to cover Copywriting on 17 September.";
    } else if (mode === "workload") {
      const upcoming = milestones.filter(item => item.day >= today && item.day <= 22);
      scenario.textContent = "Compare open milestones by assignee for 15–22 September.";
      groups = ["A", "B", "C"].map(editor => ({
        title: "Editor " + editor,
        items: upcoming.filter(item => item.owner === "Editor " + editor)
      }));
      action = "Check with Editors A and C first. Both have one milestone due in this window, while Editor B has two.";
    } else {
      scenario.textContent = "Sort the open milestones into what has slipped, what is due today and what’s next.";
      groups = [
        { title: "Overdue", items: milestones.filter(item => item.day < today) },
        { title: "Due today", items: milestones.filter(item => item.day === today) },
        { title: "Upcoming", items: milestones.filter(item => item.day > today) }
      ];
      action = "Ask the project manager about the overdue handoff to Localization and check whether today’s Finalization is on track.";
    }
    board.dataset.review = mode;
    results.innerHTML = groups.map(group => `
      <div class="planning-group">
        <span class="board-label">${group.title} · ${group.items.length}</span>
        <ul>${group.items.map(item => `<li><time datetime="2026-09-${item.day}">${item.day} Sep</time><span>${item.task}<small>${item.owner}</small></span></li>`).join("")}</ul>
      </div>`).join("");
    decision.textContent = "Planning decision · " + action;
    if (animate) replay(results, "rescheduling");
  }
  choices(root, "review", mode => draw(mode, true));
  draw("daily", false);
}

function addJira(container) {
  const root = panel(container, "jira-workflow", "Jira review & reminders", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Review event">
        <button type="button" value="submit">Send for review</button>
        <button type="button" value="due">Review due</button>
        <button type="button" value="changes">Request changes</button>
        <button type="button" value="done">Complete review</button>
      </div>
    </div>
    <div class="demo-board jira-board" data-state="progress">
      <div class="jira-track">
        <div class="jira-stage" data-step="progress"><span class="board-label">In Progress</span></div>
        <div class="jira-stage" data-step="review"><span class="board-label">For Review</span></div>
        <div class="jira-stage" data-step="localization"><span class="board-label">Localization</span></div>
        <div class="jira-ticket" aria-hidden="true">WO-104</div>
      </div>
      <p class="board-foot jira-status" aria-live="polite">WO-104 · In Progress</p>
      <p class="board-foot jira-next">The editor prepares the article for review.</p>
      <button class="board-button jira-reset" type="button">Reset issue</button>
    </div>`);
  const board = root.querySelector(".jira-board");
  const status = root.querySelector(".jira-status");
  const next = root.querySelector(".jira-next");
  const buttons = [...root.querySelectorAll(".demo-switches button")];
  const actions = {
    submit: ["review", "WO-104 moved to For Review.", "The assigned reviewer checks the article."],
    due: ["review", "Reminder sent. WO-104 stays in For Review.", "The assigned reviewer can complete the review or request changes."],
    changes: ["progress", "WO-104 returned to In Progress.", "The editor revises the article and sends it for review again."],
    done: ["localization", "WO-104 moved to Localization.", "The project manager sends the article to the localisation team."]
  };

  function setStage(stage, message, nextAction) {
    board.dataset.state = stage;
    status.textContent = message;
    next.textContent = nextAction;
    board.classList.remove("reminding");
    for (const button of buttons) {
      button.disabled = button.value === "submit" ? stage !== "progress" : stage !== "review";
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      setStage(...actions[button.value]);
      if (button.value === "due") replay(board, "reminding");
      if (button.disabled) {
        const available = buttons.find(control => !control.disabled) || root.querySelector(".jira-reset");
        available.focus({ preventScroll: true });
      }
    });
  }

  function reset() {
    setStage("progress", "WO-104 · In Progress", "The editor prepares the article for review.");
  }
  root.querySelector(".jira-reset").addEventListener("click", reset);
  reset();
}

function addSupports(container) {
  const totalTitles = supportPlacements.length * languagesPerSupport;
  const root = panel(container, "support-setup", "Localised support setup", `
    <div class="demo-board supports-board">
      <div class="support-sources">
        <div><span class="board-label">Confluence</span><strong>Campaign setup</strong><p>Summer Festival · Event link and five placements.</p><button class="board-button" type="button" data-source="campaign">Load campaign setup</button></div>
        <div><span class="board-label">Excel</span><strong>Translated titles</strong><p>${languagesPerSupport} languages for each placement.</p><button class="board-button" type="button" data-source="copy">Load translated titles</button></div>
      </div>
      <div class="support-merge" aria-hidden="true"></div>
      <div class="support-form">
        <div><span class="board-label">Extension</span><strong>One form · Five placements · ${totalTitles} titles</strong></div>
        <label class="demo-toggle"><input type="checkbox" disabled> Simulate a missing title</label>
      </div>
      <div class="support-results" hidden>
        <p class="board-foot support-link">Shared campaign link · /events/summer-festival/</p>
        <table class="support-table">
          <caption>Sample titles by placement</caption>
          <thead><tr><th scope="col">Placement</th><th scope="col">Destination</th><th scope="col">Localised title</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="support-actions">
        <button class="board-button support-check" type="button" disabled>Run preflight checks</button>
        <button class="board-button support-publish" type="button" disabled>Publish supports</button>
      </div>
      <p class="board-foot support-status" aria-live="polite"></p>
      <div class="support-destinations" hidden>
        ${["Portal", "WGC"].map(destination => `
          <div>
            <strong>${destination}</strong>
            <ul>${supportPlacements.filter(placement => placement.destination === destination).map(placement => `<li>${placement.title} <small>${languagesPerSupport} languages</small></li>`).join("")}</ul>
          </div>`).join("")}
      </div>
    </div>`);
  const board = root.querySelector(".supports-board");
  const missing = root.querySelector("input");
  const table = root.querySelector(".support-results");
  const rows = table.querySelector("tbody");
  const status = root.querySelector(".support-status");
  const check = root.querySelector(".support-check");
  const publish = root.querySelector(".support-publish");
  const destinations = root.querySelector(".support-destinations");
  const source = { campaign: false, copy: false };

  function draw(animate) {
    table.hidden = !source.campaign;
    missing.disabled = !source.copy || !source.campaign;
    check.disabled = !source.campaign || !source.copy;
    publish.disabled = true;
    destinations.hidden = true;
    if (!source.campaign) {
      status.textContent = source.copy
        ? "Titles loaded. Load the campaign setup to match them to placements."
        : "Load the campaign setup and translated titles to build the batch.";
    } else if (!source.copy) {
      status.textContent = "Five placements loaded. Load the workbook to fill their titles.";
    } else {
      status.textContent = "Both sources are loaded. Run preflight checks before publishing.";
    }

    rows.innerHTML = supportPlacements.map(placement => {
      const incomplete = source.copy && missing.checked && placement.title === "Minor banner";
      const title = incomplete ? "Missing title" : source.copy ? placement.copy : "Waiting for Excel";
      return `<tr${incomplete ? ' data-missing="true"' : ""}><th scope="row">${placement.title}</th><td>${placement.destination}</td><td><small>${placement.locale}</small> ${title}</td></tr>`;
    }).join("");
    if (animate) replay(board, "mapping-copy");
  }

  root.querySelectorAll("[data-source]").forEach(button => {
    const label = button.textContent.slice("Load ".length);
    button.addEventListener("click", () => {
      const key = button.dataset.source;
      source[key] = !source[key];
      button.dataset.loaded = String(source[key]);
      button.textContent = (source[key] ? "Remove " : "Load ") + label;
      draw(true);
    });
  });
  missing.addEventListener("change", () => draw(true));
  check.addEventListener("click", () => {
    publish.disabled = missing.checked;
    status.textContent = missing.checked
      ? "Preflight found 1 missing title. Add the Polish title for the WGC minor banner before publishing."
      : "Preflight passed. All " + totalTitles + " titles are ready across five placements.";
    replay(board, "checking-supports");
  });
  publish.addEventListener("click", () => {
    publish.disabled = true;
    check.disabled = true;
    destinations.hidden = false;
    status.textContent = "Simulation complete. Published three portal and two WGC placements, each in " + languagesPerSupport + " languages.";
    replay(board, "publishing-supports");
  });
  draw(false);
}

function addDashboards(container) {
  const { week, days, tasks } = dashboardSample;
  const assignees = [...new Set(tasks.map(task => task.assignee))];
  const priorities = ["High", "Normal", "Low"];
  const orderedTasks = [...tasks].sort((a, b) => priorities.indexOf(a.priority) - priorities.indexOf(b.priority) || a.day - b.day);
  const root = panel(container, "team-dashboards", "Team task dashboards", `
    <div class="demo-toolbar">
      <div class="demo-switches" role="group" aria-label="Dashboard view">
        ${switchButton("dashboard", "table", "Table", true)}
        ${switchButton("dashboard", "calendar", "Calendar")}
      </div>
      <label class="dashboard-filter">
        <span class="label">Assignee</span>
        <select class="board-button">
          <option value="">Everyone</option>
          ${assignees.map(assignee => `<option>${assignee}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="demo-board dashboard-board">
      <p class="board-label dashboard-week">Sample week · ${week}</p>
      <div class="dashboard-layout">
        <div class="dashboard-view"></div>
        <div class="dashboard-detail">
          <h4 class="board-label">Task scope</h4>
          <div aria-live="polite">
            <p class="dashboard-detail-title"></p>
            <p class="board-foot dashboard-detail-meta"></p>
            <ul></ul>
          </div>
        </div>
      </div>
    </div>`);
  root.classList.add("demo-wide");
  const filter = root.querySelector(".dashboard-filter select");
  const display = root.querySelector(".dashboard-view");
  const detailTitle = root.querySelector(".dashboard-detail-title");
  const detailMeta = root.querySelector(".dashboard-detail-meta");
  const detailSteps = root.querySelector(".dashboard-detail ul");
  let view = "table";
  let selected = orderedTasks[0];

  const dateLabel = ({ date, label }) => `<time datetime="${date}">${label}</time>`;
  const priority = task => `<span class="dashboard-priority" data-priority="${task.priority}">${task.priority}</span>`;
  const taskButton = task => `<button class="dashboard-task" type="button" value="${task.id}" aria-pressed="${task === selected}">${task.title}</button>`;

  function showTask(task) {
    selected = task;
    for (const button of display.querySelectorAll(".dashboard-task")) {
      button.setAttribute("aria-pressed", String(button.value === task.id));
    }
    detailTitle.textContent = task.title;
    detailMeta.textContent = `${task.assignee} · ${task.priority} priority · ${days[task.day].label}`;
    detailSteps.replaceChildren(...task.steps.map(step => {
      const item = document.createElement("li");
      item.textContent = step;
      return item;
    }));
  }

  function drawView() {
    const visible = orderedTasks.filter(task => !filter.value || task.assignee === filter.value);
    const active = visible.includes(selected) ? selected : visible[0];
    if (view === "table") {
      display.innerHTML = `
        <table class="dashboard-table" aria-label="Tasks by priority">
          <thead><tr><th scope="col">Task / assignee</th><th scope="col">Priority</th><th scope="col">Due</th></tr></thead>
          <tbody>${visible.map(task => `
            <tr><td>${taskButton(task)}<span class="dashboard-owner">${task.assignee}</span></td>
            <td>${priority(task)}</td><td>${dateLabel(days[task.day])}</td></tr>`).join("")}</tbody>
        </table>`;
    } else {
      display.innerHTML = `
        <div class="dashboard-calendar" role="group" aria-label="Tasks by due date">
          ${days.map((day, index) => `
            <div class="dashboard-day">
              <p class="board-label">${dateLabel(day)}</p>
              <div class="dashboard-events">${visible.filter(task => task.day === index).map(task => `
                <div class="dashboard-event">${taskButton(task)}<span class="dashboard-owner">${task.assignee}</span>${priority(task)}</div>
              `).join("") || '<span class="dashboard-owner">No tasks</span>'}</div>
            </div>`).join("")}
        </div>`;
    }
    showTask(active);
  }

  choices(root, "dashboard", value => { view = value; drawView(); });
  filter.addEventListener("change", drawView);
  display.addEventListener("click", event => {
    const button = event.target.closest(".dashboard-task");
    if (button) showTask(tasks.find(task => task.id === button.value));
  });
  drawView();
}

export function addWorkflows(container) {
  addTransfer(container);
  addMicropatch(container);
  addNotes(container);
  addMilestones(container);
  addJira(container);
  addDashboards(container);
  addSupports(container);
}
