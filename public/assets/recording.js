import { publishedVideoDirectory, videoDirectory } from "./media.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const recordings = new Map();
let active;
let nativeFullscreen;

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    recordings.get(entry.target).visibility = entry.intersectionRatio;
  }
  chooseRecording();
}, { threshold: [0, .15, .3, .45, .6, .75, .9, 1] });

function chooseRecording() {
  if (document.fullscreenElement || nativeFullscreen || active?.figure.classList.contains("expanded")) return;
  let next;
  if (!document.hidden) {
    for (const player of recordings.values()) {
      if (player.visibility >= .15 && (!next || player.visibility > next.visibility)) next = player;
    }
  }
  if (next === active) return;
  active?.pause();
  active = next;
  if (active && !active.failed) {
    active.load();
    if (!reducedMotion.matches && !active.userPaused) active.play();
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    active?.pause();
    return;
  }
  chooseRecording();
  if (!reducedMotion.matches && active && !active.userPaused) active.play();
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) active?.pause();
  else if (active && !active.userPaused) active.play();
});

function timecode(seconds) {
  const whole = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
  return Math.floor(whole / 60) + ":" + String(whole % 60).padStart(2, "0");
}

export function addRecording(figure, project) {
  figure.setAttribute("aria-label", project.title + " recording");
  figure.innerHTML = `
    <div class="media-stage">
      <video playsinline muted loop preload="none" tabindex="-1" disablepictureinpicture></video>
      <div class="media-cover" data-signal="standby">
        <div class="media-scope" aria-hidden="true"><i></i></div>
        <p class="media-message">Stand by</p>
        <button class="action" type="button" hidden>Retry video</button>
      </div>
    </div>
    <div class="controls">
      <button class="play" type="button" aria-label="Play">Play</button>
      <input class="seek" type="range" min="0" max="1" step="0.1" value="0" aria-label="Seek through the recording" disabled>
      <output aria-hidden="true">0:00 / –:––</output>
      <button class="fullscreen" type="button" disabled>Full screen</button>
    </div>`;

  const video = figure.querySelector("video");
  const stage = figure.querySelector(".media-stage");
  const cover = figure.querySelector(".media-cover");
  const retry = cover.querySelector("button");
  const message = cover.querySelector(".media-message");
  const play = figure.querySelector(".play");
  const seek = figure.querySelector(".seek");
  const output = figure.querySelector("output");
  const fullscreen = figure.querySelector(".fullscreen");
  const covered = [];
  let wantsPlayback = false;
  let buffering;
  const touchScreen = matchMedia("(any-pointer: coarse)");
  let landscapeLocked = false;
  const filename = encodeURIComponent(project.video);

  function showSignal(state, text) {
    cover.dataset.signal = state;
    cover.hidden = false;
    message.textContent = text;
    retry.hidden = state !== "unavailable";
  }

  function showFrame() {
    clearTimeout(buffering);
    if (!player.failed && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) cover.hidden = true;
  }

  function setSource(source) {
    seek.disabled = true;
    seek.value = "0";
    seek.removeAttribute("aria-valuetext");
    output.textContent = "0:00 / –:––";
    fullscreen.disabled = true;
    showSignal("tuning", "Tuning in…");
    video.src = source;
  }

  const player = {
    figure, visibility: 0, failed: false, userPaused: false,
    load() {
      if (video.hasAttribute("src") && !player.failed) return;
      player.failed = false;
      video.preload = reducedMotion.matches ? "metadata" : "auto";
      setSource(videoDirectory + filename);
    },
    play() {
      if (active !== player || player.failed || document.hidden) return;
      wantsPlayback = true;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) showSignal("tuning", "Tuning in…");
      video.muted = true;
      video.play().catch(error => {
        if (error.name !== "NotAllowedError" || !wantsPlayback || player.failed) return;
        wantsPlayback = false;
        playLabel("Play");
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) showSignal("standby", "Press Play to tune in");
      });
    },
    pause() {
      wantsPlayback = false;
      video.pause();
      showFrame();
      if (!player.failed && video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) showSignal("standby", "Press Play to tune in");
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

  function playManually() {
    if (active !== player) active?.pause();
    active = player;
    player.userPaused = false;
    player.load();
    player.play();
  }

  retry.addEventListener("click", () => {
    playManually();
    play.focus({ preventScroll: true });
  });
  video.addEventListener("loadedmetadata", () => {
    seek.disabled = !Number.isFinite(video.duration) || video.duration <= 0;
    fullscreen.disabled = false;
    updatePosition();
    if (video.paused && !wantsPlayback) showSignal("standby", "Press Play to tune in");
  });
  for (const event of ["loadeddata", "canplay", "playing", "seeked"]) video.addEventListener(event, showFrame);
  video.addEventListener("waiting", () => {
    if (!cover.hidden || video.paused) return;
    clearTimeout(buffering);
    buffering = setTimeout(() => {
      if (!player.failed && !video.paused && video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
        showSignal("tuning", "Tuning in…");
      }
    }, 300);
  });
  video.addEventListener("timeupdate", updatePosition);
  video.addEventListener("volumechange", () => { video.muted = true; });
  video.addEventListener("error", () => {
    if (videoDirectory !== publishedVideoDirectory && video.getAttribute("src") === videoDirectory + filename) {
      setSource(publishedVideoDirectory + filename);
      if (wantsPlayback) player.play();
      return;
    }
    const shouldFocus = figure.contains(document.activeElement);
    player.failed = true;
    wantsPlayback = false;
    clearTimeout(buffering);
    if (figure.classList.contains("expanded")) collapse();
    if (document.fullscreenElement === figure) document.exitFullscreen().catch(() => {});
    seek.disabled = true;
    fullscreen.disabled = true;
    playLabel("Play");
    showSignal("unavailable", "Recording unavailable");
    if (shouldFocus) retry.focus({ preventScroll: true });
  });
  video.addEventListener("play", () => playLabel("Pause"));
  video.addEventListener("pause", () => {
    playLabel("Play");
    showFrame();
  });

  play.addEventListener("click", () => {
    player.userPaused = !video.paused;
    if (player.userPaused) player.pause();
    else playManually();
  });
  video.addEventListener("click", () => play.click());
  seek.addEventListener("input", () => { video.currentTime = Number(seek.value); });
  async function requestLandscape() {
    if (!touchScreen.matches || !screen.orientation?.lock) return;
    try {
      await screen.orientation.lock("landscape");
      if (document.fullscreenElement === figure) landscapeLocked = true;
      else screen.orientation.unlock?.();
    } catch {
      // Some mobile browsers leave orientation to the device.
    }
  }

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
        await requestLandscape();
        return;
      } catch {
        // Use the expanded player when the browser blocks fullscreen.
      }
    }
    if (touchScreen.matches && typeof video.webkitEnterFullscreen === "function") {
      try {
        video.webkitEnterFullscreen();
        return;
      } catch {
        // Native video fullscreen is unavailable for this video.
      }
    }
    expand();
  });

  video.addEventListener("webkitbeginfullscreen", () => {
    nativeFullscreen = video;
  });
  video.addEventListener("webkitendfullscreen", () => {
    if (nativeFullscreen === video) nativeFullscreen = undefined;
    fullscreen.focus({ preventScroll: true });
    chooseRecording();
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
    if (document.fullscreenElement !== figure && landscapeLocked) {
      screen.orientation.unlock?.();
      landscapeLocked = false;
    }
    if (!document.fullscreenElement) chooseRecording();
  });

  recordings.set(stage, player);
  observer.observe(stage);
}
