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

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const reference = ref(db, "users/" + user.uid);

        get(child(ref(db), "users/" + user.uid)).then((snapshot) => {
          if (snapshot.exists) {
            sessionStorage.setItem(
              "user-info",
              JSON.stringify({
                username: snapshot.val().username,
                email: snapshot.val().email,
                score: snapshot.val().score,
                highscore: Math.min(
                  Number(snapshot.val().score),
                  Number(snapshot.val().highscore)
                ),
              })
            );
            sessionStorage.setItem("user-creds", JSON.stringify(user));

            const score = JSON.parse(localStorage.getItem("score"));
            console.log(score);

            writeUserData(
              snapshot.val().username,
              snapshot.val().email,
              Number(snapshot.val().highscore),
              score,
              reference
            );
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

async function writeUserData(username, email, highscore, score, reference) {
  await set(reference, {
    username,
    email,
    score,
    highscore: Math.min(highscore, score),
  });

  window.location.href = "./leaderboard.html";
}
