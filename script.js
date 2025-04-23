const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const radius = canvas.width / 2;
let names = [];
let angle = 0;
let spinning = false;
let spinAngle = 0;
let winningPointerAngle = 0;
const spinSound = document.getElementById("spinSound");

function drawWheel() {
  // Loop through all names to draw each section
  for (let i = 0; i < names.length; i++) {
    const startAngle = (i * 2 * Math.PI) / names.length + angle;
    const endAngle = ((i + 1) * 2 * Math.PI) / names.length + angle;

    // Set color for each section
    ctx.fillStyle = `hsl(${(i * 360) / names.length}, 70%, 60%)`;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle);
    ctx.fill();

    // Draw name text on each section
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(startAngle + (endAngle - startAngle) / 2); // Position the text in the center of the section
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.fillText(names[i], radius - 10, 5); // Position text slightly away from the center
    ctx.restore();
  }

  drawPointer(winningPointerAngle); // Draw the rotating clock pointer
}

function drawPointer(angleToWinner = 0) {
  ctx.save();
  ctx.translate(radius, radius);   // Move to center of wheel

  ctx.rotate(angleToWinner);  // Rotate pointer to the winning segment

  ctx.strokeStyle = "#cc0000";  // Merchantrade red
  ctx.lineWidth = 6;           // Make the pointer thicker
  ctx.beginPath();
  ctx.moveTo(0, -radius);      // Start at center
  ctx.lineTo(0, -radius + 20); // Draw the pointer line (clock hand)
  ctx.stroke();

  ctx.restore();
}

function spinWheel() {
  if (spinning) return;
  spinning = true;
  spinAngle = Math.random() * 360 + 360 * 10;  // Spin 5 full rotations at least
  let duration = 5000;
  let start = Date.now();
  spinSound.currentTime = 0;
  spinSound.play();

  const spinInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    angle = ((spinAngle * easeOut) * Math.PI / 180) % (2 * Math.PI);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWheel();

    if (progress >= 1) {
      clearInterval(spinInterval);
      spinSound.pause();
      showWinner();  // Display the winner after the spin ends
      spinning = false;
    }
  }, 16); // 60 frames per second, or roughly every 16 milliseconds
}

const winnerList = [];

function showWinner() {
  const winnerIndex = names.length - Math.floor(((angle + Math.PI / 2) % (2 * Math.PI)) / (2 * Math.PI / names.length)) - 1;
  const winner = names[winnerIndex];

  winningPointerAngle = angle + (winnerIndex + 0.5) * (2 * Math.PI / names.length);

  // Set winner name and show modal
  document.getElementById("winnerName").textContent = winner;
  document.getElementById("winnerModal").style.display = "flex";

  // Play the winner sound
  const winnerSound = document.getElementById("winnerSound");
  winnerSound.currentTime = 0; // Reset the audio to the start
  winnerSound.play(); // Play the winner sound

  // Add winner to the list (no duplicates, and max 10)
  if (!winnerList.includes(winner)) {
    winnerList.unshift(winner); // Add to beginning
    if (winnerList.length > 100) {
      winnerList.pop(); // Keep only top 10
    }
    updateWinnerListDisplay();
  }
}

function closeModal() {
  document.getElementById("winnerModal").style.display = "none";

  // Stop the winner sound
  const winnerSound = document.getElementById("winnerSound");
  winnerSound.pause(); // Pause the audio
  winnerSound.currentTime = 0; // Reset audio position
}


function updateWinnerListDisplay() {
  const listElement = document.getElementById("winnerListDisplay");
  listElement.innerHTML = ""; // Clear list
  winnerList.forEach((name, index) => {
    const li = document.createElement("li");
    li.textContent = `${name}`;
    listElement.appendChild(li);
  });
}


function closeModal() {
  document.getElementById("winnerModal").style.display = "none";
}


function startWheel() {
  const input = document.getElementById("namesInput").value;
  names = input.split("\n").map(name => name.trim()).filter(name => name !== "");

  if (names.length < 2) {
    alert("Please enter at least 2 names.");
    return;
  }

  // Reset state before starting the wheel
  document.getElementById("winnerDisplay").textContent = "";
  angle = 0;
  winningPointerAngle = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWheel();
  spinWheel();
}
