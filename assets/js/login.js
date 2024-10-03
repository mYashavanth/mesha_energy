document.addEventListener("DOMContentLoaded", function () {
  const passwordToggleBtn = document.getElementById("button-addon2");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const loginForm = document.querySelector("form");
  const errorDiv = document.getElementById("errorDiv");
  const successToastEl = document.getElementById("successToast");
  const toast = new bootstrap.Toast(successToastEl);

  // Toggle password visibility
  passwordToggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordToggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      passwordToggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  // Clear error message when focusing on inputs
  emailInput.addEventListener("change", () => {
    errorDiv.textContent = "";
  });

  passwordInput.addEventListener("change", () => {
    errorDiv.textContent = "";
  });

  // Handle form submission
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Clear previous error messages
    errorDiv.textContent = "";

    // Create a new FormData object from the form
    const formData = new FormData(loginForm);

    // Make an API call to the login endpoint
    fetch("https://stingray-app-4smpo.ondigitalocean.app/super-admin-users", {
      method: "POST",
      body: formData, // Use FormData directly
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errFlag === 0) {
          // Successful login, store the token in localStorage
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userEmail", emailInput.value);
          console.log("Token:", data.token);
          
          // Show Bootstrap toast for successful login
          toast.show();
          window.location.href = "mesha_customer_management.html";
        } else {
          console.log("Error:", data);
          errorDiv.textContent = data.message + " Please try again.";
          emailInput.focus();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // General error handling (network issues, etc.)
        errorDiv.textContent = "An error occurred, please try again.";
      });
  });
});
