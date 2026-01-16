/*
  3D dice mapping + "cinematic roll" trick (intentional design)

  The cube is built in CSS with 6 faces positioned in 3D space (translateZ + rotateX/rotateY).
  To show a specific face to the user, we rotate the entire cube (.dice) using rotateX/rotateY.

  A fully realistic dice simulation would require tracking the cube's orientation across rolls
  (or using a physics engine) so that the face value always matches the physical result after
  an arbitrary sequence of rotations.

  For this project, I intentionally decouple:
  1) Game logic (which face value was rolled)
  2) Visual animation (how the cube spins on screen)

  How it works:
  - On each click, JS randomly selects a target face from the `faces[]` map.
    Each entry contains:
      • rotX / rotY: the exact angles needed to bring that face to the front,
        starting from the cube's default orientation.
      • backendFaceValue: the numeric value used for scoring.
  - Then JS adds extra random 360° spins on X/Y purely for visual flair.
    This produces a believable roll while keeping the "final" orientation correct.
  - Because every roll starts from a known base orientation (conceptually),
    we don’t need to compute the cube’s orientation history to keep frontend and backend aligned.

  Result:
  - The face you see is always the face value used for scoring.
  - The roll looks dynamic, but the logic stays simple, deterministic, and maintainable.
*/


// DOM references (players)
const player1 = document.querySelector('.player--1');
const player2 = document.querySelector('.player--2');
const player1Dock = document.getElementById('player1-dock');
const player2Dock = document.getElementById('player2-dock');
const player1TotScrFront = document.getElementById('score--1');
const player2TotScrFront = document.getElementById('score--2');
const player1CurrScrScreen = document.getElementById('curr-scr-screen-1');
const player1CurrScrHeading = document.getElementById('current--1');
const player2CurrScrScreen = document.getElementById('curr-scr-screen-2');
const player2CurrScrHeading = document.getElementById('current--2');

// Buttons
const newGameBtn = document.getElementById('btn--new-game');
const rollBtn = document.getElementById('btn--roll');
const holdBtn = document.getElementById('btn--hold');

// Dice DOM
const diceBox = document.getElementById('dice-box');
const dice = document.getElementById('dice');

// Game state
let player1TotScore = 0;
let player2TotScore = 0;
let player1CurrScore = 0;
let player2CurrScore = 0;

// Dice rotation state
let finalRotationX = 0;
let finalRotationY = 0;

// Face-to-rotation map (from the cube's default CSS orientation)
const faces = [
  { rotX: 0, rotY: 0, backendFaceValue: 1 },       // front
  { rotX: 0, rotY: 180, backendFaceValue: 2 },     // back
  { rotX: 0, rotY: -90, backendFaceValue: 3 },     // right
  { rotX: 0, rotY: 90, backendFaceValue: 4 },      // left
  { rotX: -90, rotY: 0, backendFaceValue: 5 },     // top
  { rotX: 90, rotY: 0, backendFaceValue: 6 }       // bottom
];


// ROLL DICE
rollBtn.addEventListener('click', () => {

  // Remove animation classes that could conflict with rolling
  if (diceBox.classList.contains('fadein')) {
    diceBox.classList.remove('fadein');
    void diceBox.offsetWidth;
  }

  // Pick target face (random) and destructure its values
  const { rotX, rotY, backendFaceValue } = faces[Math.floor(Math.random() * faces.length)];

  // Extra spins for visual effect (1..6 full rotations)
  const randomSpinX = 360 * (Math.floor(Math.random() * 6) + 1);
  const randomSpinY = 360 * (Math.floor(Math.random() * 6) + 1);

  finalRotationX = rotX + randomSpinX;
  finalRotationY = rotY + randomSpinY;

  // Apply rolling state and set transform dynamically
  dice.classList.add('rolling');
  dice.style.transform = `rotateX(${finalRotationX}deg) rotateY(${finalRotationY}deg)`;

  // Flash effect on dice box
  diceBox.classList.add('flashing');

  // Disable controls during animation
  rollBtn.disabled = true;
  holdBtn.disabled = true;
  newGameBtn.disabled = true;

  // Determine active player at the time of the click
  let activePlayer = player1.classList.contains('player--active') ? player1 : player2;

  // Cleanup visual classes after 4s (matches CSS timing)
  setTimeout(function () {
    diceBox.classList.remove('flashing');
    void diceBox.offsetWidth;

    dice.classList.remove('rolling');
    void dice.offsetWidth;
  }, 4000);

  // After roll ends: re-enable controls and apply score logic
  setTimeout(function () {
    rollBtn.disabled = false;
    holdBtn.disabled = false;
    newGameBtn.disabled = false;

    if (activePlayer === player1) {
      if (backendFaceValue > 1) {
        player1CurrScore += backendFaceValue;
        player1CurrScrHeading.innerText = player1CurrScore;
      } else {
        player1CurrScore = 0;
        player1CurrScrHeading.innerText = player1CurrScore;
        player1.classList.remove('player--active');
        player2.classList.add('player--active');
      }
    } else {
      if (backendFaceValue > 1) {
        player2CurrScore += backendFaceValue;
        player2CurrScrHeading.innerText = player2CurrScore;
      } else {
        player2CurrScore = 0;
        player2CurrScrHeading.innerText = player2CurrScore;
        player2.classList.remove('player--active');
        player1.classList.add('player--active');
      }
    }
  }, 4000);
});


