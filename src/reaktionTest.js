const entryScreen = document.getElementById("entry-screen");
const actionButtons = document.querySelectorAll(".actions button");
const measurement = document.querySelector(".measurement");

function start() {
  entryScreen.innerHTML = "<p>get ready . . .</p>";
  entryScreen.style.background = "rgb(56, 173, 56)";

  const randNum = Math.floor(Math.random() * 6) + 3;
  let count = 1;

  var countdown = setInterval(() => {
    if (count === randNum) {
      clearInterval(countdown);
      entryScreen.style.display = "none";
      startTimer();
    }

    count++;
  }, 1000);
}

const timer = document.getElementById("timer");

var startTime, interval, elapsedTime;

function startTimer() {
  startTime = Date.now();

  interval = setInterval(function () {
    elapsedTime = Date.now() - startTime;
    timer.innerHTML = elapsedTime;

    if (elapsedTime > 1000) {
      timer.innerHTML = (elapsedTime / 1000).toFixed(1);
      measurement.innerHTML = "s";
    }
  }, 100);
}

function checkTime() {
  if (elapsedTime > 0) {
    clearInterval(interval);
  }

  actionButtons.forEach((button) => {
    button.style.opacity = "1";
    button.style.pointerEvents = "all";
  });
}

function reset() {
  interval = undefined;
  startTime = 0;
  elapsedTime = 0;

  timer.innerHTML = "0";

  entryScreen.style.display = "block";
  entryScreen.innerHTML = "Click when you're ready";

  actionButtons.forEach((button) => {
    button.style.opacity = "0";
    button.style.pointerEvents = "none";
  });

  measurement.innerHTML = "ms";
}

function save() {
  location.href = "./register.html";
}
