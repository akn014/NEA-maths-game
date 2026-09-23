const loginScreen = document.getElementById("login-screen");
const existingStudentsDiv = document.getElementById("existing-students");
const newStudentInput = document.getElementById("new-student-name");
const createStudentButton = document.getElementById("create-student-btn");
const startScreen = document.getElementById("start_screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");
const topicScreen = document.getElementById("topic-screen");
const categoryScreen = document.getElementById("category-screen");
const groupSpeed = document.getElementById("group-speed");
const groupShapes = document.getElementById("group-shapes");
const statsScreen = document.getElementById("stats-screen");
const pauseMenu = document.getElementById("pause-menu");
const coinsDisplay = document.getElementById("coins");
const questionDisplay = document.getElementById("question");
const timerDisplay = document.getElementById("timer");
const bestScoreDisplay = document.getElementById("best_score");
const shapeDisplay = document.getElementById("shape-display");
const answerInput = document.getElementById("answer_input");
const feedback = document.getElementById("feedback");

let allStudents = JSON.parse(localStorage.getItem("allStudents") || "{}");
let currentStudent = null;
let questionsAttempted = 0, correctAnswers = 0, difficulty = 1, correctStreak = 0, incorrectStreak = 0, coins = 0;
let selectedTopic = "mixed", selectedCategory = "speed", shapeDimensions = {}, correctAnswer = 0, countdownInterval;
const ROUND_TIME = 60;
let timeLeft = ROUND_TIME;

function saveAllStudents() { localStorage.setItem("allStudents", JSON.stringify(allStudents)); }
function newStudentData() { return { overallStats: { totalQuestions: 0, totalCorrect: 0, totalTimePlayed: 0, bestDifficulty: 1, roundsPlayed: 0 }, bestScore: 0 }; }
function studentData() { return allStudents[currentStudent]; }

function showLoginScreen() {
  existingStudentsDiv.innerHTML = "";
  Object.keys(allStudents).forEach((name) => {
    const button = document.createElement("button"); button.textContent = name;
    button.addEventListener("click", () => logInAsStudent(name)); existingStudentsDiv.appendChild(button);
  });
}
function logInAsStudent(name) { currentStudent = name; loginScreen.hidden = true; startScreen.hidden = false; }
createStudentButton.addEventListener("click", () => {
  const name = newStudentInput.value.trim(); if (!name) return;
  if (!allStudents[name]) { allStudents[name] = newStudentData(); saveAllStudents(); }
  logInAsStudent(name);
});
newStudentInput.addEventListener("keydown", (event) => { if (event.key === "Enter") createStudentButton.click(); });
showLoginScreen();

document.getElementById("start_btn").addEventListener("click", () => { startScreen.hidden = true; categoryScreen.hidden = false; });
document.querySelectorAll(".category-btn").forEach((button) => button.addEventListener("click", () => {
  selectedCategory = button.dataset.category; categoryScreen.hidden = true; topicScreen.hidden = false;
  groupSpeed.hidden = selectedCategory !== "speed"; groupShapes.hidden = selectedCategory !== "shapes";
}));
document.querySelectorAll(".topic-btn").forEach((button) => button.addEventListener("click", () => { selectedTopic = button.dataset.topic; startGame(); }));

function tick() { timeLeft--; timerDisplay.textContent = `Time left: ${timeLeft}s`; if (timeLeft <= 0) { clearInterval(countdownInterval); endRound(); } }
function startGame() {
  clearInterval(countdownInterval); correctAnswers = 0; questionsAttempted = 0; coins = 0; difficulty = 1; correctStreak = 0; incorrectStreak = 0;
  topicScreen.hidden = true; resultsScreen.hidden = true; gameScreen.hidden = false; timeLeft = ROUND_TIME; timerDisplay.textContent = `Time left: ${timeLeft}s`;
  countdownInterval = setInterval(tick, 1000); generateQuestion();
}

