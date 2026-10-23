const giftOverlay = document.getElementById('giftOverlay');
const messageOverlay = document.getElementById('messageOverlay');
const openGiftButton = document.getElementById('openGift');
const closePopupButton = document.getElementById('closePopup');
const closeMessageButton = document.getElementById('closeMessage');
const celebrateAgainButton = document.getElementById('celebrateAgain');
const popupGift = document.getElementById('popupGift');
const confettiLayer = document.getElementById('confettiLayer');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');
const musicIcon = document.getElementById('musicIcon');

let audioContext = null;
let musicTimer = null;
let noteIndex = 0;
let musicPlaying = false;
let confettiTimer = null;

// A small synthesized birthday melody: no audio file or third-party music download needed.
const melody = [
  [392, .28], [392, .28], [440, .55], [392, .55], [523, .55], [494, 1.0],
  [392, .28], [392, .28], [440, .55], [392, .55], [587, .55], [523, 1.0],
  [392, .28], [392, .28], [784, .55], [659, .55], [523, .55], [494, .55], [440, 1.0],
  [698, .28], [698, .28], [659, .55], [523, .55], [587, .55], [523, 1.0]
];

function playNote(frequency, duration) {
  if (!audioContext || audioContext.state !== 'running') return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.11, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.88);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playNextNote() {
  if (!musicPlaying) return;
  const [frequency, duration] = melody[noteIndex % melody.length];
  playNote(frequency, duration * 0.82);
  noteIndex++;
  musicTimer = window.setTimeout(playNextNote, duration * 1000);
}

async function toggleMusic() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      musicLabel.textContent = 'Music not supported';
      return;
    }
    audioContext = new AudioContextClass();
  }
  if (musicPlaying) {
    musicPlaying = false;
    window.clearTimeout(musicTimer);
    musicLabel.textContent = 'Play birthday music';
    musicIcon.textContent = '▶';
    musicToggle.setAttribute('aria-pressed', 'false');
    return;
  }
  await audioContext.resume();
  musicPlaying = true;
  musicLabel.textContent = 'Birthday music playing';
  musicIcon.textContent = 'Ⅱ';
  musicToggle.setAttribute('aria-pressed', 'true');
  playNextNote();
}

function burstConfetti(count = 95) {
  const colors = ['#f35d97', '#ffc857', '#9d83ef', '#65c9ed', '#ff9ebd', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--duration', `${2.4 + Math.random() * 3.2}s`);
    piece.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.7}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 6500);
  }
}

function openMessage() {
  giftOverlay.classList.add('hidden');
  messageOverlay.classList.remove('hidden');
  burstConfetti(150);
  if (!musicPlaying) toggleMusic().catch(() => {});
  closeMessageButton.focus();
}
function showGift() {
  messageOverlay.classList.add('hidden');
  giftOverlay.classList.remove('hidden');
  burstConfetti(65);
  openGiftButton.focus();
}

openGiftButton.addEventListener('click', openMessage);
popupGift.addEventListener('click', openMessage);
closePopupButton.addEventListener('click', () => giftOverlay.classList.add('hidden'));
closeMessageButton.addEventListener('click', () => messageOverlay.classList.add('hidden'));
celebrateAgainButton.addEventListener('click', showGift);
musicToggle.addEventListener('click', () => toggleMusic().catch(() => {}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    giftOverlay.classList.add('hidden');
    messageOverlay.classList.add('hidden');
  }
});

// A gentle first burst makes the opening popup feel celebratory.
window.addEventListener('load', () => {
  burstConfetti(75);
  confettiTimer = window.setTimeout(() => burstConfetti(35), 900);
});
