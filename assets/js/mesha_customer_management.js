const addCustomerBtn = document.getElementById("addCustomerBtn");
const customerInput = document.getElementById("customerName");
const companyAddressInput = document.getElementById("companyAddress");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const voltageInputValidationMsg = document.getElementById(
  "voltageInputValidationMsg"
);
const spinnerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Please wait...`;
let gridApi;
const usernameRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[A-Za-z\s-]+$/;
const addressRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console)).*[A-Za-z0-9\s.,/-]+$/;
const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate username
  if (!customerInput.value.trim()) {
    validationMsg += "Customer name cannot be empty.\n";
    valid = false;
    customerInput.style.borderColor = "red";
  } else if (!customerInput.value.trim().match(usernameRegex)) {
    validationMsg +=
      "Customer name should only contain letters, spaces, or hyphens.\n";
    valid = false;
    customerInput.style.borderColor = "red";
  } else {
    customerInput.style.borderColor = ""; // Clear error styling
  }

  // validate address
  if (!companyAddressInput.value.trim()) {
    validationMsg += "Address cannot be empty.\n";
    valid = false;
    companyAddressInput.style.borderColor = "red";
  } else if (!companyAddressInput.value.trim().match(addressRegex)) {
    validationMsg += "Address should not contain special characters.\n";
    valid = false;
    companyAddressInput.style.borderColor = "red";
  } else {
    companyAddressInput.style.borderColor = ""; // Clear error styling
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
const voltageGroups = [
  {
    low: document.getElementById("v1_low"),
    high: document.getElementById("v1_high"),
  },
  {
    low: document.getElementById("v2_low"),
    high: document.getElementById("v2_high"),
  },
  {
    low: document.getElementById("v3_low"),
    high: document.getElementById("v3_high"),
  },
  {
    low: document.getElementById("v4_low"),
    high: document.getElementById("v4_high"),
  },
];

const validateVoltageInputs = () => {
  let valid = true;
  let validationMsg = "";

  const numberRegex = /^-?\d+(\.\d+)?$/; // Regex to match positive/negative numbers with decimal

  // Loop through each voltage group
  voltageGroups.forEach((group) => {
    const lowValue = group.low.value.trim();
    const highValue = group.high.value.trim();
    const lowId = group.low.id; // Get the id of the low input
    const highId = group.high.id; // Get the id of the high input

    // Check if low or high value is empty
    if (!lowValue) {
      validationMsg += `${lowId} cannot be empty.\n`;
      valid = false;
      group.low.style.borderColor = "red";
    } else if (!numberRegex.test(lowValue)) {
      validationMsg += `${lowId} must be a valid number.\n`;
      valid = false;
      group.low.style.borderColor = "red";
    } else {
      group.low.style.borderColor = ""; // Clear error styling
    }

    if (!highValue) {
      validationMsg += `${highId} cannot be empty.\n`;
      valid = false;
      group.high.style.borderColor = "red";
    } else if (!numberRegex.test(highValue)) {
      validationMsg += `${highId} must be a valid number.\n`;
      valid = false;
      group.high.style.borderColor = "red";
    } else {
      group.high.style.borderColor = ""; // Clear error styling
    }

    // Check if low value is less than high value
    if (
      numberRegex.test(lowValue) &&
      numberRegex.test(highValue) &&
      parseFloat(lowValue) >= parseFloat(highValue)
    ) {
      validationMsg += `${lowId} should be less than ${highId}.\n`;
      valid = false;
      group.low.style.borderColor = "red";
      group.high.style.borderColor = "red";
    }
  });

  // Display or clear validation message
  if (validationMsg) {
    voltageInputValidationMsg.innerText = validationMsg;
    voltageInputValidationMsg.style.display = "block"; // Show message
  } else {
    voltageInputValidationMsg.style.display = "none"; // Hide message if valid
  }

  return valid;
};
let voltageGroupsErrors = voltageGroups.reverse();
const focusOnVoltageFirstError = () => {
  voltageGroupsErrors.forEach((group, index) => {
    console.log({ group });

    if (group.low.style.borderColor === "red") {
      group.low.focus();
    } else if (group.high.style.borderColor === "red") {
      group.high.focus();
    }
  });
};
const voltageData = {
  customerId: "",
  v1_low: "",
  v1_high: "",
  v2_low: "",
  v2_high: "",
  v3_low: "",
  v3_high: "",
  v4_low: "",
  v4_high: "",
};
const handleVoltagechange = (event) => {
  voltageData[event.target.name] = event.target.value;
};
function setThreshold(rowData) {
  console.log(rowData.customerId);
  const customerId = rowData.customerId;
  const authToken = localStorage.getItem("authToken");
  const voltageApiUrl = `https://stingray-app-4smpo.ondigitalocean.app/voltage-settings/${customerId}/${authToken}`;

  // Clear all fields initially
  voltageGroups.forEach((group) => {
    group.low.value = "";
    group.high.value = "";
  });

  // Make the API call
  fetch(voltageApiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((voltageData) => {
      // Check if the array is empty
      if (voltageData.length === 0) {
        return; // Leave the fields as empty
      }

      // Set values for each voltage group
      const voltageSettings = voltageData[0];
      voltageGroups.forEach((group, index) => {
        group.low.value = voltageSettings[`v${index + 1}_low`] || "";
        group.high.value = voltageSettings[`v${index + 1}_high`] || "";
      });
    })
    .catch((error) => {
      console.error("Error fetching voltage settings:", error);
      // Handle error if necessary, but fields remain empty
    });
}
const handleVoltageSubmit = async (event) => {
  event.preventDefault();

  // Run validation
  if (validateVoltageInputs()) {
    try {
      const apiUrl =
        "https://stingray-app-4smpo.ondigitalocean.app/voltage-settings";

      const authToken = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("v1L", voltageData.v1_low);
      formData.append("v1H", voltageData.v1_high);
      formData.append("v2L", voltageData.v2_low);
      formData.append("v2H", voltageData.v2_high);
      formData.append("v3L", voltageData.v3_low);
      formData.append("v3H", voltageData.v3_high);
      formData.append("v4L", voltageData.v4_low);
      formData.append("v4H", voltageData.v4_high);
      formData.append("token", authToken);
      formData.append("customerId", voltageData.customerId);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log({ data });
      if (data.errFlag === 0) {
        triggerToast("Threshold updated successfully!", "success");
        closeVoltageModal();
      } else {
        triggerToast("Not authorized", "error");
        closeVoltageModal();
      }
    } catch (error) {
      console.error("Error updating voltage settings:", error);
    }
  } else {
    focusOnVoltageFirstError();
    console.log("Validation failed.");
  }
};

