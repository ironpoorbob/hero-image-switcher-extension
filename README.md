# Hero Image Switcher Extension

A basic Chrome extension for swapping a hero/banner background image on the current page from the extension popup.

## What it does

The popup lets you:

- enter a base image path
- choose the callout position (`left` or `right`)
- choose the background position
- apply those settings to the active tab

The content script looks for a `shared-banner1-background` element on the page, updates its background image CSS, and adjusts the row alignment class used for the banner callout.

## Expected image structure

The extension expects a folder or base path that contains these image variants (standard and retina):

- `mobile`
- `rmobile`
- `tablet`
- `rtablet`
- `desktop`
- `rdesktop`

Supported extensions:

- `.png`
- `.jpg`
- `.jpeg`

Example:

```text
https://example.com/banner-set/
  mobile.jpg
  rmobile.jpg
  tablet.jpg
  rtablet.jpg
  desktop.jpg
  rdesktop.jpg
```

In the popup, enter:

```text
https://example.com/banner-set/
```

The script will try each expected filename and supported extension automatically.

## Install locally

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `hero-image-switcher-extension` folder.

## How to use

1. Open a page that contains the expected banner markup (https://www.capitalone.com/).
2. Click the extension icon.
3. Enter the image base path.
4. Pick a callout position and background position.
5. Click `Apply`.

If all required image variants are available, the popup will report success and the banner will update.

## Project files

- `manifest.json`: Chrome extension manifest
- `popup.html`: popup UI
- `popup.css`: popup styles
- `popup.js`: popup behavior and tab messaging
- `content_script.js`: page DOM lookup and banner updates

## Current assumptions and limitations

- The extension is meant to be run on https://www.capitalone.com/.
- It works on pages with a hero banner that contain `shared-banner1-background`.
- It expects a `.background` element, a `.grv-shr-lib-row` element, and a banner `style[id]` element inside that component.
- All six responsive image variants must be reachable, or the update fails.
- This project currently does not include a reset action or persisted settings.
