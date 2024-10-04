const passwordToggleBtn = document.getElementById("button-addon2");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const loginBtn = document.getElementById("loginBtn");
const loginData = {
  email: "",
  password: "",
};
const emailRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  if (!emailInput.value.trim()) {
    validationMsg += "Email cannot be empty.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else if (!emailInput.value.trim().match(emailRegex)) {
    validationMsg += "Please enter a valid email address.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else {
    emailInput.style.borderColor = "";
  }

  if (!passwordInput.value.trim()) {
    validationMsg += "Password cannot be empty.\n";
    valid = false;
    passwordInput.style.borderColor = "red";
  } else {
    passwordInput.style.borderColor = "";
  }

  if (validationMsg) {
    inputValidationMsg.innerText = validationMsg;
    inputValidationMsg.style.display = "block";
  } else {
    inputValidationMsg.style.display = "none";
  }

  return valid;
};

const focusOnFirstError = () => {
  if (emailInput.style.borderColor === "red") {
    emailInput.focus();
  } else if (passwordInput.style.borderColor === "red") {
    passwordInput.focus();
  }
};

const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = "";
  inputValidationMsg.style.display = "none";
};

emailInput.addEventListener("input", clearErrorMessages);
passwordInput.addEventListener("input", clearErrorMessages);

const spinnerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div> Logging in...`;

passwordToggleBtn.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
  } else {
    passwordInput.type = "password";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
  }
});

function handleChange(event) {
  loginData[event.target.name] = event.target.value;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = spinnerHTML;

    const formData = new FormData();
    formData.append("email", loginData.email);
    formData.append("password", loginData.password);

    const response = await fetch(
      "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.errFlag === 0) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", loginData.email);
      window.location.href = "mesha_customer_management.html";
    } else {
      inputValidationMsg.textContent = data.message + " Please try again.";
      inputValidationMsg.style.display = "block";
      emailInput.focus();
    }
  } catch (error) {
    console.error("Error:", error);
    inputValidationMsg.textContent = "An error occurred, please try again.";
    inputValidationMsg.style.display = "block";
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
  }
}