const clearVoltageError = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  voltageInputValidationMsg.style.display = "none"; // Hide error message
};
voltageGroups.forEach((group, index) => {
  group.low.addEventListener("input", clearVoltageError);
  group.high.addEventListener("input", clearVoltageError);
});

// Focus on the first invalid field
const focusOnFirstError = () => {
  if (customerInput.style.borderColor === "red") {
    customerInput.focus();
  } else if (companyAddressInput.style.borderColor === "red") {
    companyAddressInput.focus();
  }
};
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  inputValidationMsg.style.display = "none"; // Hide error message
};

customerInput.addEventListener("input", clearErrorMessages);
companyAddressInput.addEventListener("input", clearErrorMessages);
class StatusCellRenderer {
  init(params) {
    this.eGui = document.createElement("div");
    const isChecked = params.value === 1 ? "checked" : "";

    this.eGui.innerHTML = `
      <label class="switch">
        <input id=${params.data.customerId} type="checkbox" class="checkbox" ${isChecked}>
        <div class="slider"></div>
      </label>`;

    const checkbox = this.eGui.querySelector('input[type="checkbox"]');

    checkbox.addEventListener("change", async () => {
      const newStatus = checkbox.checked ? 1 : 0;
      const success = await toggleStatus(params.data.customerId, newStatus);
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
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, "0") : "12";

  // ${hours}:${minutes} ${ampm}`; // Include tiem
  return `${day}-${month}-${year}`;
}
let isEditing = false;
const customerData = {
  id: "",
  CustomerName: "",
  companyAddress: "",
};
const onBtnAdd = () => {
  isEditing = false;
  addCustomerBtn.innerText = "Add";
  customerData.id = "";
  customerData.CustomerName = "";
  customerData.companyAddress = "";
  customerInput.value = "";
  companyAddressInput.value = "";
};
function handleEdit(rowData) {
  isEditing = true;
  addCustomerBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData);
  customerInput.value = rowData.customerName;
  companyAddressInput.value = rowData.companyAddress;
  customerData.id = rowData.customerId;
  customerData.CustomerName = rowData.customerName;
  customerData.companyAddress = rowData.companyAddress;
}
const handleSubmit = async (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");
  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }
  try {
    addCustomerBtn.disabled = true;
    addCustomerBtn.innerHTML = spinnerHTML;
    const apiUrl = isEditing
      ? "https://stingray-app-4smpo.ondigitalocean.app/customers/update"
      : "https://stingray-app-4smpo.ondigitalocean.app/customers/add";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("customer", customerData.CustomerName);
    formData.append("customerAddress", customerData.companyAddress);

    if (isEditing) {
      formData.append("customerId", customerData.id);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("data", data);

    if (data.errFlag === 0) {
      fetchCustomerData(gridApi);
      closeModal();
    } else {
      console.error("Server returned an error:", data);
    }
  } catch (error) {
    console.error("Error occurred during submission:", error);
  } finally {
    addCustomerBtn.disabled = false;
    addCustomerBtn.innerHTML = "Add";
  }
};

function closeModal() {
  const modalElement = document.getElementById("staticBackdrop");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
function closeVoltageModal() {
  const modalElement = document.getElementById("ThresholdModal");
  const modal = bootstrap.Modal.getInstance(modalElement);
  if (modal) {
    modal.hide();
  }
}
const handlechange = (event) => {
  customerData[event.target.name] = event.target.value;
};
async function fetchCustomerData(gridApi) {
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

    data.errFlag === 1
      ? (window.location.href = "login.html")
      : console.log("Customer data:", data);

    const formattedData = data.map((item, index) => ({
      index: index + 1,
      customerName: item.customer_name,
      companyAddress: item.company_address,
      createdDate: formatDate(item.created_date),
      devicesTagged: [],
      status: item.status,
      customerId: item.id,
    }));

    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
  }
}

async function toggleStatus(customerId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl =
    "https://stingray-app-4smpo.ondigitalocean.app/customers/status";

  const formData = new FormData();
  formData.append("token", authToken);
  formData.append("status", newStatus);
  formData.append("customerId", customerId);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `Status updated successfully for customer ${customerId}:`,
      result
    );
    if (result.errFlag === 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating customer status:", error);
    triggerToast(
      "Please check your internet connection and try again.",
      "error"
    );
    return false;
  }
}
function triggerToast(message, type = "error") {
  const toastElement = document.getElementById("toastNotification");
  const toastMessageElement = document.getElementById("toastMessage");

  // Set the message text
  toastMessageElement.textContent = message;

  // Remove any existing background class and add the appropriate one
  toastElement.classList.remove("bg-danger", "bg-success");
  if (type === "success") {
    toastElement.classList.add("bg-success");
  } else {
    toastElement.classList.add("bg-danger");
  }

  // Show the toast
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
      headerName: "Customer Name",
      field: "customerName",
    },
    {
      headerName: "Company Address",
      field: "companyAddress",
    },
    {
      headerName: "Devices Tagged",
      field: "devicesTagged",
      valueFormatter: function (params) {
        return params.value.join(", ");
      },
      cellRenderer: function (params) {
        return `<div>
              <ol>
                ${params.value.map((item) => `<li>${item}</li>`).join("")}
              </ol>
            </div>`;
      },
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
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: "Set Threshold",
      field: "id",
      filter: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellStyle: { textAlign: "center" },
      cellRenderer: function (params) {
        return `<button 
                  type="button" 
                  style="margin-top:10px;" 
                  data-bs-toggle="modal"
                  data-bs-target="#ThresholdModal"
                  class="btn btn-light" 
                  onclick='setThreshold(${JSON.stringify(params.data)})'
                >
                  <i class="bi bi-plus-circle"></i>
                </button>`;
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
                  data-bs-target="#staticBackdrop"
                  class="btn btn-light" 
                  onclick='handleEdit(${JSON.stringify(params.data)})'
                >
                  <i class="bi bi-pencil-square"></i>
                </button>`;
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
    return params.data.devicesTagged.length > 1
      ? params.data.devicesTagged.length * 45
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

  fetchCustomerData(gridApi);
});

// function onBtnExport() {
//   gridApi.exportDataAsCsv();
// }
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
