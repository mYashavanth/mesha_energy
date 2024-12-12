const addUserRoleBtn = document.getElementById("addUserRoleBtn");
const userRoleNameInput = document.getElementById("userRoleName");
const modulesCheckbox = document.getElementById("modulesCheckbox");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const spinnerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Please wait...`;
let gridApi;
const usernameRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[A-Za-z\s-]+$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate username
  if (!userRoleNameInput.value.trim()) {
    validationMsg += "User Role Name cannot be empty.\n";
    valid = false;
    userRoleNameInput.style.borderColor = "red";
  } else if (!userRoleNameInput.value.trim().match(usernameRegex)) {
    validationMsg +=
      "User Role Name should only contain letters, spaces, or hyphens.\n";
    valid = false;
    userRoleNameInput.style.borderColor = "red";
  } else {
    userRoleNameInput.style.borderColor = ""; // Clear error styling
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
  if (userRoleNameInput.style.borderColor === "red") {
    userRoleNameInput.focus();
  }
};
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  inputValidationMsg.style.display = "none"; // Hide error message
};

userRoleNameInput.addEventListener("input", clearErrorMessages);
modulesCheckbox.addEventListener("click", clearErrorMessages);

let isEditing = false;
const userRoleData = {
  userRoleName: "",
  superUserRoleId: "",
};
const onBtnAdd = () => {
  isEditing = false;
  addUserRoleBtn.innerText = "Add";
  userRoleData.userRoleName = "";
  userRoleData.superUserRoleId = "";

  userRoleNameInput.value = "";
  // Uncheck all checkboxes inside the modal
  const checkboxes = document.querySelectorAll(
    "#userDefinitionModal input[type='checkbox']"
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
};
function handleEdit(rowData) {
  isEditing = true;
  addUserRoleBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData);

  userRoleData.userRoleName = rowData.user_role_name;
  userRoleData.superUserRoleId = rowData.id;

  userRoleNameInput.value = rowData.user_role_name;
  // Uncheck all checkboxes inside the modal first
  const checkboxes = document.querySelectorAll(
    "#userDefinitionModal input[type='checkbox']"
  );
  console.log({ rowData });

  // Check checkboxes that match the module_permitted in rowData
  checkboxes.forEach((checkbox) => {
    const isPermitted = rowData.module_permitted.some(
      (item) => item.module_id == checkbox.value
    );
    checkbox.checked = isPermitted;
  });
}

const handleUserRoleSubmit = async (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }
  const checkedInputs = document.querySelectorAll(
    "#userDefinitionModal input[type='checkbox']:checked"
  );
  const array = Array.from(checkedInputs).map((input) => input.value);
  const selectedValues = Array.from(checkedInputs)
    .map((input) => input.value)
    .join(",");

  if (array.length === 0) {
    inputValidationMsg.textContent = "Please select at least one module.";
    inputValidationMsg.style.display = "block";
    focusOnFirstError();
    return;
  }

  // console.log(
  //   "Selected values:",
  //   selectedValues,
  //   "arr",
  //   array,
  //   "length",
  //   array.length
  // );

  try {
    addUserRoleBtn.disabled = true;
    addUserRoleBtn.innerHTML = spinnerHTML;
    const apiUrl = !isEditing
      ? "https://stingray-app-4smpo.ondigitalocean.app/super-admin-roles/add"
      : "https://stingray-app-4smpo.ondigitalocean.app/super-admin-roles/update";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("userRoleName", userRoleData.userRoleName);
    formData.append("moduleList", selectedValues);

    if (isEditing) {
      formData.append("superUserRoleId", userRoleData.superUserRoleId);
      console.log(userRoleData.superUserRoleId);
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
    addUserRoleBtn.disabled = false;
    addUserRoleBtn.innerHTML = "Add";
  }
};

function closeModal() {
  const modalElement = document.getElementById("userDefinitionModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
const handlechange = (event) => {
  userRoleData[event.target.name] = event.target.value;
};
async function fetchUsers(gridApi) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/super-admin-roles/all/${authToken}`;

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
      module_permitted: item.module_permitted,
      user_role_name: item.user_role_name,
      id: item.id,
    }));
    console.log({ formattedData });

    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
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
      headerName: "Role Type",
      field: "user_role_name",
    },
    {
      headerName: "Access To Screens",
      field: "module_permitted",
      cellRenderer: function (params) {
        return `<div class="d-flex flex-column">
              ${params.data.module_permitted
                .map((item) => `<p style="margin:0px">${item.module_name}</p>`)
                .join("")}  
            </div>`;
      },
      valueGetter: function (params) {
        return params.data.module_permitted
          .map((item) => item.module_name)
          .join(", ");
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
        const isDisabled = params.data.user_role_name === "Admin";
        const buttonHtml = `<button 
                              type="button" 
                              style="margin-top: 10px;" 
                              data-bs-toggle="modal"
                              data-bs-target="#userDefinitionModal"
                              class="btn btn-light" 
                              ${isDisabled ? "disabled" : ""}
                              onclick='handleEdit(${JSON.stringify(
                                params.data
                              )})'
                            >
                              <i class="bi bi-pencil-square"></i>
                            </button>
                          `;
        return buttonHtml;
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
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return params.data.module_permitted.length > 1
      ? params.data.module_permitted.length * 45
      : 80;
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
  const modulesData = await fetchModulesData();

  if (modulesData) {
    console.log("Modusles data:", modulesData);
    modulesData.forEach((customer) => {
      // console.log({ customer });
      const inputElement = document.createElement("input");
      inputElement.type = "checkbox";
      inputElement.value = customer.id;
      inputElement.id = customer.id;
      inputElement.name = customer.file_name;
      inputElement.classList.add("form-check-input");
      const labelElement = document.createElement("label");
      labelElement.htmlFor = customer.id;
      labelElement.textContent = customer.module;
      labelElement.classList.add("form-check-label");
      labelElement.style.margin = "3px 0px 0px 4px";
      const divElement = document.createElement("div");
      divElement.classList.add("form-check");
      divElement.appendChild(inputElement);
      divElement.appendChild(labelElement);
      modulesCheckbox.appendChild(divElement);
    });
  }
});

async function fetchModulesData() {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/super-admin-roles/modules/all/${authToken}`;

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
