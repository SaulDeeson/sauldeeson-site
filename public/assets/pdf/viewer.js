const documentLayouts = matchMedia("(max-width: 700px)");
let pdfModule;

function loadPdfEngine() {
  pdfModule ??= import("./pdf.min.mjs").then(engine => {
    engine.GlobalWorkerOptions.workerSrc = new URL("./pdf.worker.min.mjs", import.meta.url).href;
    return engine;
  });
  return pdfModule;
}

class ArticlePdf {
  constructor(viewer, capture) {
    this.viewer = viewer;
    this.capture = capture;
    this.surface = viewer.querySelector(".pdf-surface");
    this.paper = viewer.querySelector(".pdf-paper");
    this.message = viewer.querySelector(".pdf-message");
    this.pageStatus = viewer.querySelector(".pdf-status");
    this.open = viewer.querySelector(".pdf-full");
    this.buttons = [...viewer.querySelectorAll("button")];
    this.page = 1;
    this.zoom = 1;
    this.generation = 0;
    this.documents = new Map();
    this.layout = this.preferredLayout(documentLayouts.matches);
    this.updateControls();
    viewer.addEventListener("click", event => this.handleClick(event));
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.render();
    if ("ResizeObserver" in window) {
      let width = this.surface.clientWidth;
      this.resizer = new ResizeObserver(() => {
        const nextWidth = this.surface.clientWidth;
        if (nextWidth === width || nextWidth < 1) return;
        width = nextWidth;
        if (this.document) this.render();
      });
      this.resizer.observe(this.surface);
    }
  }

  preferredLayout(isNarrow) {
    const preferred = isNarrow ? "mobile" : "desktop";
    return this.capture[preferred] ? preferred : (isNarrow ? "desktop" : "mobile");
  }

  async getDocument(layout) {
    if (!this.documents.has(layout)) {
      const loading = (async () => {
        const engine = await loadPdfEngine();
        const url = this.capture[layout];
        const pdf = await engine.getDocument({ url }).promise;
        return { engine, url, pdf };
      })();
      this.documents.set(layout, loading);
      loading.catch(() => this.documents.delete(layout));
    }
    return this.documents.get(layout);
  }

  setLayout(layout) {
    if (layout === this.layout) return;
    this.layout = layout;
    this.document = null;
    this.page = 1;
    this.zoom = 1;
    this.open.hidden = true;
    this.paper.hidden = true;
    this.surface.scrollTo(0, 0);
    this.updateControls();
    if (this.started) this.render();
  }

  handleClick(event) {
    const button = event.target.closest("button[data-pdf]");
    if (!button) return;
    const command = button.dataset.pdf;
    if (command === "desktop" || command === "mobile") {
      this.manualLayout = true;
      this.setLayout(command);
      return;
    }
    if (command === "previous" || command === "next") {
      this.page += command === "next" ? 1 : -1;
      this.surface.scrollTo(0, 0);
    } else {
      this.zoom = command === "fit" ? 1 : Math.min(2, this.zoom + .25);
    }
    this.updateControls();
    this.render();
  }

  updateControls() {
    const pages = this.document?.pdf.numPages;
    const url = this.capture[this.layout];
    if (url) {
      this.open.href = url;
      this.open.hidden = false;
    }
    this.pageStatus.textContent = pages ? "Page " + this.page + " / " + pages : "Page —";
    this.buttons.forEach(button => {
      const command = button.dataset.pdf;
      if (command === "desktop" || command === "mobile") {
        button.disabled = !this.capture[command];
        button.setAttribute("aria-pressed", String(command === this.layout));
        return;
      }
      button.disabled = !pages || (command === "previous" && this.page <= 1)
        || (command === "next" && this.page >= pages)
        || (command === "zoom" && this.zoom >= 2)
        || (command === "fit" && this.zoom === 1);
    });
  }

