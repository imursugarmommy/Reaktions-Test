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
  const createAccountForm = document.querySelectorAll(".signup-form .sub-form");
  const documentationForm = document.querySelector("#documentation");

  document.querySelectorAll("#linkCreateAccount").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.classList.add("form--hidden");

      createAccountForm.forEach((form) => {
        form.classList.remove("form--hidden");
      });
    });
  });

  document.querySelector("#linkLogin").addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("form--hidden");
    createAccountForm.forEach((form) => {
      form.classList.add("form--hidden");
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

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
  child,
  get,
  ref,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { app, adminList } from "./app.js";

const auth = getAuth(app);
const db = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  const score = JSON.parse(localStorage.getItem("score"));

  const signupBtn = document.querySelector("#signup-btn");

  const signupForm = document.querySelectorAll(".signup-form .sub-form");

  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const errorMsg = document.querySelector(".error-message-signup");
    errorMsg.style.display = "block";

    signUpRequest();
  });

  const passwordInput = document.querySelector("#signup-password");

  passwordInput.addEventListener("keyup", (e) => {
    const upperCaseLetters = /[A-Z]/g;
    const lowerCaseLetters = /[a-z]/g;
    const numbers = /[0-9]/g;
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;

    const char = document.querySelector("#char");
    const charStyle = document.querySelector("#char .list-style");

    const upper = document.querySelector("#upper");
    const upperStyle = document.querySelector("#upper .list-style");

    const lower = document.querySelector("#lower");
    const lowerStyle = document.querySelector("#lower .list-style");

    const num = document.querySelector("#num");
    const numStyle = document.querySelector("#num .list-style");

    const special = document.querySelector("#special");
    const specialStyle = document.querySelector("#special .list-style");

    let score = 0;

    if (e.target.value.length > 8) {
      char.style.color = "var(--color-success)";
      charStyle.style.background = "transparent";
      charStyle.innerHTML = "✓";
      charStyle.style.padding = "0";
      score++;
    } else {
      char.style.color = "var(--grey)";
      charStyle.style.background = "var(--grey-light)";
      charStyle.innerHTML = "";
      charStyle.style.padding = "4px";
    }

    if (upperCaseLetters.test(e.target.value)) {
      upper.style.color = "var(--color-success)";
      upperStyle.style.background = "transparent";
      upperStyle.innerHTML = "✓";
      upperStyle.style.padding = "0";
      score++;
    } else {
      upper.style.color = "var(--grey)";
      upperStyle.style.background = "var(--grey-light)";
      upperStyle.innerHTML = "";
      upperStyle.style.padding = "4px";
    }

    if (lowerCaseLetters.test(e.target.value)) {
      lower.style.color = "var(--color-success)";
      lowerStyle.style.background = "transparent";
      lowerStyle.innerHTML = "✓";
      lowerStyle.style.padding = "0";
      score++;
    } else {
      lower.style.color = "var(--grey)";
      lowerStyle.style.background = "var(--grey-light)";
      lowerStyle.innerHTML = "";
      lowerStyle.style.padding = "4px";
    }

    if (numbers.test(e.target.value)) {
      num.style.color = "var(--color-success)";
      numStyle.style.background = "transparent";
      numStyle.innerHTML = "✓";
      numStyle.style.padding = "0";
      score++;
    } else {
      num.style.color = "var(--grey)";
      numStyle.style.background = "var(--grey-light)";
      numStyle.innerHTML = "";
      numStyle.style.padding = "4px";
    }

    if (specialChars.test(e.target.value)) {
      special.style.color = "var(--color-success)";
      specialStyle.style.background = "transparent";
      specialStyle.innerHTML = "✓";
      specialStyle.style.padding = "0";
      score++;
    } else {
      special.style.color = "var(--grey)";
      specialStyle.style.background = "var(--grey-light)";
      specialStyle.innerHTML = "";
      specialStyle.style.padding = "4px";
    }

    const passwordStrengthProgress =
      document.querySelector(".password-progress");

    const text = document.querySelector(".strength");

    const adjectives = ["weak", "medium", "strong", "very strong", "perfect"];

    const colors = [
      "var(--color-error)",
      "var(--color-error)",
      "var(--color-medium)",
      "var(--color-success)",
      "var(--color-success)",
    ];

    text.innerHTML = adjectives[Math.max(score - 1, 0)];

    text.style.color = colors[Math.max(score - 1, 0)];
    passwordStrengthProgress.style.backgroundColor =
      colors[Math.max(score - 1, 0)];
    passwordStrengthProgress.style.width = `${(100 / 5) * Math.max(score, 1)}%`;
  });

  const showPass = document.querySelector(".show-password");

  showPass.addEventListener("click", (e) => {
    const passwordInput = document.querySelector("#signup-password");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";

      showPass.innerHTML = "Hide";
    } else {
      passwordInput.type = "password";

      showPass.innerHTML = "Show";
    }
  });

  const nextStepBtn = document.querySelectorAll(".next-step-btn");
  const prevStepBtn = document.querySelectorAll(".prev-step-btn");

  const steps = document.querySelector(".signup-form");

  let pixelOffset = 0;

  nextStepBtn.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const username = document.querySelector("#signup-username").value;
      const email = document.querySelector("#signup-email").value;
      const password = document.querySelector("#signup-password").value;
      const passwordConfirm = document.querySelector(
        "#confirm-signup-password"
      ).value;

      const usernameInput = document.querySelector("#signup-username");
      const emailInput = document.querySelector("#signup-email");
      const passwordInput = document.querySelector("#signup-password");
      const passwordConfirmInput = document.querySelector(
        "#confirm-signup-password"
      );

      usernameInput.style.borderBottom = "1px solid var(--blue-pitch)";
      emailInput.style.borderBottom = "1px solid var(--blue-pitch)";
      passwordInput.style.borderBottom = "1px solid var(--blue-pitch)";
      passwordConfirmInput.style.borderBottom = "1px solid var(--blue-pitch)";

      const errorMsg = document.querySelectorAll(".error-message-signup");

      const snapshot = await get(child(ref(db), "users/"));
      const allUsers = snapshot.val();
      const userID = Object.keys(allUsers).find(
        (key) => allUsers[key].username === username
      );
      const emailInp = Object.keys(allUsers).find(
        (key) => allUsers[key].email === email
      );

      if (userID) {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Username already in use`;
        });

        usernameInput.style.borderBottom = "1px solid red";
        return;
      }

      if (emailInp) {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Email already in use`;
        });

        emailInput.style.borderBottom = "1px solid red";
        return;
      }

      if (password !== passwordConfirm) {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Passwords don't match`;
        });

        passwordInput.style.borderBottom = "1px solid red";
        passwordConfirmInput.style.borderBottom = "1px solid red";
        return;
      }

      if (username === "") {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Username missing`;
        });

        usernameInput.style.borderBottom = "1px solid red";
        return;
      }

      if (email === "") {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Email missing`;
        });

        emailInput.style.borderBottom = "1px solid red";
        return;
      }

      if (password === "" && pixelOffset < 0) {
        errorMsg.forEach((msg) => {
          msg.style.display = "block";
          msg.innerHTML = `Password missing`;
        });

        passwordInput.style.borderBottom = "1px solid red";
        return;
      }

      errorMsg.forEach((msg) => {
        msg.style.display = "none";
      });

      if (pixelOffset <= -800) return;

      pixelOffset -= 400;

      steps.style.transform = `translateX(${pixelOffset}px)`;
    });
  });
  prevStepBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const errorMsg = document.querySelectorAll(".error-message-signup");

      errorMsg.forEach((msg) => {
        msg.style.display = "none";
      });

      if (pixelOffset >= 0) return;

      pixelOffset += 400;

      steps.style.transform = `translateX(${pixelOffset}px)`;
    });
  });

  async function signUpRequest() {
    const username = document.querySelector("#signup-username").value;
    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;
    const passwordConfirm = document.querySelector(
      "#confirm-signup-password"
    ).value;
    const age = document.querySelector("#age").value;
    const projectIdentifier = document.querySelector(
      "#project-identifier"
    ).value;

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const currDate = `${year}-${month}-${day}`;

    const errorMsg = document.querySelectorAll(".error-message-signup");

    createUserWithEmailAndPassword(
      auth,
      email,
      password,
      username,
      score,
      age,
      projectIdentifier
    )
      .then((userCredential) => {
        const user = userCredential.user;
        const JSONscore = JSON.parse(localStorage.getItem("score"));

        sessionStorage.setItem("user-creds", JSON.stringify(user));

        signupForm.forEach((form) => {
          form.classList.add("form--hidden");
        });

        writeUserData(
          email,
          user.uid,
          username,
          JSONscore,
          currDate,
          user,
          age,
          projectIdentifier
        );
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === undefined) return;

        if (errorCode.includes("/")) {
          const filteredErrMsg = errorCode.split("/");
          const cleanErrMsg = filteredErrMsg[1].split("-");

          errorMsg.forEach((msg) => {
            msg.innerHTML = cleanErrMsg.join(" ");
          });
        } else {
          errorMsg.forEach((msg) => {
            msg.innerHTML = errorCode;
          });
        }

        errorMsg.forEach((msg) => {
          msg.style.display = "block";
        });
      });
  }

  async function writeUserData(
    email,
    userID,
    username,
    score,
    currDate,
    user,
    age,
    projectIdentifier
  ) {
    const reference = ref(db, "users/" + userID);

    await set(reference, {
      username,
      email,
      score: score || 0,
      highscore: score,
      date: currDate,
      age: age !== "" ? age : "",
      projectIdentifier:
        projectIdentifier === "jufoSK11" ? projectIdentifier : "",
      admin: adminList.includes(email.toLowerCase()) ? true : false,
    });

    new Promise((resolve) => {
      sessionStorage.setItem(
        "user-info",
        JSON.stringify({
          username: username,
          email: email,
          score: score,
          highscore: score,
          date: currDate,
          age: age !== "" ? age : "",
          projectIdentifier:
            projectIdentifier === "jufoSK11" ? projectIdentifier : "",
          admin: adminList.includes(email.toLowerCase()) ? true : false,
        })
      );
      resolve();
    }).then(() => {
      location.href = "./leaderboard.html";
    });
  }
});
