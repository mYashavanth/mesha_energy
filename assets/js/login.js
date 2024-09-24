document.addEventListener("DOMContentLoaded", function () {
  passwordToggleBtn = document.getElementById("button-addon2");
  passwordInput = document.getElementById("password");

  passwordToggleBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordToggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      passwordToggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });
});
