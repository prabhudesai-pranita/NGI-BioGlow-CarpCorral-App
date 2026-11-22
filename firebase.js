
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Replace these values with YOUR Firebase config.
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

const connectionLabel =
  document.getElementById("firebaseStatus");

function displayLiveData(data) {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const carp = data.carpCount ?? 0;
  const native = data.nativeCount ?? 0;

  setText("liveCarpCount", carp);
  setText("liveNativeCount", native);
  setText("liveTotalCount", carp + native);
  setText("liveFishName", data.lastFish ?? "None");
  setText("liveConfidence",
    `Confidence: ${data.confidence ?? 0}%`);
  setText("liveGateStatus", data.gate ?? "NEUTRAL");
  setText("liveSoundStatus",
    data.sound ? "ON" : "OFF");
  setText("liveDeviceStatus",
    data.deviceConnected ? "Connected" : "Offline");
  setText("liveMode", data.mode ?? "UNKNOWN");
}

onSnapshot(
  liveRef,
  snapshot => {
    if (!snapshot.exists()) {
      connectionLabel.textContent = "No live data";
      return;
    }

    displayLiveData(snapshot.data());
    connectionLabel.textContent = "Cloud connected";
  },
  error => {
    console.error("Firebase error:", error);
    connectionLabel.textContent = "Connection error";
  }
);
