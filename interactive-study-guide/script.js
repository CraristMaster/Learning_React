const modules = [
  {
    id: "variables", icon: "📦", title: "Variables",
    summary: "Variables store information that a program can use and change.",
    terms: ["variable", "value", "string", "number", "boolean"],
    diagram: "name → value → program uses it"
  },
  {
    id: "conditionals", icon: "🔀", title: "Conditionals",
    summary: "Conditionals allow a program to make decisions using if/else logic.",
    terms: ["if", "else", "condition", "comparison", "true/false"],
    diagram: "Condition? → YES → Action A | NO → Action B"
  },
  {
    id: "loops", icon: "🔁", title: "Loops",
    summary: "Loops repeat instructions while a condition is true or for a set number of times.",
    terms: ["for", "while", "iteration", "counter", "repeat"],
    diagram: "Start → Check → Run → Repeat → Stop"
  },
  {
    id: "functions", icon: "⚙️", title: "Functions",
    summary: "Functions group reusable instructions so code can be called when needed.",
    terms: ["function", "parameter", "argument", "return", "call"],
    diagram: "Input → Function → Process → Output"
  }
];

const questions = [
  {module:"variables", q:"Which statement best describes a variable?", options:["A reusable block of HTML","A named place for storing a value","A loop that repeats forever","A browser window"], answer:1, exp:"A variable gives a name to a stored value, such as a number or text."},
  {module:"variables", q:"Which value is a boolean?", options:["42","\"Hello\"","true","3.14"], answer:2, exp:"A boolean has one of two logical values: true or false."},
  {module:"conditionals", q:"What is the main purpose of an if statement?", options:["To store data","To repeat code","To make a decision based on a condition","To create a web page"], answer:2, exp:"An if statement runs code when its condition is true."},
  {module:"conditionals", q:"If score >= 50 is true, which branch normally runs?", options:["The if branch","The else branch","Neither branch","Both branches"], answer:0, exp:"When the if condition is true, the if branch executes."},
  {module:"loops", q:"What is a loop mainly used for?", options:["Repeating instructions","Changing a file name","Styling text","Storing one value"], answer:0, exp:"Loops repeat a block of instructions efficiently."},
  {module:"loops", q:"What is an iteration?", options:["A CSS color","One cycle of a loop","A database","A function parameter"], answer:1, exp:"One complete pass through a loop is called an iteration."},
  {module:"functions", q:"Why are functions useful?", options:["They make code reusable","They remove all variables","They only work in CSS","They prevent programs from running"], answer:0, exp:"Functions let you package instructions and reuse them by calling the function."},
  {module:"functions", q:"What is a parameter?", options:["A returned result","A value stored in CSS","A named input a function can receive","A loop condition"], answer:2, exp:"A parameter is a named input defined by a function."}
];

const state = {
  questionIndex: 0,
  score: 0,
  wrongModules: [],
  answered: false
};

const $ = (id) => document.getElementById(id);

function renderModules() {
  $("moduleGrid").innerHTML = modules.map(m => `
    <article class="module-card">
      <div class="icon">${m.icon}</div>
      <h3>${m.title}</h3>
      <p>${m.summary}</p>
      <details>
        <summary>View key terms & diagram</summary>
        <div class="terms">${m.terms.map(t => `<span class="term">${t}</span>`).join("")}</div>
        <div class="diagram">${m.diagram}</div>
      </details>
    </article>
  `).join("");
}

function showView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $(`${view}-view`).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  window.scrollTo({top:0, behavior:"smooth"});
}

function startQuiz() {
  state.questionIndex = 0;
  state.score = 0;
  state.wrongModules = [];
  state.answered = false;
  $("liveScore").textContent = "0";
  showView("quiz");
  renderQuestion();
}

function renderQuestion() {
  const item = questions[state.questionIndex];
  const module = modules.find(m => m.id === item.module);
  state.answered = false;
  $("questionCount").textContent = `Question ${state.questionIndex + 1} of ${questions.length}`;
  $("progressPercent").textContent = `${Math.round(state.questionIndex / questions.length * 100)}%`;
  $("progressBar").style.width = `${state.questionIndex / questions.length * 100}%`;
  $("questionModule").textContent = module.title;
  $("questionText").textContent = item.q;
  $("feedback").className = "feedback hidden";
  $("nextBtn").classList.add("hidden");
  $("answers").innerHTML = item.options.map((option, i) =>
    `<button class="answer" data-index="${i}">${String.fromCharCode(65+i)}. ${option}</button>`
  ).join("");
  document.querySelectorAll(".answer").forEach(btn => btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.index))));
}

function selectAnswer(selected) {
  if (state.answered) return;
  state.answered = true;
  const item = questions[state.questionIndex];
  const buttons = [...document.querySelectorAll(".answer")];
  buttons.forEach(b => b.disabled = true);
  buttons[item.answer].classList.add("correct");

  if (selected === item.answer) {
    state.score++;
    $("liveScore").textContent = state.score;
    $("feedback").className = "feedback";
    $("feedback").innerHTML = `<strong>✓ Correct!</strong><br>${item.exp}`;
  } else {
    buttons[selected].classList.add("wrong");
    state.wrongModules.push(item.module);
    $("feedback").className = "feedback";
    $("feedback").innerHTML = `<strong>✗ Incorrect.</strong><br>${item.exp}`;
  }
  $("nextBtn").classList.remove("hidden");
}

function nextQuestion() {
  state.questionIndex++;
  if (state.questionIndex >= questions.length) showResults();
  else renderQuestion();
}

function showResults() {
  const total = questions.length;
  const percent = Math.round(state.score / total * 100);
  const grade = percent >= 80 ? "A" : percent >= 70 ? "B" : percent >= 60 ? "C" : percent >= 50 ? "D" : "F";
  $("finalGrade").textContent = grade;
  $("finalScore").textContent = `${state.score}/${total}`;
  $("finalPercent").textContent = `${percent}%`;
  $("resultMessage").textContent =
    percent >= 80 ? "Excellent work! You have a strong understanding of the basics."
    : percent >= 60 ? "Good progress. Review the recommended topics and try again."
    : "Keep practicing. Focus on the recommended modules before retaking the quiz.";

  const counts = {};
  state.wrongModules.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const recommended = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  $("recommendations").innerHTML = recommended.length
    ? recommended.map(([id, count]) => {
        const m = modules.find(x => x.id === id);
        return `<div class="recommendation"><strong>${m.icon} ${m.title}</strong><span>You missed ${count} question${count > 1 ? "s" : ""} from this module. Review its notes before trying again.</span></div>`;
      }).join("")
    : `<div class="recommendation"><strong>🎉 No review modules needed.</strong><span>You answered every question correctly.</span></div>`;

  $("progressBar").style.width = "100%";
  showView("results");
}

document.querySelectorAll(".nav-btn").forEach(btn => btn.addEventListener("click", () => {
  if (btn.dataset.view === "quiz") startQuiz();
  else showView(btn.dataset.view);
}));
$("startQuizBtn").addEventListener("click", startQuiz);
$("nextBtn").addEventListener("click", nextQuestion);
$("retryBtn").addEventListener("click", startQuiz);

renderModules();
