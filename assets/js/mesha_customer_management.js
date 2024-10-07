const addCustomerBtn = document.getElementById("addCustomerBtn");
const customerInput = document.getElementById("customerName");
const companyAddressInput = document.getElementById("companyAddress");
const inputValidationMsg = document.getElementById("inputValidationMsg");
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
    validationMsg += "Username cannot be empty.\n";
    valid = false;
    customerInput.style.borderColor = "red";
  } else if (!customerInput.value.trim().match(usernameRegex)) {
    validationMsg +=
      "Username should only contain letters, spaces, or hyphens.\n";
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
        <input type="checkbox" class="checkbox" ${isChecked}>
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

    const formattedData = data.map((item) => ({
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
    return false;
  }
}

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No",
      field: "customerId",
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
      sortable: false,
      maxWidth: 150,
      suppressAutoSize: true,
      cellRenderer: StatusCellRenderer,
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

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
// function onBtnExport() {
//   gridApi.exportDataAsCsv({
//     processCellCallback: (params) => {
//       if (params.column.getColId() === "status") {
//         return params.value === 1
//           ? "Active"
//           : params.value === 0
//           ? "Inactive"
//           : params.value;
//       }
//       return params.value;
//     },
//   });
// }
