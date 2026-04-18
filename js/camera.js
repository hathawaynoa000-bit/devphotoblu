// camera.js
const video = document.getElementById('video');

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false
    });

    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

  } catch (err) {
    alert('Kamera tidak bisa diakses');
    console.error(err);
  }
}

// AUTO INIT
initCamera();