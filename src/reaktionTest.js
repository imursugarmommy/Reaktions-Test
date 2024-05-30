const entryScreen = document.getElementById("entry-screen");
const actionButtons = document.querySelectorAll(".actions button");
const measurement = document.querySelector(".measurement");

var startTime, interval, elapsedTime;
const timer = document.getElementById("timer");

const formContainer = document.querySelector(".container");
const skipBtn = document.querySelector(".skip");

if (
  window.location.pathname === "/src/index.html" ||
  window.location.pathname === "/src/"
) {
  reset();

  skipBtn.addEventListener("click", () => {
    formContainer.style.zIndex = "-10";
  });

  const loggedInInfo = document.querySelector(".logged-in-info");
  const username = document.querySelector(".username-display");
  loggedInInfo.style.opacity = 0;

  const sessionStorageInfo = JSON.parse(sessionStorage.getItem("user-info"));

  if (sessionStorageInfo) {
    loggedInInfo.style.opacity = "1";
    username.innerHTML = sessionStorageInfo.username;
  }
}

// ? punishment fuer zu frueh druecken
// * um abuser zb rauszufiltern

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
  if (window.location.pathname !== "/src/index.html")
    location.href = "./index.html";

  interval = undefined;
  startTime = 0;
  elapsedTime = 0;

  timer.innerHTML = "0";

  entryScreen.style.display = "block";
  entryScreen.style.backgroundColor = "rgb(255, 139, 43)";
  entryScreen.innerHTML = "Click when you're ready";

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
      userObj.date
    );

    return;
  }

  formContainer.style.zIndex = "200";
}

function closePopup() {
  formContainer.style.zIndex = "-10";
}

async function writeUserData(email, userID, username, highscore, score, date) {
  const dateFunc = new Date();
  const day = dateFunc.getDate();
  const month = dateFunc.getMonth() + 1;
  const year = dateFunc.getFullYear();

  const currDate = `${year}-${month}-${day}`;

  new Promise((resolve) => {
    sessionStorage.setItem(
      "user-info",
      JSON.stringify({
        username: username,
        email: email,
        score: score,
        highscore: score < highscore ? score : highscore,
        date: score < highscore ? currDate : date,
      })
    );
    resolve();
  }).then(() => {
    location.href = "./leaderboard.html";
  });
}
