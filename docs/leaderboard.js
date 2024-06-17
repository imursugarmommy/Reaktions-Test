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

import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

const adminList = ["levi.besch@gmail.com", "etifri2007@web.de"];

const popup = document.querySelector(".popup");
const popupOpener = document.querySelector("#popup-opener");

function adminCheck() {
  console.log(userObj);
  const adminTaps = document.querySelector(".admin-taps");

  if (userObj.admin) {
    adminTaps.style.display = "block";
  } else {
    adminTaps.style.display = "none";
  }
}

popupOpener.addEventListener("click", managePopup);

function managePopup() {
  if (userObj === null) return;

  const clicked = popup.getAttribute("data-clicked");

  if (clicked === "true") {
    popup.style.display = "none";
    popup.setAttribute("data-clicked", "false");
  } else if (clicked === "false") {
    popup.style.display = "flex";
    popup.setAttribute("data-clicked", "true");
  }
}

const deleteBtn = document.querySelector("#delete");
const confirmPopup = document.querySelector(".confirm-popup");

deleteBtn.addEventListener("click", (e) => {
  if (e.target === confirmBtn || e.target === cancelBtn) return;

  confirmPopup.style.display = "flex";
});

const confirmBtn = document.querySelector("#yes");
const cancelBtn = document.querySelector("#no");

confirmBtn.addEventListener("click", deleteAcc);
cancelBtn.addEventListener("click", () => {
  confirmPopup.style.display = "none";
});

async function deleteAcc() {
  const reference = await child(ref(db), "users/" + userCreds.uid);
  const snapshot = await get(reference);

  await remove(reference);

  const referenceScore = await child(ref(db), "scores/" + userCreds.uid);
  const snapshotScore = await get(reference);

  await remove(referenceScore);

  const docRefrence = await child(ref(db), "documentation/" + userCreds.uid);
  const docsSnapshot = await get(reference);

  await remove(docRefrence);

  let user = auth.currentUser;

  await user
    .delete()
    .then(() => {
      console.log("user deleted");
    })
    .catch((error) => {
      console.log("not working");
    });

  logout();
}

window.addEventListener("click", (e) => {
  if (
    popup.contains(e.target) ||
    deleteBtn.contains(e.target) ||
    e.target === popupOpener ||
    profilePopup.style.display === "flex"
  ) {
    return;
  }

  if (popup.style.display === "none" || popup.style.display === "") return;

  managePopup();
});

const manageUserBtn = document.getElementById("logout-btn");
const manageProfileBtn = document.getElementById("profile-btn");

const profilePopup = document.querySelector(".profile-popup");

const changeUsername = document.getElementById("change-username");
const changeAge = document.getElementById("change-age");
const changeIdentifier = document.getElementById("change-identifier");

const saveChangesBtn = document.getElementById("done");

const deleteUsernameInput = document.getElementById("remove-username");
const deleteAgeInput = document.getElementById("remove-age");
const deleteIdentifierInput = document.getElementById("remove-identifier");

const cancelChanges = document.getElementById("cancel-popup");

deleteUsernameInput.addEventListener(
  "click",
  () => (changeUsername.value = "")
);
deleteAgeInput.addEventListener("click", () => (changeAge.value = ""));
deleteIdentifierInput.addEventListener(
  "click",
  () => (changeIdentifier.value = "")
);

profilePopup.addEventListener("submit", (e) => {
  e.preventDefault();
});

manageProfileBtn.addEventListener(
  "click",
  () => (profilePopup.style.display = "flex")
);

cancelChanges.addEventListener("click", () => {
  changeUsername.value = userObj.username;
  changeAge.value = userObj.age ? userObj.age : "";
  changeIdentifier.value = userObj.projectIdentifier
    ? userObj.projectIdentifier
    : "";

  profilePopup.style.display = "none";
});

saveChangesBtn.addEventListener("click", async () => {
  const reference = await ref(db, "users/" + userCreds.uid);

  Object.assign(userObj, {
    age: changeAge.value,
    projectIdentifier:
      changeIdentifier.value === "jufoSK11" ? changeIdentifier.value : "",
  });

  sessionStorage.setItem("user-info", JSON.stringify(userObj));

  update(reference, {
    username: changeUsername.value,
    age: changeAge.value,
    projectIdentifier:
      changeIdentifier.value === "jufoSK11" ? changeIdentifier.value : "",
  });

  if (changeIdentifier.value !== "jufoSK11") {
    changeIdentifier.value = "";
  }

  profilePopup.style.display = "none";
});

