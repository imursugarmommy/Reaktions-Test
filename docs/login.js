import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  get,
  set,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#login-btn");
  const documentationBtn = document.querySelector("#login-continue-btn");

  const loginForm = document.querySelector("#login");
  const documentationForm = document.querySelector("#documentation");

  loginBtn.addEventListener("click", loginRequest);

  const dateInput = document.querySelector("#documentation-time");
  const dateRefresh = document.querySelector("#time-refresh");

  dateRefresh.addEventListener("click", () => {
    refreshTime();
  });

  refreshTime();

  const complicationsCheckboxes = document.querySelectorAll(
    ".complications .form__input-checkbox"
  );

  const complicationsTextArea = document.querySelector(
    "#documentation-complications-comment"
  );
  const errorMsg = document.querySelector(".error-message-documentation");

  complicationsCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      errorMsg.style.display = "none";
      complicationsTextArea.style.border = "1px solid var(--blue-pitch)";

      if (e.target.value === "yes") {
        complicationsTextArea.style.display = "block";
      } else {
        complicationsTextArea.style.display = "none";
      }
    });
  });

  function refreshTime() {
    const date = new Date().toISOString().split("T")[0];
    const hour =
      new Date().getHours() < 10
        ? "0" + new Date().getHours()
        : new Date().getHours();
    const minute =
      new Date().getMinutes() < 10
        ? "0" + new Date().getMinutes()
        : new Date().getMinutes();
    const time = hour + ":" + minute;

    dateInput.innerText = date + " " + time;
  }

  documentationBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!auth.currentUser) return;

    errorMsg.style.display = "none";
    complicationsTextArea.style.border = "1px solid var(--blue-pitch)";

    const wellbeingValue = document.querySelector(
      'input[name="well-being"]:checked'
    ).value;
    const wellnessComment = document.querySelector(
      "#documentation-wellness-comment"
    ).value;

    const complicationsValue = document.querySelector(
      'input[name="complications"]:checked'
    ).value;
    const complicationComment = complicationsTextArea.value;

    if (complicationsValue === "yes" && complicationComment === "") {
      errorMsg.style.display = "block";
      complicationsTextArea.style.border = "1px solid red";

      errorMsg.innerHTML = "Please add a comment";
      return;
    }

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const currDate = `${year}-${month}-${day}`;

    const userId = auth.currentUser.uid;
    const docRefrence = ref(db, "documentation/" + userId + "/" + currDate);

    await set(docRefrence, {
      date: dateInput.innerHTML,
      wellBeing: wellbeingValue,
      wellBeingComment: wellnessComment,
      complications: complicationsValue,
      complicationsComment: complicationComment,
    });

    location.href = "leaderboard.html";
  });

  function loginRequest() {
    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    const errorMsg = document.querySelector(".error-message-login");
    errorMsg.style.display = "none";

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const currDate = `${year}-${month}-${day}`;

    const forms = document.querySelectorAll(".container form");
    const documentation = document.querySelector("#documentation");
    const login = document.querySelector("#login");
    const container = document.querySelector(".container");

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const reference = ref(db, "users/" + user.uid);
        const JSONscore = JSON.parse(localStorage.getItem("score"));

        get(child(ref(db), "users/" + user.uid)).then((snapshot) => {
          if (snapshot.exists) {
            sessionStorage.setItem(
              "user-info",
              JSON.stringify({
                username: snapshot.val().username,
                email: snapshot.val().email,
                score: JSONscore,
                highscore: Math.min(
                  JSONscore,
                  Number(snapshot.val().highscore)
                ),
                date:
                  JSONscore < Number(snapshot.val().highscore)
                    ? currDate
                    : snapshot.val().date,
                age: snapshot.val().age,
                projectIdentifier: snapshot.val().projectIdentifier,
              })
            );

            sessionStorage.setItem("user-creds", JSON.stringify(user));

            errorMsg.style.display = "none";
          }
        });

        const docsReference = ref(db, "scores/" + user.uid + "/" + currDate);
        const docsSnapshot = await get(docsReference);

        if (docsSnapshot.exists) {
          const scores = docsSnapshot.val();
          scores.splice(0, 1);

          if (scores.length === 8) {
            forms.forEach((form) => {
              documentationBtn.style.display = "block";

              form.classList.add("form--hidden");
              documentation.classList.remove("form--hidden");

              container.style.zIndex = 200;
            });

            return;
          } else location.href = "leaderboard.html";
        }
      })
      .catch((error) => {
        const errorCode = error.code;

        if (errorCode) {
          const filteredErrMsg = errorCode.split("/");
          const cleanErrMsg = filteredErrMsg[1].split("-").join(" ");
          errorMsg.innerHTML = cleanErrMsg;
          errorMsg.style.display = "block";
        }
      });
  }
});
