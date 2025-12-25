const colorSelect = document.getElementById("colorSelect");
const thresholdRange = document.getElementById("thresholdRange");
const thresholdValue = document.getElementById("thresholdValue");
const sharpnessRange = document.getElementById("sharpnessRange");
const sharpnessValue = document.getElementById("sharpnessValue");
const downloadButton = document.getElementById("downloadButton");
const randomButton = document.getElementById("randomButton");
const openCameraButton = document.getElementById("openCameraButton");
const captureButton = document.getElementById("captureButton");
const cameraPreview = document.getElementById("cameraPreview");
const gotoRootButton = document.getElementById("gotoRootButton");
const resultCanvas = document.getElementById("resultCanvas");
const resultCtx = resultCanvas.getContext("2d");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const colorPicker = document.getElementById("colorPicker");
const resetButton = document.getElementById("resetButton");
const savePhotoButton = document.getElementById("savePhotoButton");
const saveOriginalCheckbox = document.getElementById("saveOriginalCheckbox");

let processedDataUrl = "";
let useCustomColor = false;
let lastRandomKey = null;
let cameraStream = null;
let isCameraMode = false;
let cameraAnimationId = null;
let isCapturingFrame = false;
let capturedFilteredUrl = "";
let capturedOriginalUrl = "";
let capturedTimestamp = "";

const colorMap = {
kodak: "#ffc800",
sunriseGold: "#ffd46b",
sunsetOrange: "#ff8a4a",
amber: "#ffb347",
cinnamon: "#b56a3a",
warmRed: "#ff5a5f",
rose: "#ff7a8a",
sakura: "#ff9ec7",
forest: "#2f8f4e",
olive: "#5f7f3b",
mint: "#5de2b5",
cyan: "#11e0ff",
sky: "#62a8ff",
deepBlue: "#1236a0",
violet: "#7d5bff",
lavender: "#c39bff",
magenta: "#ff3fa8",
sepia: "#9b6b3b",
pureRed: "#ff0000",
pureGreen: "#00ff00",
pureBlue: "#0000ff",
pureWhite: "#ffffff",
};

thresholdRange.addEventListener("input", () => {
  thresholdValue.textContent = thresholdRange.value;
  if (isCameraMode) {
    renderFiltered();
  }
});

sharpnessRange.addEventListener("input", () => {
  sharpnessValue.textContent = sharpnessRange.value;
  if (isCameraMode) {
    renderFiltered();
  }
});

colorSelect.addEventListener("change", () => {
  useCustomColor = false;
  const hex = colorMap[colorSelect.value] || colorMap.kodak;
  colorPicker.value = hex;
  if (isCameraMode) {
    renderFiltered();
  }
});

colorPicker.addEventListener("input", () => {
  useCustomColor = true;
  colorSelect.value = "";
  colorSelect.selectedIndex = -1;
  if (isCameraMode) {
    renderFiltered();
  }
});

function downloadByUrl(url, filename) {
  if (!url) {
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function buildTimestamp() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function captureAndPreview() {
  if (!isCameraMode || !cameraPreview || cameraPreview.readyState < 2) {
    return;
  }
  capturedTimestamp = buildTimestamp();
  isCapturingFrame = true;
  renderFiltered();
  isCapturingFrame = false;
  capturedFilteredUrl = processedDataUrl;
  const width = resultCanvas.width;
  const height = resultCanvas.height;
  const originalCanvas = document.createElement("canvas");
  originalCanvas.width = width;
  originalCanvas.height = height;
  const originalCtx = originalCanvas.getContext("2d");
  originalCtx.drawImage(cameraPreview, 0, 0, width, height);
  capturedOriginalUrl = originalCanvas.toDataURL("image/png");
  openCaptureModal();
}

function openCaptureModal() {
  if (!capturedFilteredUrl) {
    return;
  }
  modalImage.src = capturedFilteredUrl;
  if (saveOriginalCheckbox) {
    saveOriginalCheckbox.checked = true;
  }
  imageModal.classList.add("visible");
}

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    if (!capturedFilteredUrl || !capturedTimestamp) {
      return;
    }
    const filteredName = `kodak-filter-${capturedTimestamp}.png`;
    downloadByUrl(capturedFilteredUrl, filteredName);
  });
}

if (captureButton) {
  captureButton.addEventListener("click", () => {
    captureAndPreview();
  });
}

if (savePhotoButton) {
  savePhotoButton.addEventListener("click", () => {
    if (!capturedFilteredUrl || !capturedTimestamp) {
      return;
    }
    const base = capturedTimestamp;
    const filteredName = `kodak-filter-${base}.png`;
    downloadByUrl(capturedFilteredUrl, filteredName);
    if (saveOriginalCheckbox && saveOriginalCheckbox.checked && capturedOriginalUrl) {
      const originalName = `kodak-original-${base}.png`;
      downloadByUrl(capturedOriginalUrl, originalName);
    }
    closeImageModal();
  });
}

