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

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".save");

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const currDate = `${year}-${month}-${day}`;

  const forms = document.querySelectorAll(".container form");
  const documentation = document.querySelector("#documentation");
  const login = document.querySelector("#login");
  const container = document.querySelector(".container");

  const documentationBtn = document.querySelector("#login-continue-btn");

  saveBtn.addEventListener("click", () => {
    if (userObj === null) {
      forms.forEach((form) => {
        form.classList.add("form--hidden");
        login.classList.remove("form--hidden");

        container.style.zIndex = 200;
      });

      return;
    }

    get(ref(db, "scores/" + userCreds.uid + "/" + currDate)).then(
      (snapshot) => {
        if (snapshot.exists()) {
          const scores = snapshot.val();
          scores.splice(0, 1);

          if (scores.length === 8) {
            forms.forEach((form) => {
              form.classList.add("form--hidden");
            });
            documentationBtn.style.display = "block";
            documentation.classList.remove("form--hidden");

            container.style.zIndex = 200;

            return;
          } else location.href = "leaderboard.html";
        }
      }
    );
  });
});
