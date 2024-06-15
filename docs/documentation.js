import {
  getDatabase,
  child,
  remove,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

document.addEventListener("DOMContentLoaded", () => {
  const date = new Date();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let today = date.getDate();

  const username = document.querySelector(".username-display");
  const age = document.querySelector(".age-display");
  const datesWrapper = document.querySelector(".dates");
  const monthHTML = document.querySelector(".month-display");
  const yearHTML = document.querySelector(".year");
  const datesHTML = document.querySelectorAll(".dates button");
  const arrowLeft = document.querySelector(".arrow-left");
  const arrowRight = document.querySelector(".arrow-right");

  username.innerHTML = userObj.username;
  age.innerHTML = userObj.age ? userObj.age : "";

  async function updateCalendar() {
    const loader = document.querySelector(".load-wrapper");
    const dateDisplay = document.querySelector(".date-display");
    dateDisplay.innerHTML = `
      <svg
        class="container"
        viewBox="0 0 40 40"
        height="40"
        width="40"
      >
        <circle 
          class="track"
          cx="20" 
          cy="20" 
          r="17.5" 
          pathlength="100" 
          stroke-width="5px" 
          fill="none" 
        />
        <circle 
          class="car"
          cx="20" 
          cy="20" 
          r="17.5" 
          pathlength="100" 
          stroke-width="5px" 
          fill="none" 
        />
      </svg>`;
    loader.style.display = "grid";

    const firstOfMonthInt = new Date(year, month - 1, 1).getDay();
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth =
      new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

    const user = userCreds.uid;

    datesHTML.forEach((day, index) => {
      day.classList.remove("today", "within-four-weeks", "future");

      if (index >= lastDayOfMonth) {
        day.style.display = "none";
      } else {
        day.style.display = "block";
        if (isCurrentMonth && index + 1 === today) {
          day.classList.add("today");
        }
        if (index + 1 > today && isCurrentMonth) {
          day.classList.add("future");
        }
      }
    });

    for (let index = 0; index < lastDayOfMonth; index++) {
      const newDate = new Date(year, month - 1, index + 1);
      const dayOfMonth = newDate.getDate();
      const monthOfYear = newDate.getMonth() + 1;
      const yearOfYear = newDate.getFullYear();

      let currDate = `${yearOfYear}-${month}-${dayOfMonth}`;

      const reference = ref(db, "scores/" + user + "/" + currDate);
      const snapshot = await get(reference);

      const docReference = ref(db, "documentation/" + user + "/" + currDate);
      const docSnapshot = await get(docReference);

      let average = null;

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.length > 1) {
          data.splice(0, 1);
          const valuesSum = data.reduce((partialSum, a) => partialSum + a, 0);
          average = Math.floor(valuesSum / data.length);
        }
      }

      const dayElement = datesHTML[index];
      dayElement.innerText = dayOfMonth;

      if (average !== null) {
        dayElement.innerHTML += `
          <div class="score">Ø ${average}</div>
          ${
            docSnapshot.exists()
              ? `<div class="popup">
            <div class="state">
              <label for="state">Gefühlsgrad:</label>
              <p>${docSnapshot.val().wellBeing}</p>
            </div>
            <div class="complications">
              <label for="complications">Schwierigkeiten:</label>
              <p>${docSnapshot.val().complications}</p>
            </div>
          </div>`
              : ""
          }
          
        `;
      }

      dayElement.addEventListener("click", async () => {
        currDate = `${year}-${month}-${dayOfMonth}`;

        const newDocReference = ref(
          db,
          "documentation/" + user + "/" + currDate
        );
        const newDocSnapshot = await get(newDocReference);

        const background = document.querySelector(".background");
        const detailedInfo = document.createElement("div");

        if (newDocSnapshot.exists()) {
          background.style.display = "block";

          const info = newDocSnapshot.val();

          detailedInfo.classList.add("detailed-info");
          detailedInfo.innerHTML = `
        <form
        class="form">
        <div class="safety"></div>
        
        <h1 class="form__title">Documentation - Recap</h1>

        <div
          class="form__input-group"
          id="documentation-time-group">
          <div
            class="form__input"
            id="documentation-time">
            ${info.date}
          </div>
          <i
            class="fa-solid fa-arrows-rotate"
            id="time-refresh"></i>
        </div>
        <div class="wellness">
          <h2>Wie fühlen sie sich heute?</h2>
          <div class="form__checkbox-group">
            <input
              type="radio"
              class="form__input-checkbox"
              name="well-being"
              value="gut"
              ${info.wellBeing === "gut" ? "checked" : ""} />
            <label for="documentation-checkbox-gut">Gut</label>
          </div>
          <div class="form__checkbox-group">
            <input
              type="radio"
              class="form__input-checkbox"
              name="well-being"
              value="ok" 
              ${info.wellBeing === "ok" ? "checked" : ""}/>
            <label for="documentation-checkbox-ok">Ok</label>
          </div>
          <div class="form__checkbox-group">
            <input
              type="radio"
              class="form__input-checkbox"
              name="well-being"
              value="neutral" 
              ${info.wellBeing === "neutral" ? "checked" : ""}/>
            <label for="documentation-checkbox-neutral">Neutral</label>
          </div>
          <div class="form__checkbox-group">
            <input
              type="radio"
              class="form__input-checkbox"
              name="well-being"
              value="schlecht" 
              ${info.wellBeing === "schlecht" ? "checked" : ""}/>
            <label for="documentation-checkbox-schlecht">Schlecht</label>
          </div>
          <div class="form__checkbox-group">
            <input
              type="radio"
              class="form__input-checkbox"
              name="well-being"
              value="sehr schlecht" 
              ${info.wellBeing === "sehr schlecht" ? "checked" : ""}/>
            <label for="documentation-checkbox-sehr-schlecht">Sehr schlecht</label>
          </div>
          <div class="form__textarea-group">
            <textarea
              name="comment"
              id="documentation-wellness-comment"
              placeholder="Others">${info.wellBeingComment}</textarea>
          </div>
        </div>
        <div class="complications">
          <h2>Komplicationen bei dem Test</h2>
          <div class="form__checkbox-group">
            <input
              type="radio"
              name="complications"
              value="no"
              class="form__input-checkbox"
              ${info.complications === "no" ? "checked" : ""} />
            <label for="documentation-checkbox-no">Nein</label>
          </div>
          <div class="form__checkbox-group">
            <input
              type="radio"
              name="info."
              value="yes"
              class="form__input-checkbox" 
              ${info.complications === "yes" ? "checked" : ""}/>
            <label for="documentation-checkbox-yes">Ja</label>
          </div>
          <div class="form__textarea-group">
            <textarea
              name="comment"
              id="documentation-complications-comment"
              placeholder="Which">${info.complicationsComment}</textarea>
          </div>
        </div>
      </form>
        `;

          if (document.querySelector(".detailed-info") !== null) return;

          document.body.appendChild(detailedInfo);
        }

        window.onclick = (event) => {
          if (event.target === background) {
            document.querySelectorAll(".detailed-info").forEach((element) => {
              document.body.removeChild(element);
            });
            background.style.display = "none";
          }
        };
      });
    }

    loader.style.display = "none";
    dateDisplay.innerHTML = `
      <span class="month-display">${new Date(year, month - 1).toLocaleString(
        "default",
        {
          month: "long",
        }
      )}</span>
      <span class="year">${year}</span>
    `;

    datesHTML[0].style.gridColumn = firstOfMonthInt;
    yearHTML.innerHTML = year;
    monthHTML.innerHTML = new Date(year, month - 1).toLocaleString("default", {
      month: "long",
    });
  }

  arrowLeft.addEventListener("click", () => {
    if (month === date.getMonth()) {
      return;
    }

    if (month === 1) {
      month = 12;
      year--;
    } else {
      month--;
    }
    updateCalendar();
  });

  arrowRight.addEventListener("click", () => {
    if (month === date.getMonth() + 1) {
      return;
    }

    if (month === 12) {
      month = 1;
      year++;
    } else {
      month++;
    }
    updateCalendar();
  });

  async function removeOldDocs() {
    const allDocsRef = ref(db, "documentation/" + userCreds.uid + "/");
    const allDocsSnapshot = await get(allDocsRef);

    if (!allDocsSnapshot.exists()) return;

    const allDocsObj = allDocsSnapshot.val();
    const allDocs = Object.keys(allDocsObj);

    const maxWeeks = 4;

    for (let i = 0; i < allDocs.length; i++) {
      const todayDate = new Date();
      const priorDate = new Date(
        new Date().setDate(todayDate.getDate() - maxWeeks * 7)
      );

      if (new Date(allDocs[i]) < priorDate) {
        const docRef = child(
          ref(db),
          `documentation/${userCreds.uid}/${allDocs[i]}`
        );
        const docSnapshot = await get(docRef);

        await remove(docRef);
      }
    }
  }

  removeOldDocs();

  updateCalendar();
});
