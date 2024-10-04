const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordToggleBtn = document.getElementById("button-addon2");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const inputSuccessMsg = document.getElementById("inputSuccessMsg");
const authToken = localStorage.getItem("authToken"); // Fetch the authToken from localStorage

// Toggle password visibility
passwordToggleBtn.addEventListener("click", function () {
  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
  } else {
    confirmPasswordInput.type = "password";
    passwordToggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
  }
});

// Object to store password data
const passwordData = {
  password: "",
  confirmPassword: "",
};

// Function to handle input changes
function handleChange(event) {
  const name = event.target.name;
  const value = event.target.value;
  passwordData[name] = value;
}

// Password validation function
function validatePassword(password) {
  const capitalLetter = /[A-Z]/;
  const smallLetter = /[a-z]/;
  const number = /\d/;
  const specialChar = /[@$!%*?&#]/;
  const minLength = 6;

  if (!capitalLetter.test(password)) {
    return "Password must contain at least one capital letter, example-password: P@ssw0rd.";
  }
  if (!smallLetter.test(password)) {
    return "Password must contain at least one lowercase letter, example-password: p@ssw0rd.";
  }
  if (!number.test(password)) {
    return "Password must contain at least one number, example-password: P@ssw0rd.";
  }
  if (!specialChar.test(password)) {
    return "Password must contain at least one special character (@, $, !, %, *, ?, &, #), example-password: P@ssw0rd.";
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long, example-password: P@ssw0rd.`;
  }
  return ""; // Empty string means password is valid
}

// Handle password input changes
passwordInput.addEventListener("input", () => {
  inputValidationMsg.style.display = "none";
  passwordInput.style.borderColor = "";
  confirmPasswordInput.style.borderColor = "";
});

// Function to handle password submission
async function handlePasswordSubmit(event) {
  event.preventDefault();

  const validationMessage = validatePassword(passwordData.password);

  if (validationMessage) {
    // If validation fails, show error message
    inputValidationMsg.style.display = "block";
    inputValidationMsg.innerText = validationMessage;
    passwordInput.style.borderColor = "red";
    passwordInput.focus();
    return;
  }

  // Check if passwords match
  if (passwordData.password === passwordData.confirmPassword) {
    try {
      // Create a new FormData object
      const formData = new FormData();
      formData.append("token", authToken); // Append authToken as token
      formData.append("password", passwordData.password); // Append new password

      // Make the API request to update the password
      const response = await fetch(
        "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/update/password",
        {
          method: "POST",
          body: formData, // Send FormData in the body
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Password successfully updated:", result);
        // Handle success (e.g., show success message or redirect)
      } else {
        console.error("Failed to update password:", result);
        inputValidationMsg.style.display = "block";
        inputValidationMsg.innerText =
          result.message || "Failed to update password";
      }
    } catch (error) {
      console.error("Error:", error);
      inputValidationMsg.style.display = "block";
      inputValidationMsg.innerText =
        "An error occurred while updating the password.";
    }
  } else {
    console.log("Password not matched");
    inputValidationMsg.style.display = "block";
    inputValidationMsg.innerText = "Passwords do not match";
    passwordInput.style.borderColor = "red";
    confirmPasswordInput.style.borderColor = "red";
    passwordInput.focus();
  }
}
