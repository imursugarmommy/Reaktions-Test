import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import { app } from "./app.js";

const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("#login-btn");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        window.location.href = "./leaderboard.html";
      })
      .catch((error) => {
        const errorMsg = document.querySelector(".error-message-login");

        const errorCode = error.code;
        const errorMessage = error.message;

        const filteredErrMsg = errorCode.split("/");
        const cleanErrMsg = filteredErrMsg[1].split("-");

        errorMsg.innerHTML = cleanErrMsg.join(" ");
        errorMsg.style.display = "block";
      });
  });
});
