
const STORAGE_KEY = "carpSORT_demo_v1";
const LEGACY_STORAGE_KEY = "carpcorral_demo_v1";

function newState() {
  return {
    carpCount: 0,
    nativeCount: 0,
    lastFish: "Waiting for fish",
    confidence: null,
    gate: "NEUTRAL",
    sound: false,
    history: []
  };
}

let state = newState();

try {
  const currentSaved = localStorage.getItem(STORAGE_KEY);
  const legacySaved = currentSaved === null
    ? localStorage.getItem(LEGACY_STORAGE_KEY)
    : null;
  const saved = currentSaved ?? legacySaved;

  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.history)) {
      state = { ...newState(), ...parsed };

      if (currentSaved === null) {
        localStorage.setItem(STORAGE_KEY, saved);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
  }
} catch (error) {
  console.warn("Starting with fresh demo data");
}

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Could not save demo data");
  }
}

function show(id, value) {
  document.getElementById(id).textContent = value;
}

function render() {
  show("carpCount", state.carpCount);
  show("nativeCount", state.nativeCount);
  show(
    "totalCount",
    state.carpCount + state.nativeCount
  );

  show("fishName", state.lastFish);
  show(
    "confidence",
    state.confidence === null
      ? "Confidence: --"
      : `Confidence: ${state.confidence}%`
  );

  show("gateStatus", state.gate);
  show("soundStatus", state.sound ? "ON" : "OFF");

  show(
    "lastDetection",
    state.history.length
      ? state.history[0].time
      : "None"
  );
}

function recordEvent(fish, confidence) {
  const event = {
    time: new Date().toLocaleString(),
    fish,
    confidence,
    gate: state.gate
  };

  state.history.unshift(event);
  state.history = state.history.slice(0, 100);
  save();
  render();
}

function detectFish(type) {
  if (type === "carp") {
    state.carpCount++;
    state.lastFish = "Invasive Carp";
    state.confidence = 97;
    state.gate = "CARP EXIT";
    state.sound = true;
  } else if (type === "native") {
    state.nativeCount++;
    state.lastFish = "Native Fish";
    state.confidence = 96;
    state.gate = "NATIVE EXIT";
    state.sound = false;
  } else {
    state.lastFish = "Unknown Fish";
    state.confidence = null;
    state.gate = "NEUTRAL";
    state.sound = false;
  }

  recordEvent(state.lastFish, state.confidence);
}

document.getElementById("detectCarp")
  .addEventListener("click", () => detectFish("carp"));

document.getElementById("detectNative")
  .addEventListener("click", () => detectFish("native"));

document.getElementById("detectUnknown")
  .addEventListener("click", () => detectFish("unknown"));

document.getElementById("soundToggle")
  .addEventListener("click", () => {
    state.sound = !state.sound;
    save();
    render();
  });

document.getElementById("resetGate")
  .addEventListener("click", () => {
    state.gate = "NEUTRAL";
    state.sound = false;
    save();
    render();
  });

document.querySelectorAll("nav button")
  .forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("nav button")
        .forEach(b => b.classList.remove("active"));

      document.querySelectorAll(".page")
        .forEach(p => p.classList.remove("active"));

      button.classList.add("active");

      document.getElementById(
        button.dataset.page
      ).classList.add("active");
    });
  });

render();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(registration => {
        console.log(
          "CarpSORT PWA registered:",
          registration.scope
        );
      })
      .catch(error => {
        console.error(
          "Service worker registration failed:",
          error
        );
      });
  });
}
