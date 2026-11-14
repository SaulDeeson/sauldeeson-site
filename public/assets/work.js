import { projects } from "./projects.js";
import { addRecording } from "./recording.js";
import { addWorkflows } from "./workflows.js";

const projectIndex = document.querySelector("#project-index");
const projectList = document.querySelector("#project-list");
const cards = [];
const links = new Map();

function addCapture(body, capture) {
  const details = document.createElement("details");
  details.className = "capture";
  const summary = document.createElement("summary");
  summary.textContent = "Read the PDF capture";
  const fallback = document.createElement("a");
  fallback.href = capture.desktop || capture.mobile;
  fallback.className = "capture-link";
  fallback.textContent = "Open PDF";
  details.append(summary, fallback);
  body.append(details);

  let loading = false;
  details.addEventListener("toggle", async () => {
    if (!details.open || loading) return;
    loading = true;
    try {
      const { mountPdf } = await import("./pdf/viewer.js");
      mountPdf(details, capture);
      fallback.remove();
    } catch {
      loading = false;
    }
  });
}

projects.filter(project => project.published !== false).forEach((project, index) => {
  const number = String(index + 1).padStart(2, "0");
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.href = "#" + project.id;
  const badge = document.createElement("span");
  badge.className = "case-count";
  badge.textContent = number;
  link.append(badge, document.createTextNode(project.title));
  item.append(link);
  projectIndex.append(item);
  links.set(project.id, link);

  const card = document.createElement("article");
  card.id = project.id;
  card.className = "surface case-card";
  card.setAttribute("aria-labelledby", project.id + "-title");
  card.innerHTML = `
    <header class="case-header">
      <span class="case-count" aria-hidden="true"></span>
      <div><p class="label category"></p><h3></h3></div>
    </header>
    <div class="case-body">
      <figure class="recording"></figure>
      <div class="case-note">
        <div class="case-copy"></div>
        <a class="action" target="_blank" rel="noopener">Original article <span aria-hidden="true">↗</span></a>
      </div>
    </div>`;
  card.querySelector(".case-count").textContent = number;
  card.querySelector(".category").textContent = project.category;
  const title = card.querySelector("h3");
  title.id = project.id + "-title";
  title.textContent = project.title;
  const copy = card.querySelector(".case-copy");
  for (const paragraph of project.paragraphs) {
    const text = document.createElement("p");
    text.textContent = paragraph;
    copy.append(text);
  }
  card.querySelector(".action").href = project.url;
  addRecording(card.querySelector("figure"), project);
  if (project.capture?.desktop || project.capture?.mobile) addCapture(card.querySelector(".case-body"), project.capture);
  projectList.append(card);
  cards.push(card);
});

let scrollFrame;

function updateIndex() {
  scrollFrame = undefined;
  const readingLine = window.innerHeight * .35;
  const current = cards.find(card => {
    const bounds = card.getBoundingClientRect();
    return bounds.top <= readingLine && bounds.bottom >= readingLine;
  });
  for (const [id, link] of links) {
    if (current?.id === id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

function queueIndexUpdate() {
  scrollFrame ??= requestAnimationFrame(updateIndex);
}

window.addEventListener("scroll", queueIndexUpdate, { passive: true });
window.addEventListener("resize", queueIndexUpdate);
queueIndexUpdate();

addWorkflows(document.querySelector("#workflow"));
