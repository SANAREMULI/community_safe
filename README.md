# Community Safe

Emergency reporting, early warnings and cyber safety for the Maasai Mara. English, Kiswahili and Maa.

Redesign of https://model-to-momentum.lovable.app with a Maasai-inspired palette, dark mode, mobile-first layout and a new **Cyber safety** section.

## Live demo

https://sanaremuli.github.io/community_safe/

The site is a static front-end demo. Reports, subscriptions and tracking data stay in the current browser and are not sent to responders.

## Features
- **Report**: fire, flood, wildlife or security reports with validation, optional GPS, rate limiting and a live SMS-format preview.
- **Chat**: offline helper with safety advice in English, Kiswahili and Maa basics.
- **Warnings**: village early warnings and SMS sign-up.
- **Track**: look up a report by ID (e.g. MS-012).
- **Cyber safety**: scam and fake-alert feed, message/link checker, protection tips.
- **Standalone demo**: `demo.html` bundles the interface, styles and script into one file.

## Run
Open `index.html`, or serve the folder: `python3 -m http.server 8080`.

## Status
Front-end demo. Data is stored in the browser (`localStorage`). The GitHub Pages workflow deploys updates from `main`. For operational use, connect an SMS/USSD gateway (e.g. Africa's Talking) and a backend with authentication (see SECURITY.md).
