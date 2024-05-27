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

async function updateAllUsers() {
  const snapshot = await get(child(ref(db), "users/"));
  sessionStorage.setItem("all-users", JSON.stringify(snapshot.val()));
}

updateAllUsers().then(() => {
  const allUserObj = JSON.parse(sessionStorage.getItem("all-users"));
  const allUserArray = Object.values(allUserObj);

  let pages = Math.floor(allUserArray.length / 5 + 1);
  let currPage = 1;
  let currIndex = (currPage - 1) * 5;

  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const currPageHTML = document.getElementById("curr-page");
  const maxPageHTML = document.getElementById("max-page");

  const toUserBtn = document.getElementById("to-user");

  // * gets you to your own score
  toUserBtn.addEventListener("click", () => {
    var indexUser = sortedByNum
      .map(function (e) {
        return e.username;
      })
      .indexOf(userObj.username);

    var placeUser = indexUser + 1;

    currPage = Math.floor((placeUser + 5) / 5);
    currIndex = (currPage - 1) * 5;
    currPageHTML.innerHTML = currPage;

    buildTable(sortedByNum);

    const userRow = document.getElementById("highlight-row");

    userRow.style.animation = "light-up 3s ease .5s";
  });

  maxPageHTML.innerHTML = pages;
  currPageHTML.innerHTML = currPage;

  prevPageBtn.addEventListener("click", () => {
    currPage--;
    if (currPage < 1) currPage = 1;
    currIndex = (currPage - 1) * 5;
    currPageHTML.innerHTML = currPage;

    if (searchInp.value !== "") {
      var data = searchTable(searchInp.value, sortedByNum);

      buildTable(data);
      return;
    }

    buildTable(sortedByNum);
  });

  nextPageBtn.addEventListener("click", () => {
    currPage++;
    if (currPage > pages) currPage = pages;
    currIndex = (currPage - 1) * 5;
    currPageHTML.innerHTML = currPage;

    if (searchInp.value !== "") {
      var data = searchTable(searchInp.value, sortedByNum);

      buildTable(data);
      return;
    }

    buildTable(sortedByNum);
  });

  let sortedByNum;
  let sortedByDate;
  let originalIndices;

  filterByScore();

  const searchInp = document.getElementById("search-input");

  searchInp.addEventListener("keyup", () => {
    var inputVal = searchInp.value;

    var data = searchTable(inputVal, sortedByNum);

    pages = Math.floor(data.length / 5 + 1);
    currPage = 1;
    currIndex = (currPage - 1) * 5;

    maxPageHTML.innerHTML = pages;
    currPageHTML.innerHTML = currPage;

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

    let listLength =
      data.length - currPage * 5 < 0 ? data.length - (currPage - 1) * 5 : 5;

    for (let i = currIndex; i < currIndex + listLength; i++) {
      const user = data[i];
      const rowClass =
        user.username === userObj.username ? "highlight-row" : "";

      var row = `
        <div class="row ${rowClass}" id="${rowClass}">
          <div class="col left">${originalIndices[data[i].username]}</div>
          <div class="col middle">${data[i].username}</div>
          <div class="col right js-col-right">${data[i].highscore}</div>
          <div class="col right-edge js-col-right-edge">${data[i].date}</div>
        </div>
        `;
      table.innerHTML += row;
    }

    // * fills gaps to the bottom of the list so it doesnt look empty :)
    if (listLength < 5) {
      for (let i = 0; i < 5 - listLength; i++) {
        var emptyRow = `
        <div class="row">
          <div class="col left">${allUserArray.length + i + 1}</div>
          <div class="col middle"></div>
          <div class="col right js-col-right"></div>
          <div class="col right-edge js-col-right-edge"></div>
        </div>
      `;
        table.innerHTML += emptyRow;
      }
    }
  }

  function filterByDate() {
    sortedByDate = [...allUserArray].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    buildTable(sortedByDate);
  }

  function filterByScore() {
    sortedByNum = [...allUserArray].sort((a, b) => a.highscore - b.highscore);

    // ? idek what is going on here, its from chatGPT and it works so i wont touch it
    // * part of code, where it keeps the index each player gets from
    // * their score rating, when sorted by date
    originalIndices = sortedByNum.reduce((acc, user, index) => {
      acc[user.username] = index + 1;
      return acc;
    }, {});

    buildTable(sortedByNum);
  }

  const sortDateBtn = document.querySelector("#sortDate");

  sortDateBtn.addEventListener("click", () => {
    let clicked = sortDateBtn.getAttribute("data-clicked");

    if (clicked === "true") {
      sortDateBtn.setAttribute("data-clicked", "false");
      sortDateBtn.style.rotate = "0deg";
      filterByScore();
    } else {
      sortDateBtn.setAttribute("data-clicked", "true");
      sortDateBtn.style.rotate = "180deg";
      filterByDate();
    }
  });
});
