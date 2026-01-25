# Space Dice 

**Space Dice** is a browser-based dice game built with **HTML, CSS and Vanilla JavaScript**, featuring a **3D CSS cube**, a space-themed neumorphic-inspired UI, and a fully managed scoring system.  
This project was created as a **frontend-focused, educational showcase**, with particular attention to animations, game logic, and visual polish — without using frameworks.

---

## Highlights

- **3D Dice with deterministic face mapping**  
  The dice is a CSS 3D cube whose final visible face is **explicitly selected and controlled in JavaScript**, ensuring consistency between visuals and game logic.

- **Cinematic roll animation decoupled from logic**  
  The dice performs multiple full 360° rotations for visual realism, while the actual rolled value is calculated independently in JavaScript and mapped to the final cube orientation.

- **Robust scoring system**  
  Current score accumulation, hold-to-bank mechanics, turn switching, win condition handling, and full game reset logic.

- **Neumorphic-inspired, space-themed UI**  
  Custom animations, glowing effects, transitions and interactive feedback built entirely with CSS and JS.

- **No frameworks, no build step**  
  Pure HTML, CSS and Vanilla JavaScript for maximum clarity, portability and readability.

---

## How the 3D Dice Works (Short Explanation)

The dice is built as a **CSS 3D cube** composed of six faces positioned along the X, Y and Z axes.  
On each roll:

1. JavaScript randomly selects one entry from a predefined `faces[]` map.
2. Each map entry contains:
   - The exact `rotateX` / `rotateY` values needed to bring a specific face to the front.
   - The corresponding numeric value used for score calculation.
3. Additional full 360° rotations are added purely for visual effect.

This approach creates the illusion of a fully physical dice roll while keeping the game logic **simple, deterministic, and reliable**, avoiding the complexity of tracking real-time 3D face transitions.

---

## Game Rules

- Click **Roll Dice** to roll the dice.
- Rolling a **1** resets the current score and passes the turn.
- Rolling **above 1** increases the current score.
- Click **Hold Score** to save current points to the total score and pass the turn.
- The first player to reach **100 points** wins.
- Click **New Game** to reset the match.

---

## Tech Stack

- **HTML5**
- **CSS3**
  - CSS 3D transforms
  - Keyframe animations
  - Neumorphic-style shadows
- **Vanilla JavaScript (ES6+)**
  - DOM manipulation
  - Game state management
  - Animation coordination

---

## Run Locally

No setup required.

```bash
# Just open index.html in your browser
