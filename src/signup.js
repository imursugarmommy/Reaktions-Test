function setFormMessage(formElement, type, message) {
  const messageElement = formElement.querySelector(".form__message");

  messageElement.textContent = message;
  messageElement.classList.remove(
    "form__message--success",
    "form__message--error"
  );
  messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
  inputElement.classList.add("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = message;
}

function clearInputError(inputElement) {
  inputElement.classList.remove("form__input--error");
  inputElement.parentElement.querySelector(
    ".form__input-error-message"
  ).textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login");
  const createAccountForm = document.querySelector("#createAccount");

  document
    .querySelector("#linkCreateAccount")
    .addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("form--hidden");
      createAccountForm.classList.remove("form--hidden");
    });

  document.querySelector("#linkLogin").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("form--hidden");
    createAccountForm.classList.add("form--hidden");
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Perform your AJAX/Fetch login

    setFormMessage(loginForm, "error", "Invalid username/password combination");
  });

  document.querySelectorAll(".form__input").forEach((inputElement) => {
    inputElement.addEventListener("blur", (e) => {
      if (
        e.target.id === "signupUsername" &&
        e.target.value.length > 0 &&
        e.target.value.length < 10
      ) {
        setInputError(
          inputElement,
          "Username must be at least 10 characters in length"
        );
      }
    });

    inputElement.addEventListener("input", (e) => {
      clearInputError(inputElement);
    });
  });
});

import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  getDatabase,
  set,
  get,
  ref,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  const score = JSON.parse(localStorage.getItem("score"));

  const signupBtn = document.querySelector("#signup-btn");

  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const username = document.querySelector("#signup-username").value;
    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;
    const passwordConfirm = document.querySelector(
      "#confirm-signup-password"
    ).value;
    const errorMsg = document.querySelector(".error-message-signup");

    if (password !== passwordConfirm) {
      errorMsg.innerHTML = `Passwords don't match`;
      return;
    }

    createUserWithEmailAndPassword(auth, email, password, username, score)
      .then((userCredential) => {
        const user = userCredential.user;

        writeUserData(email, user.uid, username, score);
      })
      .catch((error) => {
        const errorMsg = document.querySelector(".error-message-signup");

        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(error);

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

  async function writeUserData(email, userID, username, score) {
    const reference = ref(db, "users/" + userID);

    await set(reference, {
      username,
      email,
      score: score || 0,
      highscore: score,
    });

    sessionStorage.setItem(
      "user-info",
      JSON.stringify({
        username: username,
        email: email,
        score: score,
        highscore: score,
      })
    );

    location.href = "./leaderboard.html";
  }
});
