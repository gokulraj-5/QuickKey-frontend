const video = document.getElementById('camera');
const captureBtn = document.getElementById('capture');
const answerBox = document.getElementById('answer');
const toggleCameraBtn = document.getElementById('toggleCameraBtn'); // Add this button in HTML

let useFrontCamera = false;
let currentStream;

// 📸 Start camera with selected facing mode
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    const constraints = {
      video: {
        facingMode: useFrontCamera ? "user" : "environment"
      }
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    console.error("Camera Error:", err);
  }
}

// 🔁 Toggle front/rear camera
toggleCameraBtn.addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  startCamera();
});

// 🟢 Start rear camera by default on load
startCamera();

// 📷 Capture image and get answer
captureBtn.addEventListener('click', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL('image/png');

  answerBox.textContent = "Processing OCR...";

  const result = await Tesseract.recognize(imageData, 'eng');
  const extractedText = result.data.text;
  console.log("Extracted:", extractedText);

  answerBox.textContent = "Getting answer from Gemini...";

  try {
    const res = await fetch('https://quickkey-backend.onrender.com/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: extractedText })
    });

    const data = await res.json();
    answerBox.textContent = data.answer;
  } catch (err) {
    console.error("Gemini API Error:", err);
    answerBox.textContent = "Something went wrong. Try again.";
  }
});
