const form = document.getElementById('background-form');
const imagePathInput = document.getElementById('image-path');
const calloutPositionSelect = document.getElementById('callout-position');
const backgroundPositionSelect = document.getElementById('background-position');
const statusText = document.getElementById('status');

function setStatus(message) {
  statusText.textContent = message;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function applyBackgroundSettings(payload) {
  try {
    setStatus('Applying background settings...');

    const tab = await getActiveTab();

    if (!tab?.id) {
      setStatus('No active tab found.');
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'APPLY_BACKGROUND_SETTINGS',
      payload,
    });

    if (response?.ok) {
      setStatus('Background settings sent.');
      return;
    }

    setStatus(response?.error || 'No response from page handler.');
  } catch (error) {
    setStatus('No page handler is available yet.');
    console.error('Failed to apply background settings', error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    imagePath: imagePathInput.value.trim(),
    calloutPosition: calloutPositionSelect.value,
    backgroundPosition: backgroundPositionSelect.value,
  };

  await applyBackgroundSettings(payload);
});
