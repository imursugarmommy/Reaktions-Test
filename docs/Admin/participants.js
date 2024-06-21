import {
  getDatabase,
  get,
  set,
  remove,
  update,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import { app, adminList } from "../app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

document.addEventListener("DOMContentLoaded", () => {
  let projectParticipants = [];

  function adminCheck() {
    const adminDisplay = document.querySelector(".no-admin");

    const content = document.querySelector("main");

    if (!userObj) {
      adminDisplay.style.display = "block";
      content.style.display = "none";

      return;
    }

    if (userObj.admin) {
      adminDisplay.style.display = "none";
    } else {
      adminDisplay.style.display = "block";
    }
  }

  adminCheck();

  if (!userObj) return;

  async function readUserData() {
    const snapshot = await get(child(ref(db), "users/"));
    const allUsers = snapshot.val();

    const userID = Object.keys(allUsers).find(
      (key) => allUsers[key].projectIdentifier === "jufoSK11"
    );

    const allUsersArray = Object.values(allUsers);

    for (let i = 0; i < allUsersArray.length; i++) {
      if (allUsersArray[i].projectIdentifier === "jufoSK11") {
        projectParticipants.push(allUsersArray[i]);
      }
    }

    buildTable(projectParticipants);
  }

  const searchInp = document.getElementById("search-input");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const currPageHTML = document.querySelector(".pages-offset");
  const maxPageHTML = document.querySelector(".max-user-pages");
  let currPage = 1;
  let pages;

  function buildTable(data) {
    const tableBody = document.querySelector(".mytable");
    tableBody.innerHTML = "";

    const staticColumn = `
    <div class="column empty">
      <div class="row"></div>
      <div class="row row-header">Email</div>
      <div class="row row-header">Age</div>
      <div class="row row-header">PB</div>
      <div class="row row-header">Status</div>
    </div>
  `;

    tableBody.innerHTML = staticColumn;

    pages = Math.floor(data.length / 4 + 1);

    currPageHTML.innerHTML = currPage;
    maxPageHTML.innerHTML = pages;

    for (let i = 0; i < 4; i++) {
      const dataSet = data[i + (currPage - 1) * 4];

      let tableHTML;

      if (dataSet === undefined) {
        tableHTML = `
        <div class="column empty">
          <div class="row row-header"></div>
          <div class="row"></div>
          <div class="row"></div>
          <div class="row"></div>
          <div class="row"></div>
        </div>
      `;
      } else {
        tableHTML = `
          <div class="column">
            <div class="row row-header" id="${dataSet.username}">${
          dataSet.highlightedUsername || dataSet.username
        }</div>
            <div class="row">${dataSet.highlightedEmail || dataSet.email}</div>
            <div class="row">${dataSet.highlightedAge || dataSet.age}</div>
            <div class="row">${
              dataSet.highlightedHighscore || dataSet.highscore
            }</div>
            <div class="row">${
              dataSet.highlightedAdminStatus ||
              (adminList.includes(dataSet.email.toLowerCase())
                ? "Admin"
                : "User")
            }</div>
          </div>
        `;
      }

      tableBody.innerHTML += tableHTML;
    }
  }

  function highlight(text, value) {
    var lowerText = text.toLowerCase();
    var lowerValue = value.toLowerCase();
    var startIndex = lowerText.indexOf(lowerValue);

    if (startIndex === -1) {
      return text;
    }

    var endIndex = startIndex + value.length;
    return (
      text.substring(0, startIndex) +
      '<span class="highlight">' +
      text.substring(startIndex, endIndex) +
      "</span>" +
      text.substring(endIndex)
    );
  }

  function searchTable(value, data) {
    var filteredData = [];
    value = value.toLowerCase();

    for (let i = 0; i < data.length; i++) {
      var username = data[i].username.toLowerCase();
      var email = data[i].email.toLowerCase();
      var age = data[i].age.toString().toLowerCase();
      var highscore = data[i].highscore.toString().toLowerCase();
      var adminStatus = adminList.includes(data[i].email.toLowerCase())
        ? "admin"
        : "user";

      var match =
        username.includes(value) ||
        email.includes(value) ||
        age.includes(value) ||
        highscore.includes(value) ||
        adminStatus.includes(value);

      if (match) {
        var highlightedUsername = highlight(data[i].username, value);
        var highlightedEmail = highlight(data[i].email, value);
        var highlightedAge = highlight(data[i].age.toString(), value);
        var highlightedHighscore = highlight(
          data[i].highscore.toString(),
          value
        );
        var highlightedAdminStatus = highlight(adminStatus, value);

        filteredData.push({
          ...data[i],
          highlightedUsername: highlightedUsername,
          highlightedEmail: highlightedEmail,
          highlightedAge: highlightedAge,
          highlightedHighscore: highlightedHighscore,
          highlightedAdminStatus: highlightedAdminStatus,
        });
      }
    }

    return filteredData;
  }

  prevPageBtn.addEventListener("click", () => {
    currPage--;
    if (currPage < 1) currPage = 1;
    currPageHTML.innerHTML = currPage;

    if (searchInp.value !== "") {
      var data = searchTable(searchInp.value, projectParticipants);
      buildTable(data);
      return;
    }

    buildTable(projectParticipants);
  });

  nextPageBtn.addEventListener("click", () => {
    currPage++;
    if (currPage > pages) currPage = pages;
    currPageHTML.innerHTML = currPage;

    if (searchInp.value !== "") {
      var data = searchTable(searchInp.value, projectParticipants);
      buildTable(data);
      return;
    }

    buildTable(projectParticipants);
  });

  searchInp.addEventListener("keyup", () => {
    var inputVal = searchInp.value;
    var data = searchTable(inputVal, projectParticipants);

    pages = Math.floor(data.length / 4 + 1);
    currPage = 1;
    currPageHTML.innerHTML = currPage;
    maxPageHTML.innerHTML = pages;

    buildTable(data);
  });

  document.querySelector(".clear-input").addEventListener("click", () => {
    searchInp.value = "";
    buildTable(projectParticipants);
  });

  readUserData();
});
