const mainImage = document.getElementById('main-image');
const redBox = document.getElementById('red-box');
const zoomDisplays = document.querySelectorAll('.zoom-display');

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

function updateZoomStyles() {
  const rect = mainImage.getBoundingClientRect();
  const boxSize = 40;
  const zoomRect = zoomDisplays[0].getBoundingClientRect();
  const scaleX = zoomRect.width / boxSize;
  const scaleY = zoomRect.height / boxSize;
  const redBoxRect = redBox.getBoundingClientRect();
  const mainRect = mainImage.getBoundingClientRect();
  const boxLeft = redBoxRect.left - mainRect.left;
  const boxTop = redBoxRect.top - mainRect.top;
  const bgX = -boxLeft * scaleX;
  const bgY = -boxTop * scaleY;

  zoomDisplays.forEach(display => {
    const imageName = display.getAttribute('data-image');
    display.style.backgroundImage = `url('assets/images/${folders[currentFolder]}/${imageName}')`;
    display.style.backgroundSize = `${(rect.width / boxSize) * 100}% ${(rect.height / boxSize) * 100}%`;
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
  // Set red box position based on folder
  if (folder === 'truck') {
    redBox.style.left = '180px';
    redBox.style.top = '30px';
  } else if (folder === 'flowers') { // New condition
    redBox.style.left = '170px';
    redBox.style.top = '200px';
  } else if (folder === 'room') {
    redBox.style.left = '350px';
    redBox.style.top = '40px';
  }
  else {
    redBox.style.left = '50px';
    redBox.style.top = '10px';
  }
  // Update zoom styles after a delay to allow image loading
  setTimeout(updateZoomStyles, 100);
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
  const rect = mainImage.getBoundingClientRect();
  const boxSize = 40;
  const borderWidth = 2;
  const initialX = 70; // 50 + 20
  const initialY = 30; // 10 + 20
  const clampedX = Math.max(boxSize / 2, Math.min(initialX, rect.width - boxSize / 2 - 2 * borderWidth + 2));
  const clampedY = Math.max(boxSize / 2, Math.min(initialY, rect.height - boxSize / 2 - 2 * borderWidth + 2));
  redBox.style.left = (clampedX - boxSize / 2) + 'px';
  redBox.style.top = (clampedY - boxSize / 2) + 'px';
  redBox.style.display = 'block';
}, 100);

mainImage.addEventListener('mousemove', (e) => {
  const rect = mainImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Position red box at cursor, centered, clamped to image bounds including border
  const boxSize = 40;
  const borderWidth = 2;
  const clampedX = Math.max(boxSize / 2, Math.min(x, rect.width - boxSize / 2 - 2 * borderWidth + 2));
  const clampedY = Math.max(boxSize / 2, Math.min(y, rect.height - boxSize / 2 - 2 * borderWidth + 2));
  redBox.style.left = (clampedX - boxSize / 2) + 'px';
  redBox.style.top = (clampedY - boxSize / 2) + 'px';
  redBox.style.display = 'block';

  // Calculate zoom position
  // Get one zoom cell dimensions (all are the same)
  const zoomRect = zoomDisplays[0].getBoundingClientRect();
  const scaleX = zoomRect.width / boxSize;
  const scaleY = zoomRect.height / boxSize;

  // Position to show the area inside the red box
  const boxLeft = clampedX - boxSize / 2;
  const boxTop = clampedY - boxSize / 2;
  const bgX = -boxLeft * scaleX;
  const bgY = -boxTop * scaleY;

  // Update zoom displays
  updateZoomStyles();
});

mainImage.addEventListener('mouseleave', () => {
  // redBox.style.display = 'none'; // Keep it visible
});
