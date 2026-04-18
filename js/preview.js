const canvas = document.getElementById('resultCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 3600;
canvas.height = 1800;

const photoData = JSON.parse(localStorage.getItem('photos'));
const frameURL = localStorage.getItem('frame');

const photos = [];

photoData.forEach(src => {
  const img = new Image();
  img.src = src;
  photos.push(img);
});

Promise.all(photos.map(img => new Promise(r => img.onload = r)))
.then(() => {
  photos.forEach((img, i) => {
    const x = (i % 3) * 1200;
    const y = Math.floor(i / 3) * 900;
    ctx.drawImage(img, x, y, 1200, 900);
  });

  const frame = new Image();
  frame.src = frameURL;
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    document.getElementById('download').href =
      canvas.toDataURL('image/png');
  };
});