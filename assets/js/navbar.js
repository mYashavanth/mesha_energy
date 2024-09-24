// navbar.js

// Function to insert the navigation bar into the HTML page
function loadNavBar() {
  const navContent = `
    <figure>
      <img src="./assets/images/index/logo.png" alt="logo" />
    </figure>
    <div class="navContent">
      <div class="navItems" id="dashboard-link">
        <i class="bi bi-house-door" style="font-size: 20px"></i>
        <p>Dashboard</p>
      </div>
      <div class="navItems" id="customer-management-link">
        <i class="bi bi-person-workspace" style="font-size: 20px"></i>
        <p>Mesha Customer Management</p>
      </div>
      <div class="accordion" id="accordionExample">
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
            <div class="navItems" id="device-management-1-link">
              <i
                class="bi bi-house-door"
                style="font-size: 20px; color: transparent"
              ></i>
              <p>Device Management 1</p>
            </div>
            <div class="navItems" id="device-management-2-link">
              <i
                class="bi bi-house-door"
                style="font-size: 20px; color: transparent"
              ></i>
              <p>Device Management 2</p>
            </div>
          </div>
        </div>
      </div>
      <div class="navItems" id="customer-management-link">
        <i class="bi bi-people" style="font-size: 20px"></i>
        <p>Customer Management</p>
      </div>
      <div class="navItems" id="map-view-link">
        <i class="bi bi-pin-map" style="font-size: 20px"></i>
        <p>Map View</p>
      </div>
      <div class="navItems" id="settings-link">
        <i class="bi bi-gear" style="font-size: 20px"></i>
        <p>Settings</p>
      </div>
      <div class="navItems" id="profile-link">
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

  // Call the function to set the active class based on the current path
  setActiveLink();

  // Add click event listener for Dashboard link
  document
    .getElementById("dashboard-link")
    .addEventListener("click", function () {
      // Navigate to the /index.html path
      window.location.href = "/index.html";
    });
}

// Function to set the active class based on the current path
function setActiveLink() {
  const path = window.location.pathname;

  const links = {
    "/": "dashboard-link",
    "/index.html": "dashboard-link",
    "/customer-management": "customer-management-link",
    "/device-management-1": "device-management-1-link",
    "/device-management-2": "device-management-2-link",
    "/map-view": "map-view-link",
    "/settings": "settings-link",
    "/profile": "profile-link",
    "/faqs": "faqs-link",
  };

  // Remove 'active' class from all navItems
  const navItems = document.querySelectorAll(".navItems");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Set the active class for the matching link
  if (links[path]) {
    document.getElementById(links[path]).classList.add("active");
  }
}

// Call the function to load the nav bar when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadNavBar);