document.getElementById("pause_btn").addEventListener("click", () => { clearInterval(countdownInterval); gameScreen.hidden = true; pauseMenu.hidden = false; });
document.getElementById("resume_btn").addEventListener("click", () => { pauseMenu.hidden = true; gameScreen.hidden = false; countdownInterval = setInterval(tick, 1000); });
document.getElementById("restart_btn").addEventListener("click", () => { pauseMenu.hidden = true; startGame(); });
document.getElementById("home_btn").addEventListener("click", () => { clearInterval(countdownInterval); pauseMenu.hidden = true; startScreen.hidden = false; });
document.getElementById("change_topic_btn").addEventListener("click", () => { clearInterval(countdownInterval); pauseMenu.hidden = true; categoryScreen.hidden = false; });

document.getElementById("view_stats_btn").addEventListener("click", () => {
  const stats = studentData().overallStats;
  const accuracy = stats.totalQuestions ? Math.round(stats.totalCorrect / stats.totalQuestions * 100) : 0;
  const average = stats.totalQuestions ? (stats.totalTimePlayed / stats.totalQuestions).toFixed(1) : 0;
  document.getElementById("stat_rounds").textContent = `Rounds played: ${stats.roundsPlayed}`;
  document.getElementById("stat_questions").textContent = `Total questions answered: ${stats.totalQuestions}`;
  document.getElementById("stat_accuracy").textContent = `Overall accuracy: ${accuracy}%`;
  document.getElementById("stat_difficulty").textContent = `Best difficulty reached: ${stats.bestDifficulty}`;
  document.getElementById("stat_speed").textContent = `Average time per question: ${average}s`;
  startScreen.hidden = true; statsScreen.hidden = false;
});
document.getElementById("stats_back_btn").addEventListener("click", () => { statsScreen.hidden = true; startScreen.hidden = false; });

