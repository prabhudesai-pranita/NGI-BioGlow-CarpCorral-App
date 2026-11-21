
const STORAGE_KEY = "carpcorral_demo_v1";

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
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  );
  if (saved && Array.isArray(saved.history)) {
    state = { ...newState(), ...saved };
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

  const tbody = document.getElementById(
    "historyBody"
  );
  tbody.replaceChildren();

  if (!state.history.length) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "No detections yet.";
    return;
  }

  state.history.forEach(event => {
    const row = tbody.insertRow();
    [
      event.time,
      event.fish,
      event.confidence === null
        ? "--"
        : `${event.confidence}%`,
      event.gate
    ].forEach(value => {
      row.insertCell().textContent = value;
    });
  });
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

document.getElementById("clearHistory")
  .addEventListener("click", () => {
    if (!confirm("Clear all demo history and counts?")) {
      return;
    }
    state = newState();
    save();
    render();
  });

document.getElementById("downloadHistory")
  .addEventListener("click", () => {
    const rows = [
      ["Time", "Fish", "Confidence", "Gate"],
      ...state.history.map(e => [
        e.time,
        e.fish,
        e.confidence ?? "",
        e.gate
      ])
    ];

    const csv = rows.map(row =>
      row.map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    ).join("\r\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carpcorral-history.csv";
    link.click();
    URL.revokeObjectURL(url);
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
          "CarpCorral PWA registered:",
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
