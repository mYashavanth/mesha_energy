function loadNavBar() {
  const navContent = `
    <figure>
      <img src="./assets/images/index/logo.png" alt="logo" />
    </figure>
    <div class="navContent">
      <div class="navItems" id="all_devices_link">
        <i class="bi bi-pin-map" style="font-size: 20px"></i>
        <p>All Devices</p>
      </div>
      <div class="navItems" id="dashboard_link">
        <i class="bi bi-house-door" style="font-size: 20px"></i>
        <p>Dashboard</p>
      </div>
      <div class="accordion" id="accordionExample">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button accordion_1 collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseOne"
              aria-expanded="false"
              aria-controls="flush-collapseOne"
            >
              <i class="bi bi-person-workspace" style="font-size: 20px"></i>
              <p>Users and Role Management</p>
            </button>
          </h2>
          <div
            id="flush-collapseOne"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionExample"
          >
            <div class="navItems" id="mesha_customer_management_link">
              <i class="bi bi-person-workspace" style="font-size: 20px; color:transparent"></i>
              <p>Mesha Customer Management</p>
            </div>
            <div class="navItems" id="customer_user_role_management_link">
              <i class="bi bi-people" style="font-size: 20px; color:transparent" ></i>
              <p>Customer User Role Management</p>
            </div>
            <div class="navItems" id="device_management-link">
              <i class="bi bi-ev-front" style="font-size: 20px; color:transparent"></i>
              <p>Device Management</p>
            </div>
          </div>
        </div>
      </div>
      <div class="accordion" id="accordionExample2">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button accordion_2 collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#flush-collapseTwo"
              aria-expanded="false"
              aria-controls="flush-collapseTwo"
            >
              <i class="bi bi-person-gear" style="font-size: 20px"></i>
              <p>Super Users and Role Management</p>
            </button>
          </h2>
          <div
            id="flush-collapseTwo"
            class="accordion-collapse collapse"
            data-bs-parent="#accordionExample2"
          >
            <div class="navItems" id="user_role_definition_link">
              <i class="bi bi-person-gear" style="font-size: 20px; color:transparent" ></i>
              <p>User Role Definition</p>
            </div>
            <div class="navItems" id="super_user_role_management_link">
              <i class="bi bi-person-gear" style="font-size: 20px; color:transparent" ></i>
              <p>Super User Role Management</p>
            </div>
          </div>
        </div>
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

  const links = {
    "logout-link": "/login.html",
    dashboard_link: "/",
    dashboard_link: "/index.html",
    mesha_customer_management_link: "/mesha_customer_management.html",
    "device_management-link": "/device_management.html",
    customer_user_role_management_link: "/customer_user_role_management.html",
    super_user_role_management_link: "/super_user_role_management.html",
    user_role_definition_link: "/user_role_definition.html",
    profile_link: "/profile.html",
    all_devices_link: "/all_devices.html",
  };

  Object.entries(links).forEach(([id, url]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", () => {
        if (id === "logout-link") {
          localStorage.clear();
        }
        window.location.href = url;
      });
    }
  });
  modulePermission(links);
}
const allowedModules = JSON.parse(localStorage.getItem("moduleList")) || [];
function modulePermission(links) {
  const currentPageFileName = window.location.pathname.split("/").pop();

  // Check if the current page's file_name exists in the allowed modules
  const isPageAllowed = allowedModules.some(
    (module) => module.file_name === currentPageFileName
  );

  if (!isPageAllowed) {
    const firstAllowedModule = allowedModules[0];
    if (firstAllowedModule) {
      window.location.href = `/${firstAllowedModule.file_name}`;
    } else {
      window.location.href = "/login.html";
    }
  }
  Object.entries(links).forEach(([id, url]) => {
    if (url === "/login.html" || url === "/register.html") return;
    let isHiddden = allowedModules.some(
      (module) => module.file_name === url.split("/").pop()
    );
    if (!isHiddden) {
      document.getElementById(id).style.display = "none";
    }
  });
}

function setActiveLink() {
  const allowedModules = JSON.parse(localStorage.getItem("moduleList")) || [];

  const path = window.location.pathname;
  const links = {
    "/": "dashboard_link",
    "/index.html": "dashboard_link",
    "/mesha_customer_management.html": "mesha_customer_management_link",
    "/device_management.html": "device_management-link",
    "/customer_user_role_management.html": "customer_user_role_management_link",
    "/super_user_role_management.html": "super_user_role_management_link",
    "/user_role_definition.html": "user_role_definition_link",
    "/all_devices.html": "all_devices_link",
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
  const accordionLinks = [
    "/mesha_customer_management.html",
    "/customer_user_role_management.html",
    "/device_management.html",
  ];
  const isAccordion1Hidden = allowedModules.some(
    (module) =>
      module.file_name === "mesha_customer_management.html" ||
      module.file_name === "customer_user_role_management.html" ||
      module.file_name === "device_management.html"
  );
  if (!isAccordion1Hidden) {
    const accordionButton = document.querySelector(".accordion_1");
    accordionButton.style.display = "none";
  }
  const isAccordionActive = accordionLinks.includes(path);

  if (isAccordionActive) {
    const accordionButton = document.querySelector(".accordion_1");
    accordionButton.classList.remove("collapsed");
    accordionButton.setAttribute("aria-expanded", "true");

    const accordionCollapse = document.getElementById("flush-collapseOne");
    accordionCollapse.classList.add("show");
  }
  // Check if any of the accordion links are active and open the accordion if needed
  const accordionLinks_2 = [
    "/super_user_role_management.html",
    "/user_role_definition.html",
  ];
  const isAccordion2Hidden = allowedModules.some(
    (module) =>
      module.file_name === "super_user_role_management.html" ||
      module.file_name === "user_role_definition.html"
  );
  if (!isAccordion2Hidden) {
    const accordionButton = document.querySelector(".accordion_2");
    accordionButton.style.display = "none";
  }
  const isAccordionActive_2 = accordionLinks_2.includes(path);

  if (isAccordionActive_2) {
    const accordionButton = document.querySelector(".accordion_2");
    accordionButton.classList.remove("collapsed");
    accordionButton.setAttribute("aria-expanded", "true");

    const accordionCollapse = document.getElementById("flush-collapseTwo");
    accordionCollapse.classList.add("show");
  }
}

document.addEventListener("DOMContentLoaded", loadNavBar);
