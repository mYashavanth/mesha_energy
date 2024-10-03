document.addEventListener("DOMContentLoaded", function () {
  const passwordToggleBtn = document.getElementById("button-addon2");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const loginForm = document.querySelector("form");
  const errorDiv = document.getElementById("errorDiv");
  const successToastEl = document.getElementById("successToast");
  const toast = new bootstrap.Toast(successToastEl);
  const loginBtn = document.getElementById("loginBtn");

  // Spinner HTML
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

  emailInput.addEventListener("change", () => {
    errorDiv.textContent = "";
  });

  passwordInput.addEventListener("change", () => {
    errorDiv.textContent = "";
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    errorDiv.textContent = "";

    const formData = new FormData(loginForm);

    try {
      // Start loading: disable button and show spinner
      loginBtn.disabled = true;
      loginBtn.innerHTML = spinnerHTML;

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
        localStorage.setItem("userEmail", emailInput.value);
        console.log("Token:", data.token);

        toast.show();
        window.location.href = "mesha_customer_management.html";
      } else {
        console.log("Error:", data);
        errorDiv.textContent = data.message + " Please try again.";
        emailInput.focus();
      }
    } catch (error) {
      console.error("Error:", error);
      errorDiv.textContent = "An error occurred, please try again.";
    } finally {
      // Stop loading: re-enable button and restore original text
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login"; // Reset button text after completion
    }
  });
});
