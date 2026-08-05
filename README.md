# 🔥 F*CK FEEDBACK FORM !

**by UC_DADDY**

A one-click Chrome Extension that automatically fills online feedback forms after the user explicitly clicks the Start button.

---

<img width="452" height="737" alt="image" src="https://github.com/user-attachments/assets/5684062e-9c7e-4683-bedc-29164d983c17" />
<img width="452" height="737" alt="image" src="https://github.com/user-attachments/assets/fded174f-26d5-43be-b171-80d9792f045e" />


## Features

- **ALL AGREE** — Selects every "Strongly Agree" option
- **ALL DISAGREE** — Selects every "Strongly Disagree" option
- **RANDOM** — Randomly chooses ONE answer per question
- Supports AngularJS feedback pages with clickable elements
- Handles dynamically loaded questions via MutationObserver
- Modern dark UI with neon green accents

---

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the folder containing these files
6. The extension icon will appear in your toolbar

---

## Usage

1. Navigate to a feedback form page
2. Click the extension icon in the toolbar
3. Select a response mode:
   - 🟢 ALL AGREE
   - 🔴 ALL DISAGREE
   - 🎲 RANDOM
4. Click **▶ START**
5. The form will be filled automatically

---

## Compatibility

- Manifest Version 3
- AngularJS pages
- Dynamically loaded content
- Standard HTML feedback forms using `.ems-flex-align.margin-10.ng-scope` selectors

---

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `popup.html` | Extension popup UI |
| `popup.css` | Popup styling (dark theme) |
| `popup.js` | Popup logic and automation trigger |
| `content.js` | Content script for page integration |
| `background.js` | Service worker |
| `icons/` | Extension icons (16, 32, 48, 128px) |

---

## Icons

You must provide icon files in the `icons/` folder:
- `icon16.png`
- `icon32.png`
- `icon48.png`
- `icon128.png`

Create simple green icons or use any placeholder images.

---

## License

Use at your own risk. For educational purposes.