  async render() {
    const version = ++this.generation;
    if (!this.document) {
      this.surface.dataset.state = "loading";
      this.message.textContent = "Loading PDF…";
      this.message.hidden = false;
    }
    try {
      const file = await this.getDocument(this.layout);
      if (version !== this.generation) return;
      this.document = file;
      this.open.href = file.url;
      this.open.hidden = false;
      this.updateControls();
      const page = await file.pdf.getPage(this.page);
      if (version !== this.generation) return;

      const natural = page.getViewport({ scale: 1 });
      const style = getComputedStyle(this.surface);
      const available = this.surface.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const fitWidth = this.layout === "mobile" ? Math.min(available, 315) : available;
      const scale = Math.max(1, fitWidth) / natural.width * this.zoom;
      const viewport = page.getViewport({ scale });
      const density = Math.min(devicePixelRatio || 1, 2, 4096 / Math.max(viewport.width, viewport.height));
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.width = Math.ceil(viewport.width * density);
      canvas.height = Math.ceil(viewport.height * density);
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";

      const text = document.createElement("div");
      text.className = "textLayer";
      text.style.setProperty("--total-scale-factor", scale * page.userUnit);
      const layer = new file.engine.TextLayer({
        textContentSource: page.streamTextContent(), container: text, viewport
      });
      await Promise.all([
        page.render({ canvas, viewport, transform: [density, 0, 0, density, 0, 0] }).promise,
        layer.render().catch(() => text.replaceChildren())
      ]);
      if (version !== this.generation) return;
      this.paper.replaceChildren(canvas, text);
      this.paper.hidden = false;
      this.message.hidden = true;
      this.surface.dataset.state = "ready";
    } catch {
      if (version !== this.generation) return;
      this.paper.hidden = true;
      this.message.hidden = false;
      this.message.textContent = this.open.hidden
        ? "This PDF could not be displayed here. The original article is available alongside it."
        : "This PDF could not be displayed here. Use Open PDF to view the document.";
      this.surface.dataset.state = "error";
    }
  }
}


export function mountPdf(details, capture) {
  if (!document.querySelector("[data-pdf-styles]")) {
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = new URL("./viewer.css", import.meta.url).href;
    styles.dataset.pdfStyles = "";
    document.head.append(styles);
  }
  details.insertAdjacentHTML("beforeend", `<figure class="pdf-viewer" aria-label="PDF capture">
                <div class="pdf-head">
                  <div class="pdf-label"><span class="label">Document viewer</span></div>
                  <div class="pdf-controls" role="group" aria-label="PDF version">
                    <button type="button" class="pdf-control" data-pdf="desktop" aria-pressed="true">Desktop</button>
                    <button type="button" class="pdf-control" data-pdf="mobile" aria-pressed="false">Mobile</button>
                  </div>
                </div>
                <div class="pdf-surface" tabindex="0" role="region" aria-label="Document page" data-state="loading">
                  <div class="pdf-paper" hidden></div>
                  <p class="pdf-message">Loading PDF…</p>
                </div>
                <div class="pdf-footer">
                  <div class="pdf-controls" role="group" aria-label="PDF pages and zoom">
                    <button type="button" class="pdf-control" data-pdf="previous" aria-label="Previous PDF page" disabled>‹</button>
                    <span class="pdf-status" aria-live="polite">Page</span>
                    <button type="button" class="pdf-control" data-pdf="next" aria-label="Next PDF page" disabled>›</button>
                    <button type="button" class="pdf-control" data-pdf="zoom" aria-label="Zoom in" disabled>+</button>
                    <button type="button" class="pdf-control" data-pdf="fit" aria-label="Fit PDF to width" disabled>Fit</button>
                  </div>
                  <a class="pdf-full" target="_blank" rel="noopener" hidden>Open PDF <span aria-hidden="true">↗</span></a>
                </div>
              </figure>
  `);
  const reader = new ArticlePdf(details.querySelector(".pdf-viewer"), capture);
  documentLayouts.addEventListener("change", event => {
    if (!reader.manualLayout) reader.setLayout(reader.preferredLayout(event.matches));
  });
  details.addEventListener("toggle", () => {
    if (details.open && !reader.document) reader.render();
  });
  reader.start();
}
