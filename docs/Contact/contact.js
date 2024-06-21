const userObj = JSON.parse(sessionStorage.getItem("user-info"));
const userCreds = JSON.parse(sessionStorage.getItem("user-creds"));

document.addEventListener("DOMContentLoaded", () => {
  const fromInput = document.getElementById("floatingInput");
  const titleInput = document.getElementById("floatingTitle");
  const descriptionInput = document.getElementById("description");

  const titleLabel = document.getElementById("title-label");

  titleLabel.style.color = "grey";
  descriptionInput.classList.remove("error");

  fromInput.value = userObj.email;

  const sendBtn = document.getElementById("send-mail");

  sendBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (titleInput.value === "" || descriptionInput.value === "") {
      error(titleInput.value, descriptionInput.value);

      openPopup(400);

      return;
    }

    sendMail();
  });

  function sendMail() {
    var params = {
      title: titleInput.value,
      from_name: userObj.username,
      email_id: userObj.email,
      message: descriptionInput.value,
    };

    emailjs.send("service_mhek7nu", "template_n67fkan", params).then((res) => {
      openPopup(res.status);
    });
  }

  function error(title, message) {
    if (title === "") {
      titleLabel.style.color = "var(--color-error)";
    }

    if (message === "") {
      descriptionInput.classList.add("error");
    }
  }

  function openPopup(status) {
    const popup = document.querySelector(".status-popup");

    popup.classList.remove("hidden");
    popup.classList.add("visible");

    setTimeout(() => {
      popup.classList.remove("visible");
      popup.classList.add("hidden");
    }, 3000);

    if (status === 200) return;
    else {
      popup.innerHTML = `
      <i class="fa-solid fa-xmark"></i> 
      <p class="popup-text">Error ${status}</p> 
      <p class="popup-text">Please try again later</p>`;
    }
  }
});
