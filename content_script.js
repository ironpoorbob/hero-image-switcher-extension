console.log('Hero Image Switcher content script loaded');

function getBannerElements() {
  const bannerRoot = document.querySelector('shared-banner1-background');

  if (!bannerRoot) {
    return {
      error: 'shared-banner1-background was not found.',
    };
  }

  const backgroundElement = bannerRoot.querySelector('.background');

  if (!backgroundElement) {
    return {
      error: 'The .background element was not found inside shared-banner1-background.',
    };
  }

  const rowElement = backgroundElement.querySelector('.grv-shr-lib-row');

  if (!rowElement) {
    return {
      error: 'The callout row element was not found inside .background.',
    };
  }

  const styleElement = bannerRoot.querySelector('style[id]');

  if (!styleElement) {
    return {
      error: 'The banner style element was not found inside shared-banner1-background.',
    };
  }

  return {
    bannerRoot,
    backgroundElement,
    rowElement,
    styleElement,
  };
}

function getCalloutAlignment(calloutPosition) {
  return calloutPosition === 'right' ? 'end' : 'start';
}

function normalizeImageBasePath(imagePath) {
  if (!imagePath) {
    return '';
  }

  return imagePath.endsWith('/') ? imagePath : `${imagePath}/`;
}

const IMAGE_VARIANTS = [
  'mobile',
  'rmobile',
  'tablet',
  'rtablet',
  'desktop',
  'rdesktop',
];

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

function canLoadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

async function resolveVariantUrl(imageBasePath, variantName) {
  const basePath = normalizeImageBasePath(imageBasePath);

  for (const extension of IMAGE_EXTENSIONS) {
    const candidateUrl = `${basePath}${variantName}.${extension}`;
    const isAvailable = await canLoadImage(candidateUrl);

    if (isAvailable) {
      return candidateUrl;
    }
  }

  return null;
}

async function resolveImageSet(imageBasePath) {
  const resolvedEntries = await Promise.all(
    IMAGE_VARIANTS.map(async (variantName) => {
      const url = await resolveVariantUrl(imageBasePath, variantName);
      return [variantName, url];
    })
  );

  return Object.fromEntries(resolvedEntries);
}

function buildResponsiveBackgroundCss(styleId, imageUrls) {
  const selector = `#${styleId} + *`;

  return `${selector} {
  background-image: url('${imageUrls.mobile}');
}

@media only screen and (min-width: 375px) and (-webkit-min-device-pixel-ratio: 2) {
  ${selector} {
    background-image: url('${imageUrls.rmobile}');
  }
}

@media only screen and (min-width: 375px) and (min-resolution: 2dppx) {
  ${selector} {
    background-image: url('${imageUrls.rmobile}');
  }
}

@media only screen and (min-width: 600px) {
  ${selector} {
    background-image: url('${imageUrls.tablet}');
  }
}

@media only screen and (min-width: 700px) {
  ${selector} {
    background-image: url('${imageUrls.rtablet}');
  }
}

@media only screen and (min-width: 700px) and (-webkit-min-device-pixel-ratio: 2) {
  ${selector} {
    background-image: url('${imageUrls.rtablet}');
  }
}

@media only screen and (min-width: 700px) and (min-resolution: 2dppx) {
  ${selector} {
    background-image: url('${imageUrls.rtablet}');
  }
}

@media only screen and (min-width: 1024px) {
  ${selector} {
    background-image: url('${imageUrls.desktop}');
  }
}

@media only screen and (min-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) {
  ${selector} {
    background-image: url('${imageUrls.rdesktop}');
  }
}

@media only screen and (min-width: 1024px) and (min-resolution: 2dppx) {
  ${selector} {
    background-image: url('${imageUrls.rdesktop}');
  }
}`;
}

function getMissingVariants(imageUrls) {
  return IMAGE_VARIANTS.filter((variantName) => !imageUrls[variantName]);
}

async function applyBannerSettings(payload) {
  const { imagePath, backgroundPosition, calloutPosition } = payload;
  const elements = getBannerElements();

  if (elements.error) {
    return {
      ok: false,
      error: elements.error,
    };
  }

  const { backgroundElement, rowElement, styleElement } = elements;

  if (imagePath) {
    const imageUrls = await resolveImageSet(imagePath);
    const missingVariants = getMissingVariants(imageUrls);

    if (missingVariants.length > 0) {
      return {
        ok: false,
        error: `Missing image variants: ${missingVariants.join(', ')}.`,
      };
    }

    styleElement.textContent = buildResponsiveBackgroundCss(styleElement.id, imageUrls);
  }

  if (backgroundPosition) {
    backgroundElement.style.backgroundPosition = backgroundPosition;
  }

  rowElement.classList.remove(
    'grv-shr-lib-row--sm-start',
    'grv-shr-lib-row--sm-end'
  );
  rowElement.classList.add(
    `grv-shr-lib-row--sm-${getCalloutAlignment(calloutPosition)}`
  );

  return {
    ok: true,
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'APPLY_BACKGROUND_SETTINGS') {
    return;
  }

  const payload = message.payload ?? {};

  console.log('Received background settings from popup:', payload);

  (async () => {
    const result = await applyBannerSettings(payload);

    if (!result.ok) {
      console.error('Failed to apply banner settings:', result.error);
    }

    sendResponse({
      ...result,
      received: payload,
    });
  })();

  return true;
});
