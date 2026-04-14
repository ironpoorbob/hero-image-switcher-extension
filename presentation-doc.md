# Hero Image Switcher Extension Presentation

This document is for the browser-facing presentation of the extension.
It separates the UI into three parts:

- `HTML`: structure of the popup or presentation panel
- `CSS`: visual styling
- `JavaScript`: browser-side interactions

## Goal

The extension should let a user:

- open the extension from the Chrome toolbar
- view the current hero-image switching status
- trigger a hero image change
- optionally reset the page to its original state

## HTML

Use HTML for the visible structure of the extension popup.

Example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hero Image Switcher</title>
    <link rel="stylesheet" href="popup.css" />
  </head>
  <body>
    <main class="popup">
      <h1>Hero Image Switcher</h1>
      <p class="subtitle">Replace the main hero image on the current page.</p>

      <div class="actions">
        <button id="switch-image">Switch Hero Image</button>
        <button id="reset-image" class="secondary">Reset</button>
      </div>

      <p id="status" class="status">Ready.</p>
    </main>

    <script src="popup.js"></script>
  </body>
</html>
```

## CSS

Use CSS to define layout, spacing, colors, and button states.

Example:

```css
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f7fb;
  color: #1f2937;
}

.popup {
  width: 320px;
  padding: 16px;
}

h1 {
  margin: 0 0 8px;
  font-size: 18px;
}

.subtitle {
  margin: 0 0 16px;
  font-size: 14px;
  color: #4b5563;
}

.actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

button {
  border: 0;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  background: #2563eb;
  color: #ffffff;
}

button.secondary {
  background: #d1d5db;
  color: #111827;
}

.status {
  margin: 0;
  font-size: 13px;
}
```

## JavaScript

Use JavaScript to connect the UI with Chrome extension behavior.

Example:

```javascript
const switchButton = document.getElementById('switch-image');
const resetButton = document.getElementById('reset-image');
const statusText = document.getElementById('status');

switchButton.addEventListener('click', async () => {
  statusText.textContent = 'Switching hero image...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.sendMessage(tab.id, {
    type: 'SWITCH_HERO_IMAGE',
  });

  statusText.textContent = 'Hero image updated.';
});

resetButton.addEventListener('click', async () => {
  statusText.textContent = 'Resetting hero image...';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.tabs.sendMessage(tab.id, {
    type: 'RESET_HERO_IMAGE',
  });

  statusText.textContent = 'Hero image reset.';
});
```

## Suggested File Structure

```text
hero-image-switcher-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.css
├── popup.js
└── presentation-doc.md
```

## Notes

- `manifest.json` already points to `popup.html`, so that file will need to be created next.
- The JavaScript example assumes a content script is listening for `SWITCH_HERO_IMAGE` and `RESET_HERO_IMAGE`.
- This document is a planning and presentation reference. It does not yet wire the popup into the extension.