function generateQuestion() {
  let operation = selectedTopic;
  if (operation === "mixed") operation = ["+", "-", "x", "/"][Math.floor(Math.random() * 4)];
  if (operation === "shapes-mixed") operation = ["area", "perimeter"][Math.floor(Math.random() * 2)];
  let number1, number2;
  if (operation === "+") { number1 = random(10 * difficulty); number2 = random(10 * difficulty); correctAnswer = number1 + number2; }
  else if (operation === "-") { number1 = random(10 * difficulty); number2 = Math.floor(Math.random() * number1) + 1; correctAnswer = number1 - number2; }
  else if (operation === "x") { number1 = random(5 * difficulty); number2 = random(10); correctAnswer = number1 * number2; }
  else if (operation === "/") { number2 = random(10); correctAnswer = random(5 * difficulty); number1 = number2 * correctAnswer; }
  else if (operation === "area") { const bottomWidth = random(5) + 5, bottomHeight = random(3) + 1, topWidth = Math.floor(Math.random() * (bottomWidth - 3)) + 2, topHeight = random(4) + 2; shapeDimensions = { bottomWidth, bottomHeight, topWidth, topHeight }; correctAnswer = bottomWidth * bottomHeight + topWidth * topHeight; }
  else { number1 = random(10 * difficulty); number2 = random(10 * difficulty); correctAnswer = (number1 + number2) * 2; }
  if (operation === "area") { questionDisplay.textContent = "This shape is made of two rectangles. What is its total area?"; drawLShape(shapeDimensions); shapeDisplay.hidden = false; }
  else if (operation === "perimeter") { questionDisplay.textContent = `A rectangle is ${number1}cm wide and ${number2}cm tall. What is its perimeter?`; drawRectangle(number1, number2); shapeDisplay.hidden = false; }
  else { questionDisplay.textContent = `${number1} ${operation} ${number2} = ?`; shapeDisplay.hidden = true; }
  coinsDisplay.textContent = `Coins: ${coins}`; answerInput.value = ""; feedback.textContent = ""; answerInput.focus();
}
function random(max) { return Math.floor(Math.random() * max) + 1; }
function drawLShape(d) { const s = 13, x = 60, y = 40, bw = d.bottomWidth * s, bh = d.bottomHeight * s, tw = d.topWidth * s, th = d.topHeight * s; shapeDisplay.innerHTML = `<polygon points="${x},${y} ${x + tw},${y} ${x + tw},${y + th} ${x + bw},${y + th} ${x + bw},${y + th + bh} ${x},${y + th + bh}" fill="lightblue" stroke="black" stroke-width="2"/><text x="${x + tw / 2}" y="${y - 8}" text-anchor="middle">${d.topWidth}cm</text><text x="${x + bw / 2}" y="${y + th + bh + 16}" text-anchor="middle">${d.bottomWidth}cm</text><text x="${x + bw + 16}" y="${y + th + bh / 2}" text-anchor="middle" transform="rotate(-90 ${x + bw + 16} ${y + th + bh / 2})">${d.bottomHeight}cm</text>`; }
function drawRectangle(width, height) { const s = 10, x = 40, y = 30, w = width * s, h = height * s; shapeDisplay.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="lightblue" stroke="black" stroke-width="2"/><text x="${x + w / 2}" y="${y - 10}" text-anchor="middle">${width}cm</text><text x="${x - 18}" y="${y + h / 2}" text-anchor="middle" transform="rotate(-90 ${x - 18} ${y + h / 2})">${height}cm</text>`; }

function checkAnswer() {
  if (answerInput.value === "") { feedback.textContent = "Please enter an answer."; return; }
  questionsAttempted++; const answer = Number(answerInput.value);
  if (answer === correctAnswer) { correctAnswers++; coins += 5; correctStreak++; incorrectStreak = 0; feedback.textContent = "Correct!"; if (correctStreak >= 3) { difficulty++; coins += 10; correctStreak = 0; feedback.textContent = "Correct! Difficulty increased! +10 bonus coins!"; } }
  else { incorrectStreak++; correctStreak = 0; feedback.textContent = `Incorrect! The answer was ${correctAnswer}.`; if (incorrectStreak >= 2) { difficulty = Math.max(1, difficulty - 1); incorrectStreak = 0; feedback.textContent += " Let's slow things down!"; } }
  coinsDisplay.textContent = `Coins: ${coins}`; setTimeout(() => { if (timeLeft > 0) generateQuestion(); }, 900);
}
document.getElementById("submit_btn").addEventListener("click", checkAnswer);
answerInput.addEventListener("keydown", (event) => { if (event.key === "Enter") checkAnswer(); });

function endRound() {
  const stats = studentData().overallStats; stats.totalQuestions += questionsAttempted; stats.totalCorrect += correctAnswers; stats.totalTimePlayed += ROUND_TIME; stats.roundsPlayed++; stats.bestDifficulty = Math.max(stats.bestDifficulty, difficulty);
  const student = studentData(); if (correctAnswers > student.bestScore) student.bestScore = correctAnswers; saveAllStudents();
  const accuracy = questionsAttempted ? Math.round(correctAnswers / questionsAttempted * 100) : 0;
  document.getElementById("final_score").textContent = `${correctAnswers} out of ${questionsAttempted} correct`;
  document.getElementById("final_coins").textContent = `Coins: ${coins}`; document.getElementById("final_accuracy").textContent = `Accuracy: ${accuracy}%`;
  document.getElementById("average_time").textContent = `Average time per question: ${questionsAttempted ? (ROUND_TIME / questionsAttempted).toFixed(1) : 0}s`;
  bestScoreDisplay.textContent = `Best: ${student.bestScore}`; gameScreen.hidden = true; resultsScreen.hidden = false;
}
document.getElementById("play_again_btn").addEventListener("click", startGame);
document.getElementById("results_home_btn").addEventListener("click", () => { resultsScreen.hidden = true; startScreen.hidden = false; });
