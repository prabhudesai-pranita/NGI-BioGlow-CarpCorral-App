
// =========================================
// CarpSORT - Firebase Integration
// NextGen Innovators
// =========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// =========================================
// Firebase Configuration
// =========================================

const firebaseConfig = {
  apiKey: "AIzaSyDJJrFRjgR6iojV7wyHqH1W9fyZZYnvg_Q",
  authDomain: "ngi-bioglow-carpcorral.firebaseapp.com",
  projectId: "ngi-bioglow-carpcorral",
  storageBucket: "ngi-bioglow-carpcorral.firebasestorage.app",
  messagingSenderId: "350780567566",
  appId: "1:350780567566:web:1560da00a5dde19d990c5f",
  measurementId: "G-77FS8FJXJ6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =========================================
// Firestore Document References
// =========================================

const liveRef = doc(db, "system", "live");
const controlsRef = doc(db, "system", "controls");


// =========================================
// Helper Functions
// =========================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}


// =========================================
// Display Fish Detection Photo
// =========================================

function displayFishPhoto(imageUrl) {

  const capture =
    document.getElementById("liveFishCapture");

  const photo =
    document.getElementById("liveFishPhoto");

  if (!capture || !photo) return;

  const hasPhoto =
    typeof imageUrl === "string" &&
    imageUrl.startsWith("data:image/jpeg;base64,") &&
    imageUrl.length > "data:image/jpeg;base64,".length;

  if (hasPhoto) {

    photo.src = imageUrl;
    capture.hidden = false;

  } else {

    capture.hidden = true;
    photo.removeAttribute("src");

  }
}


// =========================================
// Display Live Fish Detection Data
// =========================================

function displayLiveData(data) {

  const carp = data.carpCount ?? 0;
  const native = data.nativeCount ?? 0;

  setText("liveCarpCount", carp);
  setText("liveNativeCount", native);
  setText("liveTotalCount", carp + native);

  setText(
    "liveFishName",
    data.lastFish ?? "None"
  );

  setText(
    "liveConfidence",
    `Confidence: ${data.confidence ?? 0}%`
  );

  setText(
    "liveGateStatus",
    data.gate ?? "NEUTRAL"
  );

  setText(
    "liveDeviceStatus",
    data.deviceConnected ? "Connected" : "Offline"
  );

  setText(
    "liveMode",
    data.mode ?? "UNKNOWN"
  );

  // Sound status is now handled separately
  // by the system/controls document.

  displayFishPhoto(data.lastFishImage);
}


// =========================================
// Listen for Live Fish Detection Updates
// =========================================

onSnapshot(
  liveRef,

  snapshot => {

    if (!snapshot.exists()) {

      displayLiveData({});
      setText("firebaseStatus", "No live data");
      return;

    }

    displayLiveData(snapshot.data());

    setText(
      "firebaseStatus",
      "Cloud connected"
    );

  },

  error => {

    console.error("Firebase error:", error);

    setText(
      "firebaseStatus",
      "Connection error"
    );

  }
);


// =========================================
// Detection History
// =========================================

let liveHistory = [];

const historyQuery = query(
  collection(db, "detections"),
  orderBy("detectedAt", "desc"),
  limit(100)
);


// =========================================
// Render Detection History
// =========================================

function renderHistory(
  message = "No detections yet."
) {

  const tbody =
    document.getElementById("historyBody");

  const download =
    document.getElementById("downloadHistory");

  if (!tbody || !download) return;

  tbody.replaceChildren();

  download.disabled =
    liveHistory.length === 0;

  if (liveHistory.length === 0) {

    const cell =
      tbody.insertRow().insertCell();

    cell.colSpan = 4;
    cell.textContent = message;

    return;

  }

  for (const event of liveHistory) {

    const row = tbody.insertRow();

    const confidence =
      event.confidence == null
        ? "--"
        : `${event.confidence}%`;

    for (const value of [
      event.time,
      event.fish,
      confidence,
      event.gate
    ]) {

      row.insertCell().textContent = value;

    }
  }
}

renderHistory("Loading detection history…");


// =========================================
// Listen for Detection History Updates
// =========================================

onSnapshot(
  historyQuery,

  snapshot => {

    liveHistory = snapshot.docs.map(record => {

      const data = record.data();

      return {

        time:
          data.detectedAt?.toDate()
            .toLocaleString() ?? "--",

        fish: data.fish ?? "--",

        confidence: data.confidence ?? null,

        gate: data.gate ?? "--"

      };
    });

    renderHistory();

  },

  error => {

    console.error(
      "Detection history error:",
      error
    );

    liveHistory = [];

    renderHistory(
      "Could not load detection history."
    );

  }
);


// =========================================
// Download Detection History as CSV
// =========================================

document.getElementById("downloadHistory")
  ?.addEventListener("click", () => {

    const rows = [

      ["Time", "Fish", "Confidence", "Gate"],

      ...liveHistory.map(e => [

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
    link.download = "carpSORT-history.csv";

    link.click();

    URL.revokeObjectURL(url);

  });


// =========================================
// NEW: Acoustic Herding Control
// =========================================

const startSoundBtn =
  document.getElementById("startSoundBtn");

const stopSoundBtn =
  document.getElementById("stopSoundBtn");

const acousticStatus =
  document.getElementById("acousticStatus");

const acousticMessage =
  document.getElementById("acousticMessage");

const acousticWave =
  document.getElementById("acousticWave");


// =========================================
// Sound Controller State
// =========================================

// Public sound controls for student prototype.
// Firebase Authentication will be added later.

let canControlSound = true;

let controlsConnected = false;
let sendingSoundCommand = false;


// =========================================
// Enable / Disable Sound Buttons
// =========================================

function updateSoundButtons() {

  const enabled =
    canControlSound &&
    controlsConnected &&
    !sendingSoundCommand;

  if (startSoundBtn) {
    startSoundBtn.disabled = !enabled;
  }

  if (stopSoundBtn) {
    stopSoundBtn.disabled = !enabled;
  }
}

updateSoundButtons();


// =========================================
// Send Sound Request to Firebase
// =========================================

async function requestSound(enabled) {

  if (
    !canControlSound ||
    !controlsConnected ||
    sendingSoundCommand
  ) {
    return;
  }

  sendingSoundCommand = true;

  updateSoundButtons();

  try {

    setText(
      "acousticMessage",

      enabled
        ? "Sending START SOUND command..."
        : "Sending STOP SOUND command..."
    );

    await updateDoc(controlsRef, {

      soundRequested: enabled

    });

    console.log(

      enabled
        ? "SOUND_ON requested"
        : "SOUND_OFF requested"

    );

  } catch (error) {

    console.error(
      "Sound command error:",
      error
    );

    setText(
      "acousticMessage",
      "Unable to send sound command."
    );

  } finally {

    sendingSoundCommand = false;

    updateSoundButtons();

  }
}


// =========================================
// START SOUND Button
// =========================================

startSoundBtn?.addEventListener(
  "click",
  () => requestSound(true)
);


// =========================================
// STOP SOUND Button
// =========================================

stopSoundBtn?.addEventListener(
  "click",
  () => requestSound(false)
);


// =========================================
// Display Acoustic Sound Status
// =========================================

function displaySoundStatus(data) {

  const requested =
    data.soundRequested === true;

  const actual =
    String(
      data.soundActual ?? "UNKNOWN"
    ).toUpperCase();

  acousticStatus?.classList.remove(
    "active",
    "inactive",
    "pending",
    "error"
  );

  acousticWave?.classList.toggle(
    "playing",
    actual === "ON"
  );

  // Update existing System Status card.

  setText("liveSoundStatus", actual);


  // ---------------------------------------
  // Sound Hardware Unavailable
  // ---------------------------------------

  if (actual === "UNAVAILABLE") {

    setText(
      "acousticStatus",
      "UNAVAILABLE"
    );

    acousticStatus?.classList.add("error");

    setText(
      "acousticMessage",
      "DFPlayer sound hardware unavailable."
    );

  }

  // ---------------------------------------
  // Sound Starting
  // ---------------------------------------

  else if (requested && actual !== "ON") {

    setText(
      "acousticStatus",
      "STARTING"
    );

    acousticStatus?.classList.add("pending");

    setText(
      "acousticMessage",
      "Waiting for ESP32 to start sound..."
    );

  }

  // ---------------------------------------
  // Sound Stopping
  // ---------------------------------------

  else if (!requested && actual === "ON") {

    setText(
      "acousticStatus",
      "STOPPING"
    );

    acousticStatus?.classList.add("pending");

    setText(
      "acousticMessage",
      "Waiting for ESP32 to stop sound..."
    );

  }

  // ---------------------------------------
  // Sound ON
  // ---------------------------------------

  else if (actual === "ON") {

    setText(
      "acousticStatus",
      "ON"
    );

    acousticStatus?.classList.add("active");

    setText(
      "acousticMessage",
      "500 Hz sound system reported active."
    );

  }

  // ---------------------------------------
  // Sound OFF
  // ---------------------------------------

  else if (actual === "OFF") {

    setText(
      "acousticStatus",
      "OFF"
    );

    acousticStatus?.classList.add("inactive");

    setText(
      "acousticMessage",
      "Acoustic herding system is in standby."
    );

  }

  // ---------------------------------------
  // Sound Status Unknown
  // ---------------------------------------

  else {

    setText(
      "acousticStatus",
      "UNKNOWN"
    );

    setText(
      "acousticMessage",
      "Waiting for sound status from ESP32."
    );

  }
}


// =========================================
// Reset Sound Display
// =========================================

function resetSoundDisplay(message) {

  setText("acousticStatus", "UNKNOWN");
  setText("liveSoundStatus", "UNKNOWN");
  setText("acousticMessage", message);

  acousticStatus?.classList.remove(
    "active",
    "inactive",
    "pending",
    "error"
  );

  acousticWave?.classList.remove("playing");

}


// =========================================
// Listen for Firebase Sound Control Updates
// =========================================

onSnapshot(
  controlsRef,

  { includeMetadataChanges: true },

  snapshot => {

    if (!snapshot.exists()) {

      controlsConnected = false;

      updateSoundButtons();

      resetSoundDisplay(
        "Sound controls document not found."
      );

      return;

    }

    controlsConnected =
      !snapshot.metadata.fromCache;

    updateSoundButtons();

    if (!controlsConnected) {

      resetSoundDisplay(
        "Cloud connection unavailable."
      );

      return;

    }

    displaySoundStatus(snapshot.data());

    console.log(
      "Sound controls updated:",
      snapshot.data()
    );

  },

  error => {

    console.error(
      "Sound controller error:",
      error
    );

    controlsConnected = false;

    updateSoundButtons();

    resetSoundDisplay(
      "Unable to connect to sound controller."
    );

  }
);
