// script.js - Gesture-based Cricket Game (Client-side)

let videoElement = document.getElementById('videoElement');
let canvasElement = document.getElementById('canvasElement');
let canvasCtx = canvasElement.getContext('2d');

let gameState = {
  stage: 'start', // start, choose, toss, play
  userChoice: null,
  tossResult: null,
  batting: null,
  firstInningsScore: null,
  secondInningsScore: null,
  target: null,
  currentPlayer: 'user'
};

let fingerCount = 0;

// Load MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});
hands.onResults(onResults);

// Set up camera stream
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    drawLandmarks(canvasCtx, results.multiHandLandmarks[0]);
    fingerCount = detectFingers(results.multiHandLandmarks[0]);
    drawGameState();
  }

  canvasCtx.restore();
}

function detectFingers(landmarks) {
  const tipIds = [4, 8, 12, 16, 20];
  let count = 0;
  if (landmarks[4].y < landmarks[3].y &&
      landmarks[8].y > landmarks[6].y &&
      landmarks[12].y > landmarks[10].y &&
      landmarks[16].y > landmarks[14].y &&
      landmarks[20].y > landmarks[18].y) {
    return 6; // Thumbs-up for "6"
  } else {
    if (landmarks[4].x < landmarks[3].x) count++;
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;
    return count;
  }
}

function drawLandmarks(ctx, landmarks) {
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  for (let i = 0; i < landmarks.length; i++) {
    const x = landmarks[i].x * canvasElement.width;
    const y = landmarks[i].y * canvasElement.height;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0ff';
    ctx.fill();
  }
}

function drawGameState() {
  canvasCtx.font = '20px Arial';
  canvasCtx.fillStyle = 'yellow';
  canvasCtx.fillText(`Fingers: ${fingerCount}`, 20, 460);
  canvasCtx.fillText(`Stage: ${gameState.stage}`, 20, 480);
  // Add more stage-based drawing logic here
}