randomButton.addEventListener("click", () => {
const keys = Object.keys(colorMap);
if (!keys.length) {
return;
}
let key = keys[Math.floor(Math.random() * keys.length)];
if (keys.length > 1) {
let attempts = 0;
while (key === lastRandomKey && attempts < 10) {
key = keys[Math.floor(Math.random() * keys.length)];
attempts += 1;
}
}
lastRandomKey = key;
useCustomColor = false;
colorSelect.value = key;
const hex = colorMap[key] || colorMap.kodak;
colorPicker.value = hex;
if (isCameraMode) {
renderFiltered();
}
});

resetButton.addEventListener("click", () => {
  colorSelect.value = "kodak";
  useCustomColor = false;
  const defaultHex = colorMap.kodak;
colorPicker.value = defaultHex;
thresholdRange.value = "140";
thresholdValue.textContent = "140";
sharpnessRange.value = "20";
sharpnessValue.textContent = "20";
lastRandomKey = null;
  resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  processedDataUrl = "";
  capturedFilteredUrl = "";
  capturedOriginalUrl = "";
  capturedTimestamp = "";
  if (downloadButton) {
    downloadButton.disabled = true;
  }
  closeImageModal();
  if (isCameraMode || cameraStream) {
    stopCamera();
  }
});

if (openCameraButton) {
  openCameraButton.addEventListener("click", () => {
    startCamera();
  });
}

if (gotoRootButton) {
  gotoRootButton.addEventListener("click", () => {
    window.location.href = "/";
  });
}

function closeImageModal() {
imageModal.classList.remove("visible");
modalImage.src = "";
}

resultCanvas.addEventListener("click", () => {
if (!isCameraMode) {
return;
}
captureAndPreview();
});

imageModal.addEventListener("click", event => {
if (event.target === imageModal) {
closeImageModal();
}
});

function fitCanvasToImage() {
  let width = 0;
  let height = 0;
  if (isCameraMode && cameraPreview && cameraPreview.videoWidth && cameraPreview.videoHeight) {
    width = cameraPreview.videoWidth;
    height = cameraPreview.videoHeight;
  } else {
    return;
  }
  const maxWidth = 1920;
  const maxHeight = 1280;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);
  resultCanvas.width = width;
  resultCanvas.height = height;
}

function renderFiltered() {
fitCanvasToImage();
const width = resultCanvas.width;
const height = resultCanvas.height;
if (!width || !height) {
return;
}
const tempCanvas = document.createElement("canvas");
tempCanvas.width = width;
tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  const sharpValue = parseInt(sharpnessRange.value, 10) || 0;
  const maxSharp = 20;
  let blurAmount = maxSharp - sharpValue;
  if (blurAmount < 0) {
blurAmount = 0;
  }
  const blurRadius = blurAmount * 0.4;
  if (blurRadius > 0) {
    tempCtx.filter = `blur(${blurRadius}px)`;
  } else {
    tempCtx.filter = "none";
  }
  const inputSource = cameraPreview;
  if (!isCameraMode || !inputSource) {
    return;
  }
  tempCtx.drawImage(inputSource, 0, 0, width, height);
  tempCtx.filter = "none";
const imageData = tempCtx.getImageData(0, 0, width, height);
const data = imageData.data;
const threshold = parseInt(thresholdRange.value, 10);
const hex = useCustomColor ? colorPicker.value : (colorMap[colorSelect.value] || colorMap.kodak);
const rFilter = parseInt(hex.slice(1, 3), 16);
const gFilter = parseInt(hex.slice(3, 5), 16);
const bFilter = parseInt(hex.slice(5, 7), 16);
for (let i = 0; i < data.length; i += 4) {
const r = data[i];
const g = data[i + 1];
const b = data[i + 2];
const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
if (luminance >= threshold) {
data[i] = rFilter;
data[i + 1] = gFilter;
data[i + 2] = bFilter;
} else {
data[i] = 0;
data[i + 1] = 0;
data[i + 2] = 0;
}
data[i + 3] = 255;
}
  resultCtx.putImageData(imageData, 0, 0);
  if (isCapturingFrame) {
    processedDataUrl = resultCanvas.toDataURL("image/png");
    if (downloadButton) {
      downloadButton.disabled = false;
    }
  }
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("当前浏览器不支持摄像头访问，请尝试更换浏览器（推荐使用新版手机浏览器）");
    return;
  }
  if (isCameraMode || cameraStream) {
    stopCamera();
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    cameraStream = stream;
    cameraPreview.srcObject = stream;
    await cameraPreview.play();
    isCameraMode = true;
    if (captureButton) {
      captureButton.disabled = false;
    }
    startCameraLoop();
  } catch (error) {
    console.error(error);
    alert("无法访问摄像头，请检查浏览器权限设置");
  }
}

function startCameraLoop() {
  if (!isCameraMode) {
    return;
  }
  const loop = () => {
    if (!isCameraMode) {
      return;
    }
    if (cameraPreview.readyState >= 2) {
      renderFiltered();
    }
    cameraAnimationId = requestAnimationFrame(loop);
  };
  loop();
}

function stopCamera() {
  isCameraMode = false;
  if (cameraAnimationId !== null) {
    cancelAnimationFrame(cameraAnimationId);
    cameraAnimationId = null;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if (cameraPreview) {
    cameraPreview.srcObject = null;
  }
  if (captureButton) {
    captureButton.disabled = true;
  }
}
