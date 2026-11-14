const deck = document.querySelector(".observation-deck");
const scene = document.querySelector(".deck-scene");
const placard = document.querySelector(".deck-placard");
const socket = document.querySelector(".deck-socket");
const planet = document.querySelector(".deck-planet");
const intro = document.querySelector(".deck-intro");
const railing = document.querySelector(".deck-railing");
const routes = document.querySelector(".deck-routes");
const traces = document.querySelector(".deck-traces");
const trunk = traces.querySelector(".trace-trunk");
const span = document.querySelector("#deck-span");
const spanLabel = span.closest(".deck-span");
const branches = [...routes.querySelectorAll("[data-deck-route]")].map(link => ({
  link,
  line: traces.querySelector("path.trace-" + link.dataset.deckRoute),
  endpoint: traces.querySelector("circle.trace-" + link.dataset.deckRoute),
}));

function drawTraces() {
  const bounds = deck.getBoundingClientRect();
  const beam = placard.getBoundingClientRect();
  const connector = socket.getBoundingClientRect();
  const copy = intro.getBoundingClientRect();
  const rail = railing.getBoundingClientRect();
  const landing = routes.getBoundingClientRect();

  const targets = branches.map(branch => ({
    ...branch,
    bounds: branch.link.getBoundingClientRect(),
  }));
  const stacked = targets[1].bounds.top > targets[0].bounds.top;
  const sourceX = Math.round((connector.left + connector.right) / 2 - bounds.left);
  const y = Math.round(connector.bottom - bounds.top - 1);
  const split = Math.round(rail.top - bounds.top + 7);
  const landingY = Math.round(landing.top - bounds.top);
  const x = Math.round(stacked ? sourceX : Math.max(sourceX, copy.right - bounds.left + 12));
  const beamSpan = Math.round(Math.hypot(beam.width, beam.height - placard.offsetHeight));

  traces.setAttribute("viewBox", "0 0 " + bounds.width + " " + bounds.height);
  trunk.setAttribute("d", x === sourceX
    ? `M ${x} ${y} V ${split}`
    : `M ${sourceX} ${y} C ${sourceX} ${y + 16} ${x} ${y + 12} ${x} ${y + 33} V ${split}`);

  targets.forEach(({ line, endpoint, bounds: linkBounds }, index) => {
    const endY = Math.round(linkBounds.top - bounds.top + 14);
    let endX;
    if (stacked) {
      endX = x + 10;
      const startY = index === 0 ? split : landingY + 14;
      line.setAttribute("d", `M ${x} ${startY} V ${endY} H ${endX}`);
    } else {
      const radius = 12;
      endX = Math.round(linkBounds.left - bounds.left + linkBounds.width * (index === 0 ? .72 : .25));
      const direction = Math.sign(endX - x);
      const changeY = index === 0 ? split + 6 : split + 13;
      const kneeX = index === 0 ? endX + 23 : endX - 24;
      line.setAttribute("d", `M ${x} ${split}
        Q ${x} ${changeY} ${x + direction * radius} ${changeY}
        H ${kneeX - direction * radius} Q ${kneeX} ${changeY} ${kneeX} ${changeY + radius}
        V ${landingY - 10} L ${endX} ${endY}`);
    }
    endpoint.setAttribute("cx", endX);
    endpoint.setAttribute("cy", endY);
  });

  traces.classList.add("is-drawn");
  const dimension = beamSpan + " PX";
  if (span.textContent !== dimension) span.textContent = dimension;
  spanLabel.hidden = false;
}

const dimensions = new ResizeObserver(drawTraces);
dimensions.observe(deck);
dimensions.observe(placard);
dimensions.observe(intro);

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(any-hover: hover) and (any-pointer: fine)");
let onScreen = true;
let frame = 0;
let previousTime = 0;
let bounds;
let x = 0;
let y = 0;
let goalX = 0;
let goalY = 0;

function applyParallax() {
  scene.style.setProperty("--planet-x", x.toFixed(2) + "px");
  scene.style.setProperty("--planet-y", y.toFixed(2) + "px");
  scene.style.setProperty("--traffic-x", (x * 1.5).toFixed(2) + "px");
  scene.style.setProperty("--traffic-y", (y * 1.5).toFixed(2) + "px");
}

function movePlanet(now) {
  const elapsed = previousTime ? Math.min(48, now - previousTime) : 16;
  previousTime = now;
  const easing = 1 - Math.exp(-elapsed / 112);
  x += (goalX - x) * easing;
  y += (goalY - y) * easing;
  if (Math.abs(goalX - x) + Math.abs(goalY - y) < .12) {
    x = goalX;
    y = goalY;
    frame = 0;
    previousTime = 0;
  } else {
    frame = requestAnimationFrame(movePlanet);
  }
  applyParallax();
}

function holdParallax() {
  cancelAnimationFrame(frame);
  frame = 0;
  previousTime = 0;
}

function stopParallax() {
  holdParallax();
  bounds = undefined;
  x = y = goalX = goalY = 0;
  applyParallax();
}

function syncMotion() {
  const active = onScreen && !document.hidden && !deck.hasAttribute("data-arriving");
  if (reducedMotion.matches) {
    deck.removeAttribute("data-motion");
    deck.classList.remove("is-flickering");
  } else deck.dataset.motion = active ? "running" : "paused";

  if (reducedMotion.matches || !active || !finePointer.matches) stopParallax();
}

