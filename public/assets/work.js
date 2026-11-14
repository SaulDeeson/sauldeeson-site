import { projects } from "./projects.js";
import { addRecording } from "./recording.js";
import { addWorkflows } from "./workflows.js";

const projectIndex = document.querySelector("#project-index");
const projectList = document.querySelector("#project-list");
const workflow = document.querySelector("#workflow");
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
  const cornerCallout = index === 0 ? `
        <span class="case-radius spec-label" aria-hidden="true">R 4 px
          <svg width="32" height="19" viewBox="0 0 32 19" focusable="false">
            <path d="M.5 14.5H14L30.5 1M24.5 2.2l6-1.2-2 5.75"/>
          </svg>
        </span>` : "";
  const heightCallout = index === 1 ? `
        <span id="frame-height" class="work-measure work-measure-height spec-label" hidden aria-hidden="true"><span></span></span>` : "";
  const typeCallout = index === 2 ? `
      <span class="case-type spec-label" hidden aria-hidden="true"></span>` : "";
  card.innerHTML = `
    <div class="case-datum spec-label" aria-hidden="true"><i class="register"></i><span></span><i class="register"></i></div>
    <header class="case-header">
      <span class="case-count" aria-hidden="true"></span>
      <div><p class="label category"></p><h3></h3></div>${typeCallout}
    </header>
    <div class="case-body">
      <div class="case-media">
        <div class="media-stamp spec-label"><span>Project recording</span><span class="media-size"></span></div>
        <figure class="recording"></figure>${cornerCallout}${heightCallout}
      </div>
      <div class="case-note">
        <div class="case-copy"></div>
        <a class="action" target="_blank" rel="noopener">Original article <span aria-hidden="true">↗</span></a>
      </div>
    </div>`;
  card.querySelector(".case-count").textContent = number;
  card.querySelector(".case-datum span").textContent = "Case / " + number;
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
  const recording = card.querySelector("figure");
  addRecording(recording, project);
  const video = recording.querySelector("video");
  const mediaSize = card.querySelector(".media-size");
  video.addEventListener("loadedmetadata", () => {
    if (video.videoWidth && video.videoHeight) {
      mediaSize.textContent = video.videoWidth + " × " + video.videoHeight + " px";
    }
  });
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

addWorkflows(workflow);

const measurements = new Map([
  [projectList, ["width", document.querySelector("#project-width")]],
  [workflow, ["width", document.querySelector("#workflow-width")]],
]);
const frameHeight = document.querySelector("#frame-height");
if (frameHeight) measurements.set(frameHeight.closest(".case-media"), ["height", frameHeight]);

const sizes = new ResizeObserver(entries => {
  for (const { target } of entries) {
    const [axis, measure] = measurements.get(target);
    measure.firstElementChild.textContent = axis + " / " + Math.round(target.getBoundingClientRect()[axis]) + " px";
    measure.hidden = false;
  }
});
for (const target of measurements.keys()) sizes.observe(target, { box: "border-box" });

const typeLabel = document.querySelector(".case-type");
if (typeLabel) {
  const title = typeLabel.parentElement.querySelector("h3");
  const typeSize = new ResizeObserver(() => {
    typeLabel.textContent = "Title / " + getComputedStyle(title).fontSize.replace(/px$/, " px");
    typeLabel.hidden = false;
  });
  typeSize.observe(title);
}

const gridRulers = document.querySelectorAll(".work-grid-ruler");
const gridStep = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--grid-step"));
function alignGridRulers() {
  for (const ruler of gridRulers) {
    // Start at the next row of the page grid, even when the section moves.
    const sectionTop = ruler.parentElement.getBoundingClientRect().top + window.scrollY;
    const offset = Math.ceil(sectionTop / gridStep) * gridStep - sectionTop;
    ruler.style.setProperty("--grid-origin", offset + "px");
  }
}
const pageSize = new ResizeObserver(alignGridRulers);
pageSize.observe(document.querySelector(".work"));
pageSize.observe(document.querySelector(".header"));
