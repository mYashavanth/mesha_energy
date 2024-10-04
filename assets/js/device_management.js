const addDeviceBtn = document.getElementById("addDeviceBtn");
const deviceIdinput = document.getElementById("deviceID");
const customerIdSelect = document.getElementById("customerId");
const inputValidationMsg = document.getElementById("inputValidationMsg");
const spinnerHTML = `
    <div class="spinner-border spinner-border-sm" role="status">
      <span class="visually-hidden">Loading...</span>
    </div> Please wait...`;
let gridApi;
const deviceIdRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[A-Za-z0-9]+$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate Device ID
  if (!deviceIdinput.value.trim()) {
    validationMsg += "Device ID cannot be empty.\n";
    valid = false;
    deviceIdinput.style.borderColor = "red";
  } else if (!deviceIdinput.value.trim().match(deviceIdRegex)) {
    validationMsg += "Device ID should only contain letters and numbers.\n";
    valid = false;
    deviceIdinput.style.borderColor = "red";
  } else {
    deviceIdinput.style.borderColor = ""; // Clear error styling
  }

  // Validate customer ID
  if (!customerIdSelect.value.trim()) {
    validationMsg += "customer name cannot be empty.\n";
    valid = false;
    customerIdSelect.style.borderColor = "red";
  } else {
    customerIdSelect.style.borderColor = ""; // Clear error styling
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
  if (deviceIdinput.style.borderColor === "red") {
    deviceIdinput.focus();
  } else if (customerIdSelect.style.borderColor === "red") {
    customerIdSelect.focus();
  }
};
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = ""; // Clear error styling
  inputValidationMsg.style.display = "none"; // Hide error message
};

deviceIdinput.addEventListener("input", function (event) {
  clearErrorMessages(event);
  // convert each letter to upper case
  this.value = this.value.toUpperCase();
});
customerIdSelect.addEventListener("input", clearErrorMessages);
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
const deviceData = {
  deviceDbId: "",
  device_id: "",
  customerId: "",
};
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
      console.log("Customer data:", data, "plese try again");
    } else {
      let arr = data.map((item) => ({
        customerId: item.id,
        customerName: item.customer_name,
      }));
      console.log({ arr });

      customerIdSelect.innerHTML = "";

      const option = document.createElement("option");
      option.value = "";
      option.text = "select customer name";
      option.selected = true;
      customerIdSelect.appendChild(option);

      arr.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.customerId;
        option.text = item.customerName;
        if (item.customerName === deviceData.customerId) {
          option.selected = true;
          deviceData.customerId = item.customerId;
          console.log({ deviceData });
        }
        customerIdSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
}
const onBtnAdd = async () => {
  isEditing = false;
  addDeviceBtn.innerText = "Add";
  deviceData.deviceDbId = "";
  deviceData.device_id = "";
  deviceData.customerId = "";
  deviceIdinput.value = "";
  await fetchCustomerData();
};
function handleEdit(rowData) {
  isEditing = true;
  addDeviceBtn.innerText = "Update";
  console.log("Edit button clicked for:", rowData, "isEditing:", isEditing);
  deviceData.deviceDbId = rowData.id;
  deviceData.device_id = rowData.deviceId;
  deviceData.customerId = rowData.customerName;

  deviceIdinput.value = rowData.deviceId;
  console.log({ deviceData });
  fetchCustomerData();
}
const handleSubmit = async (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!validateInputs()) {
    focusOnFirstError();
    return;
  }

  try {
    addDeviceBtn.disabled = true;
    addDeviceBtn.innerHTML = spinnerHTML;
    const apiUrl = isEditing
      ? "https://stingray-app-4smpo.ondigitalocean.app/device-masters/update"
      : "https://stingray-app-4smpo.ondigitalocean.app/device-masters/add";

    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("device_id", deviceData.device_id);
    formData.append("customerId", deviceData.customerId);

    if (isEditing) {
      formData.append("deviceDbId", deviceData.deviceDbId);
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    console.log("data", data);

    if (data.errFlag === 0) {
      fetchDeviceData(gridApi);
      closeModal();
    } else {
      console.error("Server returned an error:", data);
    }
  } catch (error) {
    console.error("Error occurred during submission:", error);
  } finally {
    addDeviceBtn.disabled = false;
    addDeviceBtn.innerText = "Add";
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
  deviceData[event.target.name] = event.target.value;
};
// Function to fetch data from API
async function fetchDeviceData(gridApi) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/device-masters/all/${authToken}`;

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
      : console.log("device data:", data);

    const formattedData = data.map((item) => ({
      customerName: item.customer_name,
      deviceId: item.device_id,
      createdDate: formatDate(item.created_date),
      status: item.status,
      id: item.id,
      customerId: item.customer_id,
    }));

    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    window.location.href = "login.html";
  }
}

async function toggleStatus(diviceDbId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl =
    "https://stingray-app-4smpo.ondigitalocean.app/device-masters/status";

  const formData = new FormData();
  formData.append("token", authToken);
  formData.append("status", newStatus);
  formData.append("deviceDbId", diviceDbId);

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
      `Status updated successfully for customer ${diviceDbId}:`,
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
      field: "id",
      maxWidth: 100,
      filter: false,
      suppressAutoSize: true,
    },
    {
      headerName: "Device ID",
      field: "deviceId",
    },
    {
      headerName: "Customer Name",
      field: "customerName",
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

  fetchDeviceData(gridApi);
});

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