scene.addEventListener("pointermove", event => {
  if (event.pointerType === "touch" || !finePointer.matches || deck.dataset.motion !== "running") return;
  bounds ??= scene.getBoundingClientRect();
  const panX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
  const panY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
  goalX = -Math.min(1, Math.max(-1, panX)) * Math.min(8, bounds.width * .006);
  goalY = -Math.min(1, Math.max(-1, panY)) * Math.min(4, bounds.height * .004);
  frame ||= requestAnimationFrame(movePlanet);
}, { passive: true });

routes.addEventListener("pointerenter", holdParallax);
deck.addEventListener("pointerleave", () => {
  bounds = undefined;
  goalX = goalY = 0;
  if (!frame && (x || y)) frame = requestAnimationFrame(movePlanet);
});

window.addEventListener("resize", () => { bounds = undefined; }, { passive: true });
window.addEventListener("scroll", () => { bounds = undefined; }, { passive: true });

const visibility = new IntersectionObserver(([entry]) => {
  onScreen = entry.isIntersecting;
  syncMotion();
});
visibility.observe(scene);
document.addEventListener("visibilitychange", syncMotion);
reducedMotion.addEventListener("change", syncMotion);
finePointer.addEventListener("change", syncMotion);
syncMotion();

const lightTrigger = railing.querySelector(".deck-light-trigger");
railing.querySelector(".deck-lamp-shade").addEventListener("animationend", event => {
  if (event.animationName === "lamp-triggered") deck.classList.remove("is-flickering");
});
lightTrigger.addEventListener("click", () => {
  if (!reducedMotion.matches) deck.classList.add("is-flickering");
});
lightTrigger.hidden = false;

async function playArrival() {
  const cover = document.querySelector(".deck-arrival");
  const closeup = cover.querySelector("img");
  const canStart = () => !reducedMotion.matches && !document.hidden && !location.hash &&
    scrollY === 0 && document.activeElement === document.body && cover.clientWidth > 0;
  if (!canStart() || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    cover.remove();
    return;
  }

  let finished = false;
  const animations = [];
  const inputEvents = ["pointerdown", "keydown", "wheel", "scroll", "resize", "focusin", "pagehide"];
  function finish() {
    if (finished) return;
    finished = true;
    for (const animation of animations) animation.cancel();
    cover.remove();
    for (const event of inputEvents) window.removeEventListener(event, finish);
    reducedMotion.removeEventListener("change", finish);
    document.removeEventListener("visibilitychange", finish);
    deck.removeAttribute("data-arriving");
    syncMotion();
  }

  for (const event of inputEvents) window.addEventListener(event, finish, { passive: true });
  reducedMotion.addEventListener("change", finish);
  document.addEventListener("visibilitychange", finish);

  try {
    const images = [closeup, placard.querySelector(".deck-gantry"), railing.querySelector("img")];
    await Promise.all([document.fonts.ready, ...images.map(image => image.decode())]);
  } catch {
    finish();
    return;
  }
  if (finished || !canStart() || performance.now() > 850) {
    finish();
    return;
  }

  // The aperture closes onto the real angled beam and railing.
  deck.dataset.arriving = "";
  syncMotion();
  const { clientWidth: width, clientHeight: height } = cover;
  const beam = placard.getBoundingClientRect();
  const edge = Math.round(width * .0385);
  const rise = beam.height - placard.offsetHeight;
  const sill = Math.min(height, Math.round(railing.getBoundingClientRect().top + 6));
  const openingTop = beam.bottom - rise * edge / width;
  if (sill - openingTop < 20) {
    finish();
    return;
  }
  const corners = [[0, 0], [width, 0], [width, height], [0, height]];
  const opening = [
    [edge, openingTop],
    [width - edge, beam.bottom - rise * (1 - edge / width)],
    [width - edge, sill],
    [edge, sill],
  ];
  const aperture = (amount) => "polygon(" + corners.map(([x, y], index) => {
    const [endX, endY] = opening[index];
    return `${x + (endX - x) * amount}px ${y + (endY - y) * amount}px`;
  }).join(", ") + ")";
  const horizon = planet.getBoundingClientRect();
  const objectPosition = getComputedStyle(planet).objectPosition;

  cover.dataset.ready = "";
  const duration = 1420;
  animations.push(closeup.animate([
    { width: width + "px", height: height + "px", left: "0px", top: "0px", objectPosition: "58% 76%", transform: "scale(1.37)" },
    { width: horizon.width + "px", height: horizon.height + "px", left: horizon.left + "px", top: horizon.top + "px", objectPosition, transform: "scale(1)" }
  ], { duration: 1000, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }));
  const reveal = cover.animate([
    { clipPath: aperture(0), opacity: 1, offset: 0, easing: "ease-in-out" },
    { clipPath: aperture(.28), opacity: 1, offset: .26, easing: "cubic-bezier(.22,.69,.29,1)" },
    { clipPath: aperture(1), opacity: 1, offset: .7, easing: "ease-out" },
    { clipPath: aperture(1), opacity: 0, offset: 1 }
  ], { duration, fill: "both" });
  animations.push(reveal);
  for (const element of [intro, traces]) {
    animations.push(element.animate([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: .72 },
      { opacity: 1, offset: 1 },
    ], { duration, fill: "both" }));
  }
  reveal.finished.then(finish, finish);
}

playArrival();
