const addUserBtn = document.getElementById("addUserBtn");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const spinnerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Please wait...`;
let gridApi;
const usernameRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[A-Za-z\s-]+$/;
const emailRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*[<>\\/\[\]{};:]).{6,}$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate username
  if (!usernameInput.value.trim()) {
    validationMsg += "Username cannot be empty.\n";
    valid = false;
    usernameInput.style.borderColor = "red";
  } else if (!usernameInput.value.trim().match(usernameRegex)) {
    validationMsg +=
      "Username should only contain letters, spaces, or hyphens.\n";
    valid = false;
    usernameInput.style.borderColor = "red";
  } else {
    usernameInput.style.borderColor = ""; // Clear error styling
  }

  // Validate email
  if (!emailInput.value.trim()) {
    validationMsg += "Email cannot be empty.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else if (!emailInput.value.trim().match(emailRegex)) {
    validationMsg += "Please enter a valid email address.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else {
    emailInput.style.borderColor = ""; // Clear error styling
  }

  // Validate password (can be empty for editing, otherwise must follow the rules)
  if (passwordInput.value && !passwordInput.value.trim().match(passwordRegex)) {
    validationMsg +=
      "Password must be at least 6 characters long, include one uppercase letter, one lowercase letter, one number, and one symbol.\n";
    valid = false;
    passwordInput.style.borderColor = "red";
  } else {
    passwordInput.style.borderColor = ""; // Clear error styling
  }

  // Display or clear validation message
  if (validationMsg) {
    inputValidationMsg.innerText = validationMsg;
    inputValidationMsg.style.display = "block"; // Show message
  } else {
    inputValidationMsg.style.display = "none"; // Hide message if valid
  }

  return valid;
};

// Focus on the first invalid field
const focusOnFirstError = () => {
  if (usernameInput.style.borderColor === "red") {
    usernameInput.focus();
  } else if (emailInput.style.borderColor === "red") {
    emailInput.focus();
  } else if (passwordInput.style.borderColor === "red") {
    passwordInput.focus();
  }
};
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  inputValidationMsg.style.display = "none"; // Hide error message
};

usernameInput.addEventListener("input", clearErrorMessages);
emailInput.addEventListener("input", clearErrorMessages);
passwordInput.addEventListener("input", clearErrorMessages);
class StatusCellRenderer {
  init(params) {
    this.eGui = document.createElement("div");
    const isChecked = params.value === 1 ? "checked" : "";

    this.eGui.innerHTML = `
      <label class="switch">
        <input type="checkbox" class="checkbox" ${isChecked}>
        <div class="slider"></div>
      </label>`;

    const checkbox = this.eGui.querySelector('input[type="checkbox"]');

    checkbox.addEventListener("change", async () => {
      const newStatus = checkbox.checked ? 1 : 0;
      const success = await toggleStatus(params.data.id, newStatus);
      if (success) {
        params.setValue(newStatus);
      } else {
        checkbox.checked = !checkbox.checked;
      }
    });
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    const checkbox = this.eGui.querySelector('input[type="checkbox"]');
    checkbox.checked = params.value === 1;
    return true;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
let isEditing = false;
const userData = {
  super_admin_id: "",
  username: "",
  email: "",
  password: "",
};
const onBtnAdd = () => {
  isEditing = false;
  addUserBtn.innerText = "Add";
  userData.username = "";
  userData.email = "";
  userData.password = "";
  usernameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
};
function handleEdit(rowData) {
  isEditing = true;
  addUserBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData);
  userData.super_admin_id = rowData.id;
  userData.username = rowData.userName;
  userData.email = rowData.email;
  usernameInput.value = rowData.userName;
  emailInput.value = rowData.email;
  passwordInput.value = "";
}
const handleUserSubmit = async (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }

  try {
    addUserBtn.disabled = true;
    addUserBtn.innerHTML = spinnerHTML;
    const apiUrl = !isEditing
      ? "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/add"
      : "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/update";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);

    if (isEditing) {
      formData.append("super_admin_id", userData.super_admin_id);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("data", data);

    if (data.errFlag === 0) {
      fetchSuperAdminUsers(gridApi);
      closeModal();
    } else {
      console.error("Server returned an error:", data);
    }
  } catch (error) {
    console.error("Error occurred during submission:", error);
  } finally {
    addUserBtn.disabled = false;
    addUserBtn.innerHTML = "Add";
  }
};

function closeModal() {
  const modalElement = document.getElementById("userModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
const handlechange = (event) => {
  userData[event.target.name] = event.target.value;
};
async function fetchSuperAdminUsers(gridApi) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/all/${authToken}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();

    data.errFlag === 1
      ? (window.location.href = "login.html")
      : console.log("Super admin data:", data);

    const formattedData = data.map((item) => ({
      userName: item.username,
      createdDate: formatDate(item.created_date),
      status: item.status,
      email: item.email,
      id: item.id,
    }));
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
  }
}

async function toggleStatus(userId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl =
    "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/update/status";

  const formData = new FormData();
  formData.append("token", authToken);
  formData.append("status", newStatus);
  formData.append("superUserId", userId);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Status updated successfully for customer ${userId}:`, result);
    if (result.errFlag === 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating customer status:", error);
    return false;
  }
}

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No",
      field: "id",
      maxWidth: 100,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "User Name",
      field: "userName",
    },
    {
      headerName: "Email",
      field: "email",
    },
    {
      headerName: "Created Date",
      field: "createdDate",
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const dateParts = cellValue.split("-");
          const year = Number(dateParts[2]);
          const month = Number(dateParts[1]) - 1;
          const day = Number(dateParts[0]);
          const cellDate = new Date(year, month, day);
          // Compare dates
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          } else {
            return 0;
          }
        },
      },
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
      sortable: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: StatusCellRenderer,
      cellClassRules: {
        "disabled-cell": (params) =>
          params.data.email === localStorage.getItem("userEmail"),
      },
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      sortable: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: function (params) {
        return `<button 
                  type="button" 
                  style="margin-top:10px;" 
                  data-bs-toggle="modal"
                  data-bs-target="#userModal"
                  class="btn btn-light" 
                  onclick='handleEdit(${JSON.stringify(params.data)})'
                >
                  <i class="bi bi-pencil-square"></i>
                </button>`;
      },
      cellClassRules: {
        "disabled-cell": (params) =>
          params.data.email === localStorage.getItem("userEmail"),
      },
    },
  ],

  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    flex: 1,
    filterParams: {
      debounceMs: 0,
      buttons: ["reset"],
    },
    cellClassRules: {
      "disabled-cell": (params) =>
        params.data.email === localStorage.getItem("userEmail"),
    },
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return 80;
  },
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 30],
  suppressExcelExport: true,
  // enableCellTextSelection: true,
};

document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  fetchSuperAdminUsers(gridApi);
});

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
