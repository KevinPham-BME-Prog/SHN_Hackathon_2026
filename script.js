let currentQuestion = 0;
let score = 0;
let questions = [];

fetch("questions.json")
  .then(response => response.json())
  .then(data => {
    questions = data;
    loadQuestion();
  });

function loadQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question").textContent = q.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.onclick = () => selectAnswer(index);
    choicesDiv.appendChild(btn);
  });
  
  updateProgress();
}

function selectAnswer(index) {
  if (index === questions[currentQuestion].answer) {
    score++;
  }
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    document.getElementById("quiz").innerHTML =
      `<h2>Quiz Finished</h2><p>Your score: ${score}/${questions.length}</p>`;
  }
}

function updateProgress() {
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("progressText").textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
}
