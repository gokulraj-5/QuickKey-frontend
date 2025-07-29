const video = document.getElementById('camera');
const captureBtn = document.getElementById('capture');
const answerBox = document.getElementById('answer');

// Start camera
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: "environment" } }
})
 
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Camera Error:", err));

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

  const res = await fetch('https://quickkey-backend-abc1.onrender.com/predict', {  // ✅ Full absolute URL


    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: extractedText })
  });

  const data = await res.json();
  answerBox.textContent = data.answer;
});