// HOLD SCORE
holdBtn.addEventListener('click', () => {
  // Save current score into total score for the active player, then pass the turn
  let activePlayer = player1.classList.contains('player--active') ? player1 : player2;

  if (activePlayer === player1) {
    player1TotScore += player1CurrScore;
    player1TotScrFront.innerText = player1TotScore;
    player1CurrScore = 0;
    player1CurrScrHeading.innerText = player1CurrScore;

    // Pass turn only if player 1 has not won yet
    if (player1TotScore < 100) {
      player1.classList.remove('player--active');
      void player1.offsetWidth;
      player2.classList.add('player--active');
    }
  } else {
    player2TotScore += player2CurrScore;
    player2TotScrFront.innerText = player2TotScore;
    player2CurrScore = 0;
    player2CurrScrHeading.innerText = player2CurrScore;

    if (player2TotScore < 100) {
      player2.classList.remove('player--active');
      void player2.offsetWidth;
      player1.classList.add('player--active');
    }
  }

  // Winner check + animations
  if (player1TotScore >= 100) {
    player1TotScrFront.classList.add('highlights');
    setTimeout(function () {
      player1TotScrFront.classList.remove('highlights');
      void player1.offsetWidth;
      player1.classList.add('player--winner');
      player1Dock.classList.add('win-emerge');
    }, 1500);
  } else if (player2TotScore >= 100) {
    player2TotScrFront.classList.add('highlights');
    setTimeout(function () {
      player2TotScrFront.classList.remove('highlights');
      void player2.offsetWidth;
      player2.classList.add('player--winner');
      player2Dock.classList.add('win-emerge');
    }, 1500);
  }

  // End of match: disable roll/hold, pulse New Game, hide dice box
  if (player1TotScore >= 100 || player2TotScore >= 100) {
    rollBtn.disabled = true;
    holdBtn.disabled = true;

    setTimeout(function () {
      newGameBtn.classList.add('pulsing');
    }, 4500);

    if (!diceBox.classList.contains('fadeout')) {
      setTimeout(function () {
        diceBox.classList.add('fadeout');
      }, 2500);
    }
  }
});


// NEW GAME
newGameBtn.addEventListener('click', () => {
  // Re-enable controls for a new match
  rollBtn.disabled = false;
  holdBtn.disabled = false;

  // Stop pulsing effect on New Game
  if (newGameBtn.classList.contains('pulsing')) {
    newGameBtn.classList.remove('pulsing');
    void newGameBtn.offsetWidth;
  }

  // CASE 1: starting a new game after a match ended (dice box already faded out)
  if (diceBox.classList.contains('fadeout') && !diceBox.classList.contains('fadein')) {

    // Reset active/winner states for both players
    let players = document.querySelectorAll('.player');
    players.forEach((player) => {
      player.classList.remove('player--active', 'player--winner');
    });

    // Restore winner dock style (run "original-position" animation)
    if (player1Dock.classList.contains('win-emerge')) {
      player1Dock.classList.add('original-position');
      player1Dock.classList.remove('win-emerge');
    } else if (player2Dock.classList.contains('win-emerge')) {
      player2Dock.classList.add('original-position');
      player2Dock.classList.remove('win-emerge');
    }

    // After dock restore animation, set Player 1 as default active
    setTimeout(function () {
      player1Dock.classList.remove('original-position');
      player2Dock.classList.remove('original-position');
      player1.classList.add('player--active');
    }, 2100);

    // Show dice box again
    diceBox.classList.remove('fadeout');
    void diceBox.offsetWidth;
    diceBox.classList.add('fadein');
  }

  // CASE 2: new game clicked at page load (no one has scored yet)
  // FIX: original condition was inconsistent; at page load both totals are 0
  else if (
    !diceBox.classList.contains('fadein') &&
    !diceBox.classList.contains('fadeout') &&
    (player1TotScore === 0 && player2TotScore === 0)
  ) {
    let players = document.querySelectorAll('.player');
    players.forEach((player) => {
      player.classList.remove('player--active');
    });
    player1.classList.add('player--active');
  }

  // CASE 3: new game clicked mid-match (at least one player has a total score > 0)
  else if (
    !diceBox.classList.contains('fadein') &&
    !diceBox.classList.contains('fadeout') &&
    (player1TotScore > 0 || player2TotScore > 0)
  ) {
    let players = document.querySelectorAll('.player');
    players.forEach((player) => {
      player.classList.remove('player--active');
    });
    player1.classList.add('player--active');
  }

  // Frontend reset
  player1TotScrFront.innerText = "00";
  player2TotScrFront.innerText = "00";
  player1CurrScrHeading.innerText = 0;
  player2CurrScrHeading.innerText = 0;

  // Backend reset
  player1TotScore = 0;
  player2TotScore = 0;
  player1CurrScore = 0;
  player2CurrScore = 0;
});


// MODAL (game rules)
const bodyArea = document.querySelector('body');
const showBtn = document.querySelector('.show-modal');
const closeBtn = document.querySelector('.close-modal');
const modalWindow = document.querySelector('.modal');
const blurredOverlay = document.querySelector('.overlay');

function openModal() {
  if (modalWindow.classList.contains('hidden')) {
    modalWindow.classList.remove('hidden');
    blurredOverlay.classList.remove('hidden');
  }
}

function closeModal() {
  if (!modalWindow.classList.contains('hidden')) {
    modalWindow.classList.add('hidden');
    blurredOverlay.classList.add('hidden');
  }
}

showBtn.addEventListener('click', function (event) {
  // Prevent body click from instantly closing the modal (event bubbling)
  event.stopPropagation();
  openModal();
});

closeBtn.addEventListener('click', closeModal);
blurredOverlay.addEventListener('click', closeModal);
bodyArea.addEventListener('click', closeModal);

document.addEventListener('keydown', function (event) {
  if (event.key === "Escape") closeModal();
});
