import { videoDirectory } from "./media.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const recordings = new Map();
let active;

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    recordings.get(entry.target).visibility = entry.intersectionRatio;
  }
  chooseRecording();
}, { threshold: [0, .15, .3, .45, .6, .75, .9, 1] });

function chooseRecording() {
  if (document.fullscreenElement || active?.figure.classList.contains("expanded")) return;
  let next;
  if (!document.hidden) {
    for (const player of recordings.values()) {
      if (player.visibility >= .15 && (!next || player.visibility > next.visibility)) next = player;
    }
  }
  if (next === active) return;
  active?.video.pause();
  active = next;
  if (active && !active.failed) {
    active.load();
    if (!reducedMotion.matches && !active.userPaused && !active.video.ended) active.play();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) active?.video.pause();
  else {
    active = undefined;
    chooseRecording();
  }
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) active?.video.pause();
  else if (active && !active.userPaused && !active.failed && !active.video.ended) active.play();
});

function timecode(seconds) {
  const whole = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
}

export function addRecording(figure, project) {
  figure.setAttribute("aria-label", project.title + " recording");
  figure.innerHTML = `
    <div class="media-stage">
      <video playsinline muted preload="none" tabindex="-1" disablepictureinpicture></video>
      <div class="media-cover" hidden>
        <span class="media-loading" aria-hidden="true"></span>
        <p hidden></p>
        <button class="action" type="button" hidden>Retry video</button>
      </div>
    </div>
    <div class="controls" hidden>
      <button class="play" type="button" aria-label="Play">Play</button>
      <input class="seek" type="range" min="0" max="1" step="0.1" value="0" aria-label="Seek through the recording">
      <output aria-hidden="true">0:00 / 0:00</output>
      <button class="fullscreen" type="button">Full screen</button>
    </div>`;

  const video = figure.querySelector("video");
  const stage = figure.querySelector(".media-stage");
  const cover = figure.querySelector(".media-cover");
  const loader = cover.querySelector(".media-loading");
  const retry = cover.querySelector("button");
  const feedback = cover.querySelector("p");
  const controls = figure.querySelector(".controls");
  const play = controls.querySelector(".play");
  const seek = controls.querySelector(".seek");
  const output = controls.querySelector("output");
  const fullscreen = controls.querySelector(".fullscreen");
  const covered = [];
  let focusOnLoad = false;

  const player = {
    figure, video, visibility: 0, failed: false, userPaused: false,
    load() {
      if (video.hasAttribute("src") && !player.failed) return;
      player.failed = false;
      cover.hidden = false;
      loader.hidden = false;
      feedback.hidden = true;
      retry.hidden = true;
      video.preload = reducedMotion.matches ? "metadata" : "auto";
      video.src = videoDirectory + encodeURIComponent(project.video);
    },
    play() {
      if (active !== player || player.failed || document.hidden) return;
      video.muted = true;
      video.play().catch(error => {
        if (error.name === "NotAllowedError" && !player.failed) controls.hidden = false;
      });
    }
  };

  function expand() {
    let section = figure;
    while (section !== document.body) {
      for (const sibling of section.parentElement.children) {
        if (sibling !== section && !sibling.inert) {
          sibling.inert = true;
          covered.push(sibling);
        }
      }
      section = section.parentElement;
    }
    figure.classList.add("expanded");
    figure.setAttribute("aria-modal", "true");
    figure.setAttribute("role", "dialog");
    document.body.classList.add("recording-expanded");
    fullscreen.textContent = "Exit full screen";
    fullscreen.focus();
  }

  function collapse() {
    figure.classList.remove("expanded");
    figure.removeAttribute("aria-modal");
    figure.removeAttribute("role");
    document.body.classList.remove("recording-expanded");
    for (const sibling of covered.splice(0)) sibling.inert = false;
    fullscreen.textContent = "Full screen";
    fullscreen.focus({ preventScroll: true });
    chooseRecording();
  }

  function playLabel(label) {
    play.textContent = label;
    play.setAttribute("aria-label", label);
  }

  function updatePosition() {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    seek.max = video.duration;
    seek.value = video.currentTime;
    seek.setAttribute("aria-valuetext", timecode(video.currentTime) + " of " + timecode(video.duration));
    output.textContent = timecode(video.currentTime) + " / " + timecode(video.duration);
  }

  retry.addEventListener("click", () => {
    focusOnLoad = true;
    player.load();
    if (active && active !== player) active.video.pause();
    active = player;
    player.userPaused = false;
    player.play();
  });
  video.addEventListener("loadedmetadata", () => {
    cover.hidden = true;
    controls.hidden = false;
    updatePosition();
    if (focusOnLoad) play.focus({ preventScroll: true });
    focusOnLoad = false;
  });
  video.addEventListener("timeupdate", updatePosition);
  video.addEventListener("volumechange", () => { video.muted = true; });
  video.addEventListener("error", () => {
    player.failed = true;
    if (figure.classList.contains("expanded")) collapse();
    if (document.fullscreenElement === figure) document.exitFullscreen().catch(() => {});
    const shouldFocus = focusOnLoad || figure.contains(document.activeElement);
    controls.hidden = true;
    cover.hidden = false;
    loader.hidden = true;
    feedback.textContent = "Recording unavailable.";
    feedback.hidden = false;
    retry.hidden = false;
    if (shouldFocus) retry.focus({ preventScroll: true });
    focusOnLoad = false;
  });
  video.addEventListener("play", () => playLabel("Pause"));
  video.addEventListener("pause", () => playLabel(video.ended ? "Replay" : "Play"));
  video.addEventListener("ended", () => playLabel("Replay"));

  play.addEventListener("click", () => {
    player.userPaused = !video.paused;
    if (player.userPaused) video.pause();
    else {
      if (active && active !== player) active.video.pause();
      active = player;
      player.play();
    }
  });
  video.addEventListener("click", () => play.click());
  seek.addEventListener("input", () => { video.currentTime = Number(seek.value); });
  fullscreen.addEventListener("click", async () => {
    if (figure.classList.contains("expanded")) {
      collapse();
      return;
    }
    if (document.fullscreenElement === figure) {
      await document.exitFullscreen();
      return;
    }
    if (figure.requestFullscreen && document.fullscreenEnabled) {
      try {
        await figure.requestFullscreen();
        return;
      } catch {
        // Use the expanded player when the browser blocks fullscreen.
      }
    }
    expand();
  });
  figure.addEventListener("keydown", event => {
    if (!figure.classList.contains("expanded")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      collapse();
    } else if (event.key === "Tab") {
      if (event.shiftKey && document.activeElement === play) {
        event.preventDefault();
        fullscreen.focus();
      } else if (!event.shiftKey && document.activeElement === fullscreen) {
        event.preventDefault();
        play.focus();
      }
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (figure.classList.contains("expanded")) return;
    fullscreen.textContent = document.fullscreenElement === figure ? "Exit full screen" : "Full screen";
    if (!document.fullscreenElement) chooseRecording();
  });

  recordings.set(stage, player);
  observer.observe(stage);
}
