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

import { app } from "/app.js";

const auth = getAuth(app);
const db = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#login-btn");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const currDate = `${year}-${month}-${day}`;

    // ! highscore isnt displayed correctly
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
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

            window.location.href = "/leaderboard.html";
          }
        });
      })
      .catch((error) => {
        const errorMsg = document.querySelector(".error-message-login");

        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === undefined) return;

        if (errorCode.includes("/")) {
          const filteredErrMsg = errorCode.split("/");
          const cleanErrMsg = filteredErrMsg[1].split("-");

          errorMsg.innerHTML = cleanErrMsg.join(" ");
        } else {
          errorMsg.innerHTML = errorCode;
        }

        errorMsg.style.display = "block";
      });
  });
});
