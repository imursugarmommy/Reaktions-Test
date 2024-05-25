// * Realtime db to array
// https://youtu.be/AjSFVeUE-zo?si=QkLm1zcIyecRA2QU

import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));

document.querySelector(".username-display").innerHTML = userObj.username;
document.querySelector(".score-display").innerHTML = userObj.score + " ms";
document.querySelector(".highscore-display").innerHTML =
  userObj.highscore + " ms";

get(child(ref(db), "users/")).then((snapshot) => {
  sessionStorage.setItem("all-users", JSON.stringify(snapshot.val()));
});

const allUserObj = JSON.parse(sessionStorage.getItem("all-users"));
const allUserArray = Object.values(allUserObj);

let sortedByNum;

filterByScore();

const searchInp = document.getElementById("search-input");

searchInp.addEventListener("keyup", () => {
  var inputVal = searchInp.value;

  var data = searchTable(inputVal, sortedByNum);

  buildTable(data);
});

function searchTable(value, data) {
  var table = document.querySelector(".mytable");
  table.style.display = "flex";

  var filteredData = [];

  for (let i = 0; i < data.length; i++) {
    value = value.toLowerCase();
    var username = data[i].username.toLowerCase();

    if (username.includes(value)) {
      filteredData.push(data[i]);
    }
  }

  if (filteredData.length === 0) {
    table.style.display = "none";
  }

  return filteredData;
}

function buildTable(data) {
  var table = document.querySelector(".mytable");
  table.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    var row = `
    <div class="row">
      <div class="col left">${i + 1}</div>
      <div class="col middle">${data[i].username}</div>
      <div class="col right">${data[i].highscore}</div>
      <div class="col right-edge">${data[i].date}</div>
    </div>
    `;
    table.innerHTML += row;
  }
}

function filterByDate() {
  const sortedByDate = allUserArray.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  buildTable(sortedByDate);
}

function filterByScore() {
  sortedByNum = allUserArray.sort(function (a, b) {
    return a.score - b.score;
  });

  buildTable(sortedByNum);
}

// manages sorting Funtion on click of the filter Arrow
const sortHighscoreBtn = document.querySelector("#sortHighscore");
const sortDateBtn = document.querySelector("#sortDate");

sortHighscoreBtn.addEventListener("click", filterByScore);
sortDateBtn.addEventListener("click", filterByDate);

sortHighscoreBtn.addEventListener("click", () => {
  let clicked = sortHighscoreBtn.getAttribute("data-clicked");

  if (clicked === "true") {
    sortHighscoreBtn.setAttribute("data-clicked", "false");
    sortHighscoreBtn.style.rotate = "180deg";

    sortDateBtn.setAttribute("data-clicked", "true");
    sortDateBtn.style.rotate = "180deg";

    filterByDate();
  } else if (clicked === "false") {
    sortHighscoreBtn.setAttribute("data-clicked", "true");
    sortHighscoreBtn.style.rotate = "0deg";

    sortDateBtn.setAttribute("data-clicked", "false");
    sortDateBtn.style.rotate = "0deg";
  }
});

sortDateBtn.addEventListener("click", () => {
  let clicked = sortDateBtn.getAttribute("data-clicked");

  if (clicked === "true") {
    sortHighscoreBtn.setAttribute("data-clicked", "true");
    sortHighscoreBtn.style.rotate = "0deg";

    sortDateBtn.setAttribute("data-clicked", "false");
    sortDateBtn.style.rotate = "0deg";

    filterByScore();
  } else if (clicked === "false") {
    sortHighscoreBtn.setAttribute("data-clicked", "false");
    sortHighscoreBtn.style.rotate = "180deg";

    sortDateBtn.setAttribute("data-clicked", "true");
    sortDateBtn.style.rotate = "180deg";
    filterByDate();
  }
});
