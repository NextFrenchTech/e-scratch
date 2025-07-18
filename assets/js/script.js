const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const scratchCardCover = document.querySelector('.scratch-card-cover');
const scratchCardCanvasRender = document.querySelector('.scratch-card-canvas-render');
const scratchCardCoverContainer = document.querySelector('.scratch-card-cover-container');
const scratchCardText = document.querySelector('.scratch-card-text');
const scratchCardImage = document.querySelector('.scratch-card-image');

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let isPointerDown = false;
let positionX;
let positionY;
let clearDetectionTimeout = null;

const devicePixelRatio = window.devicePixelRatio || 1;

const canvasWidth = canvas.offsetWidth * devicePixelRatio;
const canvasHeight = canvas.offsetHeight * devicePixelRatio;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

context.scale(devicePixelRatio, devicePixelRatio);

// ---------- Image aléatoire + message avec mémoire localStorage ----------
const images = [
  './assets/image/image1.png',
  './assets/image/image2.png',
  './assets/image/image3.png',
  './assets/image/image4.png',
  //'./assets/image/image5.png',
  //'./assets/image/image6.png',
  './assets/image/image7.png',
  './assets/image/image8.png',
  './assets/image/image9.png',
  //'./assets/image/image10.png',
  './assets/image/image11.png',
  //'./assets/image/image12.png',
  //none
  './assets/image/image14.png',

];

const imagesMessages = {
  './assets/image/image1.png': '🎉 Alexis, pour vous Accueillir...',
  './assets/image/image2.png': '🎉 Alexandre, pour vos Cocktails...',
  './assets/image/image3.png': '🎉 Maxime, pour vos Apéritifs...',
  './assets/image/image4.png': '🎉 Julie, pour vous Servir...',
  //'./assets/image/image5.png': '🎉 Coming Soon, pour vous Servir...',
  //'./assets/image/image6.png': '🎉 Coming Soon, pour vos Rafraîchissements...',
  './assets/image/image7.png': '🎉 Loic, pour vos Vins...',
  './assets/image/image8.png': '🎉 Mickaël, pour vous Servir...',
  './assets/image/image9.png': '🎉 Angela, pour vos Desserts...',
  //'./assets/image/image10.png': '🎉 Coming Soon, pour vos Desserts...',
  './assets/image/image11.png': '🎉 Juliette, pour vos Desserts...',
  //'./assets/image/image12.png': '🎉 Tbo, pour vos Soirées...',
  //none
  './assets/image/image14.png': '🎉 DJ Coil, pour vos Soirées...',

};

// Récupérer la dernière image depuis localStorage
const lastImage = localStorage.getItem('lastScratchCardImage');

let randomIndex;
do {
  randomIndex = Math.floor(Math.random() * images.length);
} while (images[randomIndex] === lastImage && images.length > 1);

const selectedImage = images[randomIndex];
scratchCardImage.src = selectedImage;

// Sauvegarder la nouvelle image dans localStorage
localStorage.setItem('lastScratchCardImage', selectedImage);
// ------------------------------------------------

if (isSafari) {
  canvas.classList.add('hidden');
}

canvas.addEventListener('pointerdown', (e) => {
  scratchCardCover.classList.remove('shine');
  ({ x: positionX, y: positionY } = getPosition(e));
  clearTimeout(clearDetectionTimeout);

  canvas.addEventListener('pointermove', plot);

  window.addEventListener('pointerup', (e) => {
    canvas.removeEventListener('pointermove', plot);
    clearDetectionTimeout = setTimeout(() => {
      checkBlackFillPercentage();
    }, 500);
  }, { once: true });
});

const checkBlackFillPercentage = () => {
  const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixelData = imageData.data;

  let blackPixelCount = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    const red = pixelData[i];
    const green = pixelData[i + 1];
    const blue = pixelData[i + 2];
    const alpha = pixelData[i + 3];

    if (red === 0 && green === 0 && blue === 0 && alpha === 255) {
      blackPixelCount++;
    }
  }

  const blackFillPercentage = blackPixelCount * 100 / (canvasWidth * canvasHeight);

  if (blackFillPercentage >= 45) {
    scratchCardCoverContainer.classList.add('clear');
    confetti({
      particleCount: 100,
      spread: 90,
      origin: {
        y: (scratchCardText.getBoundingClientRect().bottom + 60) / window.innerHeight,
      },
    });

    // 🎯 Message en fonction de l’image
    scratchCardText.textContent =
      imagesMessages[selectedImage] || 'Oops !';

    scratchCardImage.classList.add('animate');

    scratchCardCoverContainer.addEventListener('transitionend', () => {
      scratchCardCoverContainer.classList.add('hidden');
    }, { once: true });
  }
};

const getPosition = ({ clientX, clientY }) => {
  const { left, top } = canvas.getBoundingClientRect();
  return {
    x: clientX - left,
    y: clientY - top,
  };
};

const plotLine = (context, x1, y1, x2, y2) => {
  var diffX = Math.abs(x2 - x1);
  var diffY = Math.abs(y2 - y1);
  var dist = Math.sqrt(diffX * diffX + diffY * diffY);
  var step = dist / 50;
  var i = 0;
  var t;
  var x;
  var y;

  while (i < dist) {
    t = Math.min(1, i / dist);
    x = x1 + (x2 - x1) * t;
    y = y1 + (y2 - y1) * t;

    context.beginPath();
    context.arc(x, y, 16, 0, Math.PI * 2);
    context.fill();

    i += step;
  }
};

const setImageFromCanvas = () => {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    previousUrl = scratchCardCanvasRender.src;
    scratchCardCanvasRender.src = url;
    if (!previousUrl) {
      scratchCardCanvasRender.classList.remove('hidden');
    } else {
      URL.revokeObjectURL(previousUrl);
    }
    previousUrl = url;
  });
};

let setImageTimeout = null;

const plot = (e) => {
  const { x, y } = getPosition(e);
  plotLine(context, positionX, positionY, x, y);
  positionX = x;
  positionY = y;
  if (isSafari) {
    clearTimeout(setImageTimeout);

    setImageTimeout = setTimeout(() => {
      setImageFromCanvas();
    }, 5);
  }
};

document.getElementById('reloadButton').addEventListener('click', function() {
  location.reload(); // Recharge la page
});
