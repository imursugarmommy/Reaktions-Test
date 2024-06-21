const entryScreen = document.getElementById("entry-screen");
const waitScreen = document.getElementById("wait-screen");
const stopScreen = document.getElementById("stop-screen");

const actionButtons = document.querySelectorAll(".actions button");
const measurement = document.querySelector(".measurement");

var startTime, interval, elapsedTime;
const timer = document.getElementById("timer");

const formContainer = document.querySelector(".container");

let gameEnd = false;

const adminList = ["levi.besch@gmail.com", "etifri2007@web.de"];

if (window.location.pathname === "/docs/index.html") {
  const loggedInInfo = document.querySelector(".logged-in-info");
  const username = document.querySelector(".username-display");
  loggedInInfo.style.opacity = 0;

  const sessionStorageInfo = JSON.parse(sessionStorage.getItem("user-info"));

  if (sessionStorageInfo) {
    loggedInInfo.style.opacity = "1";
    username.innerHTML = sessionStorageInfo.username;
  }
}

function earlyStop() {
  window.location.reload();
  reset();
}

function start() {
  var audio = new Audio("Reaktions-Test/assets/wait-sound.wav");
  audio.play();

  waitScreen.style.zIndex = "12";

  const randNum = Math.floor(Math.random() * 6) + 3;
  let count = 1;

  var countdown = setInterval(() => {
    if (count === randNum) {
      clearInterval(countdown);
      waitScreen.style.zIndex = "0";
      stopScreen.style.zIndex = "12";

      startTimer();

      audio.pause();
    }

    count++;
  }, 1000);
}

function startTimer() {
  var audio = new Audio("Reaktions-Test/assets/start-sound2.wav");
  audio.play();

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
  var audio = new Audio("Reaktions-Test/assets/stop-sound.wav");

  if (!gameEnd) audio.play();

  gameEnd = true;

  actionButtons.forEach((button) => {
    button.style.opacity = "1";
    button.style.pointerEvents = "all";
  });
}

function reset() {
  if (window.location.pathname !== "/src/index.html")
    location.href = "./index.html";

  interval = undefined;
  startTime = 0;
  elapsedTime = 0;

  gameEnd = false;

  timer.innerHTML = "0";

  entryScreen.style.zIndex = "10";
  waitScreen.style.zIndex = "0";
  stopScreen.style.zIndex = "0";

  actionButtons.forEach((button) => {
    button.style.opacity = "0";
    button.style.pointerEvents = "none";
  });

  measurement.innerHTML = "ms";
}

function save() {
  localStorage.setItem("score", elapsedTime);
  const stringifiedUserObj = sessionStorage.getItem("user-info");
  const stringifieduserCreds = sessionStorage.getItem("user-creds");

  if (stringifiedUserObj !== null) {
    const userObj = JSON.parse(stringifiedUserObj);
    const userCreds = JSON.parse(stringifieduserCreds);

    writeUserData(
      userObj.email,
      userCreds.uid,
      userObj.username,
      userObj.highscore,
      elapsedTime,
      userObj.date,
      userObj.age,
      userObj.projectIdentifier
    );

    return;
  }

  formContainer.style.zIndex = "200";
}

function closePopup() {
  const forms = document.querySelectorAll(".container form");
  const login = document.querySelector("#login");

  forms.forEach((form) => {
    form.classList.add("form--hidden");
  });

  login.classList.remove("form--hidden");

  formContainer.style.width = "400px";
  formContainer.style.zIndex = "-10";
}

async function writeUserData(
  email,
  userID,
  username,
  highscore,
  score,
  date,
  age,
  identifier
) {
  const dateFunc = new Date();
  const day = dateFunc.getDate();
  const month = dateFunc.getMonth() + 1;
  const year = dateFunc.getFullYear();

  const currDate = `${year}-${month}-${day}`;

  await new Promise((resolve) => {
    sessionStorage.setItem(
      "user-info",
      JSON.stringify({
        username: username,
        email: email,
        score: score,
        highscore: score < highscore ? score : highscore,
        date: score < highscore ? currDate : date,
        age: age,
        projectIdentifier: identifier,
        admin: adminList.includes(email.toLowerCase()) ? true : false,
      })
    );
    resolve();
  }).then(() => {
    // location.href = "./leaderboard.html";
  });
}
