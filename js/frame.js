document.getElementById('frameUpload').onchange = e => {
  const file = e.target.files[0];
  localStorage.setItem('frame', URL.createObjectURL(file));
};

document.getElementById('letsTake').onclick = () => {
  window.location.href = 'camera.html';
};