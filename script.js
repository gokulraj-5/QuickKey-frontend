const video = document.getElementById('camera');
const captureBtn = document.getElementById('capture');
const answerBox = document.getElementById('answer');
const toggleCameraBtn = document.getElementById('toggleCameraBtn');

let useFrontCamera = false;
let currentStream;

// Start the camera
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  try {
    const constraints = {
      video: {
        facingMode: useFrontCamera ? 'user' : 'environment'
      },
      audio: false
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    console.error("Camera error:", err);
    alert("Unable to access camera. Please check permissions or try a different device.");
  }
}

// Toggle between front and rear camera
toggleCameraBtn.addEventListener('click', () => {
  useFrontCamera = !useFrontCamera;
  startCamera();
});

// Start camera on load
startCamera();

// Capture image and fetch answer
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
    console.error("Fetch error:", err);
    answerBox.textContent = "Something went wrong.";
  }
});
