import {
  getDatabase,
  get,
  remove,
  set,
  update,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import { app } from "/app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

let currentWeekOffset = 0;
const maxWeeks = 4;

document.addEventListener("DOMContentLoaded", async () => {
  document
    .querySelector(".back-to-leaderboard")
    .addEventListener("click", () => (location.href = "leaderboard.html"));

  const userID = userCreds.uid;
  const userDisplay = document.querySelector(".username-display");
  const ageDisplay = document.querySelector(".age-display");
  userDisplay.innerHTML = userObj.username;
  ageDisplay.innerHTML = userObj.age ? userObj.age : "";

  const backToUser = document.querySelector(".back-to-user");

  backToUser.addEventListener("click", () => {
    globalUserId = userCreds.uid;
    globalUsername = userObj.username;

    readUserData();
  });

  document
    .querySelector("#play-again")
    .addEventListener("click", () => (location.href = "index.html"));

  const datesSnapshot = await get(child(ref(db), "scores/" + userID));
  const allDatesObj = datesSnapshot.val();
  const allDates = Object.keys(allDatesObj);

  for (let i = 0; i < allDates.length; i++) {
    const currDate = new Date();
    const priorDate = new Date(
      new Date().setDate(currDate.getDate() - maxWeeks * 7)
    );

    if (new Date(allDates[i]) < priorDate) {
      const dateRef = child(ref(db), `scores/${userID}/${allDates[i]}`);
      const dateSnapshot = await get(dateRef);

      await remove(dateRef);
    }
  }

  const prevWeekBtn = document.createElement("i");
  prevWeekBtn.classList.add("fa-solid");
  prevWeekBtn.classList.add("fa-caret-left");

  const nextWeekBtn = document.createElement("i");
  nextWeekBtn.classList.add("fa-solid");
  nextWeekBtn.classList.add("fa-caret-right");

  const buttonContainer = document.querySelector("#button-container");

  buttonContainer.appendChild(prevWeekBtn);
  buttonContainer.appendChild(nextWeekBtn);

  prevWeekBtn.addEventListener("click", () => {
    if (currentWeekOffset < maxWeeks - 1) {
      currentWeekOffset++;
      readUserData();
    }
  });

  nextWeekBtn.addEventListener("click", () => {
    if (currentWeekOffset > 0) {
      currentWeekOffset--;
      readUserData();
    }
  });

  let globalUserId = userCreds.uid;
  let globalUsername = userObj.username;

  async function readUserData() {
    document.querySelector(".offset").innerHTML = currentWeekOffset + 1;
    document.querySelector(".max-weeks").innerHTML = maxWeeks;

    userDisplay.innerHTML = globalUsername;

    if (userDisplay.innerHTML === userObj.username) {
      userDisplay.innerHTML += " (you)";
      backToUser.innerHTML = "";
      ageDisplay.innerHTML = userObj.age ? userObj.age : "";
    } else {
      backToUser.innerHTML = "Back to You";
      ageDisplay.innerHTML = "";
    }

    const today = new Date();
    today.setDate(today.getDate() - currentWeekOffset * 7);
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - 6 + i);

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateString = `${year}-${month}-${day}`;

      dates.push(dateString);
    }

    const userScoresAllTime = {};

    for (const date of dates) {
      const snapshot = await get(
        child(ref(db), "scores/" + globalUserId + "/" + date)
      );

      userScoresAllTime[date] = snapshot.val() || [];
    }

    buildTable(userScoresAllTime);
  }

  function buildTable(data) {
    const tableBody = document.querySelector(".mytable");
    tableBody.innerHTML = "";

    let weeklyAverageScores = [];
    let weekDates = [];

    const weekData = Object.entries(data);
    console.log(weekData);

    createDayChart(weekData);

    for (const [date, values] of Object.entries(data)) {
      if (filterArray === null) return;

      var filterArray = values.splice(0, 1);

      while (values.length <= 9) {
        values.push("");
      }

      while (values.length > 9) {
        values.splice(9, 1);
      }

      const valuesSum = values.reduce((partialSum, a) => partialSum + a, 0);
      const filterNums = values.filter(Number);

      const average = Math.floor(valuesSum / filterNums.length);
      weeklyAverageScores.push(average ? average : 0);
      weekDates.push(date);

      const tableHTML = `
        <div class="column">
          <div class="row row-header" id="${date}">${date}</div>
          ${values.map((v) => `<div class="row">${v}</div>`).join("")}
          <div class="row average">Ø ${average ? average : "keine Daten"}</div>
        </div>
      `;

      tableBody.innerHTML += tableHTML;
    }

    createChart(weeklyAverageScores, weekDates);
  }

  readUserData();

  function searchUser(username) {
    const allUsers = JSON.parse(sessionStorage.getItem("all-users"));
    const userID = Object.keys(allUsers).find(
      (key) => allUsers[key].username === username
    );

    currentWeekOffset = 0;

    globalUserId = userID;
    globalUsername = username;

    readUserData(userID);
  }

  const searUserInp = document.querySelector("#search-user");
  const searchUserOutput = document.querySelector(".search-output-table");

  searUserInp.addEventListener("keyup", async () => {
    searchUserOutput.innerHTML = "";

    var inputVal = searUserInp.value;

    const allUsers = JSON.parse(sessionStorage.getItem("all-users"));
    const allUsersArray = Object.values(allUsers);

    var filteredUsers = [];

    for (let i = 0; i < allUsersArray.length; i++) {
      inputVal = inputVal.toLowerCase();
      var username = allUsersArray[i].username.toLowerCase();

      if (username.includes(inputVal) && filteredUsers.length < 5) {
        filteredUsers.push(allUsersArray[i].username);
      }
    }

    for (let i = 0; i < filteredUsers.length; i++) {
      searchUserOutput.style.display = "block";

      var outputItems = document.createElement("div");
      outputItems.className = "usernames";
      outputItems.innerHTML = `
        ${filteredUsers[i]}
        <div class="line"></div>
      `;

      outputItems.addEventListener("click", () => {
        searchUser(filteredUsers[i]);

        searUserInp.value = "";
        searchUserOutput.style.display = "none";
      });

      searchUserOutput.appendChild(outputItems);
    }

    if (inputVal === "" || filteredUsers.length < 1) {
      searchUserOutput.innerHTML = "";
      searchUserOutput.style.display = "none";
    }
  });

  const ctx = document.getElementById("myChart").getContext("2d");
  var chart = new Chart(ctx, {});

  function createChart(weekData, weekDates) {
    chart.destroy();

    chart = new Chart(ctx, {
      type: "line",

      data: {
        labels: weekDates,
        datasets: [
          {
            label: "week",
            data: weekData,
            borderWidth: 1,
            borderJoinStyle: "round",
            backgroundColor: "rgba(136, 8, 8, 0.4)",
            borderColor: "rgb(136, 8, 8)",
            fill: true,
            lineTension: 0.2,
            spanGaps: true,
            pointBackgroundColor: "rgb(136, 8, 8)",
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Ø Average",
            },
          },
        },
      },
    });
  }

  const ctxDay = document.getElementById("myChartDay").getContext("2d");
  var chartDay = new Chart(ctxDay, {});

  function createDayChart(weekData) {
    chartDay.destroy();

    var darkColors = [
      "#FFA420",
      "#240209",
      "#033a29",
      "#57A639",
      "#ED760E",
      "#1C542D",
      "#49678D",
    ];

    chartDay = new Chart(ctxDay, {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        datasets: weekData.map((day, i) => {
          // * converts empty indexes to zeros (bug fix)

          const noString = day[1].filter((num) => {
            isNaN(num);
            return num;
          });

          if (noString.length !== 9) {
            while (noString.length < 9) {
              noString.push(0);
            }
          }

          return {
            label: day[0],
            data: noString,
            borderWidth: 1,
            borderJoinStyle: "round",
            backgroundColor: darkColors[i] + "40",
            borderColor: darkColors[i],
            fill: true,
            lineTension: 0.2,
            spanGaps: true,
            pointBackgroundColor: darkColors[i],
            responsiv: true,
          };
        }),
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Score",
            },
          },
        },
      },
    });
  }
});
