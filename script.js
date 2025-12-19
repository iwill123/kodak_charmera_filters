const fileInput = document.getElementById("fileInput");
const colorSelect = document.getElementById("colorSelect");
const thresholdRange = document.getElementById("thresholdRange");
const thresholdValue = document.getElementById("thresholdValue");
const sharpnessRange = document.getElementById("sharpnessRange");
const sharpnessValue = document.getElementById("sharpnessValue");
const downloadButton = document.getElementById("downloadButton");
const randomButton = document.getElementById("randomButton");
const originalPreview = document.getElementById("originalPreview");
const resultCanvas = document.getElementById("resultCanvas");
const resultCtx = resultCanvas.getContext("2d");
const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const colorPicker = document.getElementById("colorPicker");
const resetButton = document.getElementById("resetButton");

let sourceImage = null;
let processedDataUrl = "";
let useCustomColor = false;
let lastRandomKey = null;

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

fileInput.addEventListener("change", event => {
const file = event.target.files && event.target.files[0];
if (!file) {
return;
}
const reader = new FileReader();
reader.onload = () => {
const image = new Image();
image.onload = () => {
sourceImage = image;
originalPreview.src = image.src;
fitCanvasToImage();
downloadButton.disabled = true;
processedDataUrl = "";
renderFiltered();
};
image.src = reader.result;
};
reader.readAsDataURL(file);
});

thresholdRange.addEventListener("input", () => {
thresholdValue.textContent = thresholdRange.value;
if (sourceImage && sourceImage.width && sourceImage.height) {
renderFiltered();
}
});

sharpnessRange.addEventListener("input", () => {
sharpnessValue.textContent = sharpnessRange.value;
if (sourceImage && sourceImage.width && sourceImage.height) {
renderFiltered();
}
});

colorSelect.addEventListener("change", () => {
useCustomColor = false;
const hex = colorMap[colorSelect.value] || colorMap.kodak;
colorPicker.value = hex;
if (sourceImage && sourceImage.width && sourceImage.height) {
renderFiltered();
}
});

colorPicker.addEventListener("input", () => {
useCustomColor = true;
colorSelect.value = "";
colorSelect.selectedIndex = -1;
if (sourceImage && sourceImage.width && sourceImage.height) {
renderFiltered();
}
});

downloadButton.addEventListener("click", () => {
if (!processedDataUrl) {
return;
}
const link = document.createElement("a");
link.href = processedDataUrl;
link.download = "kodak-filter.png";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
});

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
if (sourceImage && sourceImage.width && sourceImage.height) {
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
fileInput.value = "";
sourceImage = null;
originalPreview.src = "";
resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
processedDataUrl = "";
downloadButton.disabled = true;
closeImageModal();
});

function openImageModal(src) {
if (!src) {
return;
}
modalImage.src = src;
imageModal.classList.add("visible");
}

function closeImageModal() {
imageModal.classList.remove("visible");
modalImage.src = "";
}

originalPreview.addEventListener("click", () => {
if (!originalPreview.src) {
return;
}
openImageModal(originalPreview.src);
});

resultCanvas.addEventListener("click", () => {
if (!processedDataUrl) {
return;
}
openImageModal(processedDataUrl);
});

imageModal.addEventListener("click", () => {
closeImageModal();
});

function fitCanvasToImage() {
if (!sourceImage) {
return;
}
const maxWidth = 1920;
const maxHeight = 1280;
let width = sourceImage.width;
let height = sourceImage.height;
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
tempCtx.drawImage(sourceImage, 0, 0, width, height);
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
processedDataUrl = resultCanvas.toDataURL("image/png");
downloadButton.disabled = false;
}