if (userObj !== null) {
  document.querySelector(".username-display").innerHTML = userObj.username;
  document.querySelector(".score-display").innerHTML = userObj.score + " ms";
  document.querySelector(".highscore-display").innerHTML =
    userObj.highscore + " ms";
  manageUserBtn.addEventListener("click", logout);

  changeUsername.value = userObj.username;
  changeAge.value = userObj.age ? userObj.age : "";
  changeIdentifier.value = userObj.projectIdentifier
    ? userObj.projectIdentifier
    : "";
} else {
  document.querySelector(".username-display").innerHTML =
    "Play a game to login";
  document.querySelector(".scores").style.display = "none";
  document.querySelector("#play-again").innerHTML = "Play Game";

  document.querySelector(".popup").style.display = "none";
}

function logout() {
  sessionStorage.removeItem("user-info");
  sessionStorage.removeItem("user-creds");
  sessionStorage.removeItem("userScoresToday");
  sessionStorage.removeItem("userScoresAllTime");

  location.href = "index.html";
}

// * fixes the reentries of score when reloaded
window.addEventListener("beforeunload", () => {
  localStorage.removeItem("score");
});

async function writeUserData(
  username,
  email,
  score,
  highscore,
  date,
  userID,
  age,
  projectIdentifier
) {
  const reference = ref(db, "users/" + userID);
  const confirmedAge = age ? age : "";
  const confirmedIdentifier = projectIdentifier ? projectIdentifier : "";

  await set(reference, {
    username,
    email,
    score,
    highscore,
    date,
    age: confirmedAge,
    projectIdentifier: confirmedIdentifier,
    admin: adminList.includes(email) ? true : false,
  });
}

async function writeNewScore(userID, score, username) {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const currDate = `${year}-${month}-${day}`;

  // * user Refernce per userID
  const referenceUser = ref(db, "scores/" + userID);
  const userSnapshot = await get(referenceUser);

  // * alle user Scores verpackt in object mit deren datum

  // * alle user Scores von dem heutigen Tag
  const referenceUserScoresToday = ref(
    db,
    "scores/" + userID + "/" + currDate + "/"
  );
  const dailySnapshot = await get(referenceUserScoresToday);

  const userScoreTodayObj = dailySnapshot.val();
  const userScoreTodayArray =
    userScoreTodayObj === null ? [] : Object.values(userScoreTodayObj);
  const scoreAmountToday = userScoreTodayArray.length;

  await update(referenceUserScoresToday, {
    [scoreAmountToday + 1]: score,
  });
}

async function updateAllUsers() {
  if (!userObj) return;

  adminCheck();

  writeUserData(
    userObj.username,
    userObj.email,
    userObj.score,
    userObj.highscore,
    userObj.date,
    userCreds.uid,
    userObj.age,
    userObj.projectIdentifier
  );

  const score = JSON.parse(localStorage.getItem("score"));

  if (score === null) return;

  writeNewScore(userCreds.uid, userObj.score, userObj.username);
}

updateAllUsers().then(async () => {
  const snapshot = await get(child(ref(db), "users/"));
  const allUserObj = snapshot.val();
  const allUserArray = Object.values(allUserObj);

  let pages = Math.floor(allUserArray.length / 5 + 1);
  let currPage = 1;
  let currIndex = (currPage - 1) * 5;

  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const currPageHTML = document.getElementById("curr-page");
  const maxPageHTML = document.getElementById("max-page");

  const toUserBtn = document.getElementById("to-user");

  // ! check if redisplay after login
  if (userObj === null) {
    toUserBtn.style.display = "none";
  }

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
    } else if (sortDateBtn.getAttribute("data-clicked") === "true") {
      buildTable(sortedByDate);
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
    } else if (sortDateBtn.getAttribute("data-clicked") === "true") {
      buildTable(sortedByDate);
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
      let rowClass = "";

      if (userObj !== null) {
        rowClass = user.username === userObj.username ? "highlight-row" : "";
      }

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
