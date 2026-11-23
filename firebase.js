import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
const liveRef = doc(db, "system", "live");

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function displayFishPhoto(imageUrl) {
  const capture = document.getElementById("liveFishCapture");
  const photo = document.getElementById("liveFishPhoto");

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

function displayLiveData(data) {
  const carp = data.carpCount ?? 0;
  const native = data.nativeCount ?? 0;

  setText("liveCarpCount", carp);
  setText("liveNativeCount", native);
  setText("liveTotalCount", carp + native);
  setText("liveFishName", data.lastFish ?? "None");
  setText("liveConfidence", `Confidence: ${data.confidence ?? 0}%`);
  setText("liveGateStatus", data.gate ?? "NEUTRAL");
  setText("liveSoundStatus", data.sound ? "ON" : "OFF");
  setText("liveDeviceStatus", data.deviceConnected ? "Connected" : "Offline");
  setText("liveMode", data.mode ?? "UNKNOWN");

  displayFishPhoto(data.lastFishImage);
}

onSnapshot(
  liveRef,
  snapshot => {
    if (!snapshot.exists()) {
      displayLiveData({});
      setText("firebaseStatus", "No live data");
      return;
    }

    displayLiveData(snapshot.data());
    setText("firebaseStatus", "Cloud connected");
  },
  error => {
    console.error("Firebase error:", error);
    setText("firebaseStatus", "Connection error");
  }
);

let liveHistory = [];

const historyQuery = query(
  collection(db, "detections"),
  orderBy("detectedAt", "desc"),
  limit(100)
);

function renderHistory(message = "No detections yet.") {
  const tbody = document.getElementById("historyBody");
  const download = document.getElementById("downloadHistory");

  tbody.replaceChildren();
  download.disabled = liveHistory.length === 0;

  if (liveHistory.length === 0) {
    const cell = tbody.insertRow().insertCell();
    cell.colSpan = 4;
    cell.textContent = message;
    return;
  }

  for (const event of liveHistory) {
    const row = tbody.insertRow();
    const confidence = event.confidence == null
      ? "--"
      : `${event.confidence}%`;

    for (const value of [event.time, event.fish, confidence, event.gate]) {
      row.insertCell().textContent = value;
    }
  }
}

renderHistory("Loading detection history…");

onSnapshot(
  historyQuery,
  snapshot => {
    liveHistory = snapshot.docs.map(record => {
      const data = record.data();

      return {
        time: data.detectedAt?.toDate().toLocaleString() ?? "--",
        fish: data.fish ?? "--",
        confidence: data.confidence ?? null,
        gate: data.gate ?? "--"
      };
    });

    renderHistory();
  },
  error => {
    console.error("Detection history error:", error);
    liveHistory = [];
    renderHistory("Could not load detection history.");
  }
);

document.getElementById("downloadHistory")
  .addEventListener("click", () => {
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