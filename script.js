const courses = [
  { icon: "🧮", title: "Math Momentum", text: "Practice algebra, geometry, and problem-solving with bite-sized challenges." },
  { icon: "🔬", title: "Science Spark", text: "Understand ecosystems, forces, cells, and experiments through simple models." },
  { icon: "📚", title: "Reading Lab", text: "Improve comprehension, vocabulary, and evidence-based writing." },
  { icon: "🌍", title: "History Quest", text: "Connect timelines, causes, and cultures with memorable story maps." },
  { icon: "💻", title: "Code Glow", text: "Learn web basics, logic, debugging, and creative programming projects." },
  { icon: "🎯", title: "Exam Strategy", text: "Use recall, spacing, and calm test routines to perform with confidence." },
];

const questions = [
  {
    question: "Which study method asks you to retrieve answers without looking at notes?",
    answers: ["Active recall", "Highlighting only", "Cramming"],
    correct: 0,
  },
  {
    question: "What does spaced repetition help you do?",
    answers: ["Forget faster", "Review at useful intervals", "Avoid practice"],
    correct: 1,
  },
  {
    question: "Why is interleaving useful?",
    answers: ["It mixes related skills", "It removes feedback", "It shortens sleep"],
    correct: 0,
  },
];

const courseGrid = document.querySelector("#course-grid");
const plannerForm = document.querySelector("#planner-form");
const planOutput = document.querySelector("#plan-output");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");
const questionEl = document.querySelector("#quiz-question");
const answersEl = document.querySelector("#answers");
const scoreEl = document.querySelector("#score");
const nextButton = document.querySelector("#next-question");

let currentQuestion = 0;
let score = 0;
let answered = false;

courseGrid.innerHTML = courses.map(course => `
  <article class="course-card">
    <div class="icon" aria-hidden="true">${course.icon}</div>
    <h3>${course.title}</h3>
    <p class="muted">${course.text}</p>
  </article>
`).join("");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

plannerForm.addEventListener("submit", event => {
  event.preventDefault();
  const subject = document.querySelector("#subject").value;
  const minutes = Number(document.querySelector("#minutes").value);
  const learn = Math.max(8, Math.round(minutes * 0.4));
  const practice = Math.max(5, Math.round(minutes * 0.45));
  const reflect = Math.max(2, minutes - learn - practice);

  planOutput.innerHTML = `
    <strong>${minutes}-minute ${subject} session</strong>
    <ol>
      <li>${learn} min: learn one key concept and write a simple example.</li>
      <li>${practice} min: solve practice questions without notes.</li>
      <li>${reflect} min: review errors and schedule tomorrow's quick recap.</li>
    </ol>
  `;
});

function renderQuestion() {
  answered = false;
  const item = questions[currentQuestion];
  questionEl.textContent = item.question;
  answersEl.innerHTML = item.answers.map((answer, index) => `
    <button class="button answer" type="button" data-index="${index}">${answer}</button>
  `).join("");
}

answersEl.addEventListener("click", event => {
  const button = event.target.closest(".answer");
  if (!button || answered) return;
  answered = true;
  const selected = Number(button.dataset.index);
  const correct = questions[currentQuestion].correct;
  if (selected === correct) {
    score += 1;
    scoreEl.textContent = score;
  }
  document.querySelectorAll(".answer").forEach((answerButton, index) => {
    answerButton.classList.add(index === correct ? "correct" : "wrong");
  });
});

nextButton.addEventListener("click", () => {
  currentQuestion = (currentQuestion + 1) % questions.length;
  renderQuestion();
});

renderQuestion();
