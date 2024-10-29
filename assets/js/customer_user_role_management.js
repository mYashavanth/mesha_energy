const addUserBtn = document.getElementById("addUserBtn");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const customerId = document.getElementById("customerId");
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
        <input id=${params.data.id} type="checkbox" class="checkbox" ${isChecked}>
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

let isEditing = false;
const userData = {
  super_admin_id: "",
  customer_id: "",
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
  userData.customer_id = "";

  usernameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  customerId.value = "";
};
function handleEdit(rowData) {
  isEditing = true;
  addUserBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData);
  userData.super_admin_id = rowData.id;
  userData.username = rowData.userName;
  userData.email = rowData.email;
  userData.customer_id = rowData.customerId;
  usernameInput.value = rowData.userName;
  emailInput.value = rowData.email;
  passwordInput.value = "";
  customerId.value = rowData.customerId;
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
      ? "https://stingray-app-4smpo.ondigitalocean.app/app-users-add"
      : "";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("customer_id", userData.customer_id);

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
      fetchUsers(gridApi);
      closeModal();
    } else {
      console.error("Server returned an error:", data);
      inputValidationMsg.style.display = "block";
      inputValidationMsg.innerText = data.message || "Failed to add user";
      setTimeout(() => {
        inputValidationMsg.style.display = "none";
      }, 2000);
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
async function fetchUsers(gridApi) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/app-users-all/${authToken}`;

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
    console.log("data", data);

    data.errFlag === 1
      ? (window.location.href = "login.html")
      : console.log("Super admin data:", data);

    const formattedData = data.map((item, index) => ({
      index: index + 1,
      userName: item.username,
      status: item.status,
      email: item.email,
      id: item.id,
      customerName: item.customer_name,
      customerId: item.customer_id,
    }));
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
  }
}

async function toggleStatus(userId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = "";

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
    triggerErrorToast("Please check your internet connection and try again.");
    return false;
  }
}
function triggerErrorToast(message) {
  const toastElement = document.getElementById("errorToast");
  const toastMessageElement = document.getElementById("toastMessage");
  toastMessageElement.textContent = message;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No",
      field: "index",
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
      headerName: "Customer Name",
      field: "customerName",
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
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

  fetchUsers(gridApi);
});

function onBtnExport() {
  gridApi.exportDataAsCsv({
    processCellCallback: (params) => {
      if (params.column.getColId() === "status") {
        return params.value === 1
          ? "Active"
          : params.value === 0
          ? "Inactive"
          : params.value;
      }
      return params.value;
    },
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const customerData = await fetchCustomerData();

  if (customerData) {
    console.log("Customer data:", customerData);
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select Customer";
    customerId.appendChild(option);
    customerData.forEach((customer) => {
      const option = document.createElement("option");
      option.value = customer.id;
      option.textContent = customer.customer_name;
      customerId.appendChild(option);
    });

    customerId.addEventListener("change", async function () {
      const selectedCustomerId = this.value;
      userData.customer_id = selectedCustomerId;
      console.log({ selectedCustomerId, userData });
    });
  }
});

async function fetchCustomerData() {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/customers/all/${authToken}`;

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

    if (data.errFlag === 1) {
      window.location.href = "login.html";
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
    return null;
  }
}
