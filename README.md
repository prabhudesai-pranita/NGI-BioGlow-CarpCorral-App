# 🐟 CarpSORT – Sound, Optics & Recognition Technology

### FIRST LEGO League 2026–2027 | BioGlow Season

**Developed by NextGen Innovators (NGI) | Team #40161**

*Innovating Today. Inspiring Tomorrow.*

---

## 🌊 About the Project

**CarpSORT** (Sound, Optics & Recognition Technology) is an innovative solution developed by NextGen Innovators for the FIRST LEGO League (FLL) 2026–2027 BioGlow season.

It brings together underwater sound guidance, optical detection with a webcam, and AI-powered fish recognition to help manage invasive carp populations while protecting native fish species.

CarpSORT is designed to detect invasive carp, guide them toward a collection area using sound, and separate invasive carp from native fish using an AI-powered sorting gate.

This repository contains the **CarpSORT Web Application**, designed to monitor fish detection, sorting activity, and system performance.

## 🎯 Our Mission

**Protect native fish. Control invasive carp. Restore aquatic biodiversity.**

Invasive carp can disrupt aquatic ecosystems by competing with native fish for food and habitat.

Our goal is to explore a smarter, technology-driven approach to invasive carp management that reduces the risk of harming native fish.

## 💡 How CarpSORT Works

1. **Fish Detection:** A webcam captures images of fish approaching the sorting system.
2. **AI Identification:** A trained AI model classifies fish as invasive carp, native fish, or unknown.
3. **Sound Activation:** When invasive carp are detected, the system can activate an experimental sound-based guidance mechanism.
4. **Automated Sorting:** An ESP32 microcontroller operates a servo-controlled gate to direct fish toward the appropriate exit.
5. **Real-Time Monitoring:** The CarpSORT dashboard displays detection results, fish counts, gate status, and system activity.

*Note: CarpSORT is an experimental FLL prototype. Its effectiveness in real aquatic environments has not yet been established.*

## 🖥️ Web Application Features

The CarpSORT dashboard is designed to support:

- 📊 **Live Dashboard:** Monitor invasive and native fish counts.
- 📷 **AI Fish Detection:** Display fish classification and confidence scores.
- 🎥 **Live Camera Feed:** View webcam footage during operation.
- 🚧 **Sorting Gate Status:** Monitor the position of the automated sorting gate.
- 🔊