const mainImage = document.getElementById('main-image');
const redBox = document.getElementById('red-box');
const zoomDisplays = document.querySelectorAll('.zoom-display');
const teaserContainer = document.querySelector('.teaser-container');
const baseBoxSize = 40;
const borderWidth = 2;

const defaultBoxPositions = {
  garden: { left: 50, top: 10 },
  truck: { left: 190, top: 20 },
  flowers: { left: 220, top: 220 },
  room: { left: 360, top: 40 }
};

const imageSets = {
  garden: {
    gt: '00003.png',
    ours: '00003-ours.png',
    mcmc: '00003-mcmc.png',
    'ours-pre': '00003-ours-pre.png'
  },
  truck: {
    gt: '00002.png',
    ours: '00002-ours.png',
    mcmc: '00002-mcmc.png',
    'ours-pre': '00002-ours-pre.png'
  },
  flowers: { // New entry
    gt: '00002.png',
    ours: '00002-ours.png',
    mcmc: '00002-mcmc.png',
    'ours-pre': '00002-ours-pre.png'
  },
  room: {
    gt: '00032.png',
    ours: '00032-ours.png',
    mcmc: '00032-mcmc.png',
    'ours-pre': '00032-ours-pre.png'
  }
};

const folders = ['garden', 'truck', 'flowers', 'room'];
let currentFolder = 0;
let boxPosition = { xRatio: 0.5, yRatio: 0.5 };

function getCropSize() {
  const zoomRect = zoomDisplays[0].getBoundingClientRect();
  if (!zoomRect.width || !zoomRect.height) {
    return { width: baseBoxSize, height: baseBoxSize };
  }

  const aspectRatio = zoomRect.height / zoomRect.width;
  return {
    width: baseBoxSize,
    height: baseBoxSize * aspectRatio
  };
}

function clampCenter(x, y, rect) {
  const cropSize = getCropSize();
  return {
    x: Math.max(cropSize.width / 2, Math.min(x, rect.width - cropSize.width / 2 - 2 * borderWidth + 2)),
    y: Math.max(cropSize.height / 2, Math.min(y, rect.height - cropSize.height / 2 - 2 * borderWidth + 2))
  };
}

function setRedBoxFromCenter(x, y, rect) {
  const cropSize = getCropSize();
  const clamped = clampCenter(x, y, rect);
  redBox.style.width = `${cropSize.width}px`;
  redBox.style.height = `${cropSize.height}px`;
  redBox.style.left = (clamped.x - cropSize.width / 2) + 'px';
  redBox.style.top = (clamped.y - cropSize.height / 2) + 'px';
  redBox.style.display = 'block';
  boxPosition = {
    xRatio: rect.width ? clamped.x / rect.width : boxPosition.xRatio,
    yRatio: rect.height ? clamped.y / rect.height : boxPosition.yRatio
  };
}

function setRedBoxFromOffsets(left, top) {
  const rect = mainImage.getBoundingClientRect();
  const cropSize = getCropSize();
  if (!rect.width || !rect.height) {
    return;
  }
  setRedBoxFromCenter(left + cropSize.width / 2, top + cropSize.height / 2, rect);
}

function restoreRedBoxPosition() {
  const rect = mainImage.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }
  setRedBoxFromCenter(boxPosition.xRatio * rect.width, boxPosition.yRatio * rect.height, rect);
}

function updateZoomStyles() {
  const rect = mainImage.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }
  const cropSize = getCropSize();
  const boxLeft = parseFloat(redBox.style.left) || 0;
  const boxTop = parseFloat(redBox.style.top) || 0;

  zoomDisplays.forEach(display => {
    const zoomRect = display.getBoundingClientRect();
    if (!zoomRect.width || !zoomRect.height) {
      return;
    }
    const scaleX = zoomRect.width / cropSize.width;
    const scaleY = zoomRect.height / cropSize.height;
    const bgX = -boxLeft * scaleX;
    const bgY = -boxTop * scaleY;
    const imageName = display.getAttribute('data-image');
    display.style.backgroundImage = `url('assets/images/${folders[currentFolder]}/${imageName}')`;
    display.style.backgroundSize = `${rect.width * scaleX}px ${rect.height * scaleY}px`;
    display.style.backgroundPosition = `${bgX}px ${bgY}px`;
  });
}

function updateImages() {
  const folder = folders[currentFolder];
  mainImage.src = `assets/images/${folder}/${imageSets[folder].gt}`;
  zoomDisplays.forEach(display => {
    const key = display.id.replace('zoom-', '');
    const imageName = imageSets[folder][key];
    display.setAttribute('data-image', imageName);
    display.style.backgroundImage = `url('assets/images/${folder}/${imageName}')`;
  });
  const defaultPosition = defaultBoxPositions[folder];
  setTimeout(() => {
    setRedBoxFromOffsets(defaultPosition.left, defaultPosition.top);
    updateZoomStyles();
  }, 100);
}

function resetRedBoxToDefault() {
  const defaultPosition = defaultBoxPositions[folders[currentFolder]];
  setRedBoxFromOffsets(defaultPosition.left, defaultPosition.top);
  updateZoomStyles();
}

document.getElementById('prev-folder').addEventListener('click', () => {
  currentFolder = (currentFolder - 1 + folders.length) % folders.length;
  updateImages();
});

document.getElementById('next-folder').addEventListener('click', () => {
  currentFolder = (currentFolder + 1) % folders.length;
  updateImages();
});

setTimeout(() => {
  updateImages();
}, 100);

mainImage.addEventListener('mousemove', (e) => {
  const rect = mainImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  setRedBoxFromCenter(x, y, rect);
  updateZoomStyles();
});

mainImage.addEventListener('mouseleave', () => {
  resetRedBoxToDefault();
});

teaserContainer.addEventListener('pointerleave', () => {
  resetRedBoxToDefault();
});

mainImage.addEventListener('load', () => {
  restoreRedBoxPosition();
  updateZoomStyles();
});

window.addEventListener('resize', () => {
  restoreRedBoxPosition();
  updateZoomStyles();
});
