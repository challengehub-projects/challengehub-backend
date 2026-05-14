let time = 600; // 10 minutes
const timerEl = document.getElementById('time');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('examForm');
const confirmBox = document.getElementById('confirmBox');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

function updateTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  if (time <= 0) {
    clearInterval(timerInterval);
    form.submit();
  }
  time--;
}

const timerInterval = setInterval(updateTimer, 1000);

// Submit button
submitBtn.addEventListener('click', () => {
  confirmBox.style.display = 'block';
});

confirmYes.addEventListener('click', () => {
  form.submit();
});

confirmNo.addEventListener('click', () => {
  confirmBox.style.display = 'none';
});

// Navigation buttons (optional enhancement)
let currentQuestion = 0;
const questions = document.querySelectorAll('.question');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function showQuestion(index) {
  questions.forEach((q, i) => {
    q.style.display = i === index ? 'block' : 'none';
  });
}

prevBtn.addEventListener('click', () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(currentQuestion);
  }
});

showQuestion(currentQuestion); // Show first question by default
