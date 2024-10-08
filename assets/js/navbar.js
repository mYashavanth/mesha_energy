function loadNavBar() {
  const navContent = `
    <figure>
      <img src="./assets/images/index/logo.png" alt="logo" />
    </figure>
    <div class="navContent">
      <div class="navItems" id="dashboard_link">
        <i class="bi bi-house-door" style="font-size: 20px"></i>
        <p>Dashboard</p>
      </div>
      <div class="navItems" id="mesha_customer_management_link">
        <i class="bi bi-person-workspace" style="font-size: 20px"></i>
        <p>Mesha Customer Management</p>
      </div>
      <!-- <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseOne"
              aria-expanded="false"
              aria-controls="flush-collapseOne"
            >
              <i class="bi bi-ev-front" style="font-size: 20px"></i>
              <p>Device Management</p>
            </button>
          </h2>
          <div
            id="flush-collapseOne"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionExample"
          >
            <div class="navItems" id="device_management-link">
              <i
                class="bi bi-house-door"
                style="font-size: 20px; color: transparent"
              ></i>
              <p>Device Management</p>
            </div>
            <div class="navItems" id="customer_management_link">
              <i 
                class="bi bi-people" 
                style="font-size: 20px; color: transparent"
              ></i>
              <p>Device Parameters</p>
            </div>
          </div>
        </div>
      </div> -->
      <div class="navItems" id="device_management-link">
        <i class="bi bi-ev-front" style="font-size: 20px"></i>
        <p>Device Management</p>
      </div>
      <div class="navItems" id="user_role_management_link">
        <i class="bi bi-people" style="font-size: 20px;" ></i>
        <p>User Role Management</p>
      </div>
      <div class="navItems" id="super_user_role_management_link">
        <i class="bi bi-person-gear" style="font-size: 20px;" ></i>
        <p>Super User Role Management</p>
      </div>
      <div class="navItems" id="map-view-link">
        <i class="bi bi-pin-map" style="font-size: 20px"></i>
        <p>Map View</p>
      </div>
      <div class="navItems" id="profile_link">
        <i class="bi bi-person" style="font-size: 20px"></i>
        <p>Profile</p>
      </div>
      <div class="navItems" id="faqs-link">
        <i class="bi bi-question-octagon" style="font-size: 20px"></i>
        <p>FAQs</p>
      </div>
      <div class="navItems" id="logout-link">
        <i class="bi bi-power" style="font-size: 20px"></i>
        <p>Logout</p>
      </div>
    </div>
  `;

  document.getElementById("nav").innerHTML = navContent;

  setActiveLink();

  document.getElementById("logout-link").addEventListener("click", function () {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/login.html";
  });
  document
    .getElementById("dashboard_link")
    .addEventListener("click", function () {
      window.location.href = "/index.html";
    });
  document
    .getElementById("mesha_customer_management_link")
    .addEventListener("click", function () {
      window.location.href = "/mesha_customer_management.html";
    });
  document
    .getElementById("device_management-link")
    .addEventListener("click", function () {
      window.location.href = "/device_management.html";
    });
  document
    .getElementById("user_role_management_link")
    .addEventListener("click", function () {
      window.location.href = "/user_role_management.html";
    });
  document
    .getElementById("super_user_role_management_link")
    .addEventListener("click", function () {
      window.location.href = "/super_user_role_management.html";
    });
  document
    .getElementById("profile_link")
    .addEventListener("click", function () {
      window.location.href = "/profile.html";
    });
}

function setActiveLink() {
  const path = window.location.pathname;

  const links = {
    "/": "dashboard_link",
    "/index.html": "dashboard_link",
    "/mesha_customer_management.html": "mesha_customer_management_link",
    "/customer-management": "customer_management_link",
    "/device_management.html": "device_management-link",
    "/user_role_management.html": "user_role_management_link",
    "/super_user_role_management.html": "super_user_role_management_link",
    "/map-view": "map-view-link",
    "/profile.html": "profile_link",
    "/faqs": "faqs-link",
  };

  const navItems = document.querySelectorAll(".navItems");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  if (links[path]) {
    document.getElementById(links[path]).classList.add("active");
  }

  // Check if any of the accordion links are active and open the accordion if needed
  const accordionLinks = ["/example.html", "/device_parameters.html"];
  const isAccordionActive = accordionLinks.includes(path);

  if (isAccordionActive) {
    const accordionButton = document.querySelector(".accordion-button");
    accordionButton.classList.remove("collapsed");
    accordionButton.setAttribute("aria-expanded", "true");

    const accordionCollapse = document.getElementById("flush-collapseOne");
    accordionCollapse.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", loadNavBar);
