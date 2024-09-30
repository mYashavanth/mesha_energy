// Define StatusCellRenderer class
let gridApi;
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
      const success = await toggleStatus(params.data.customerId, newStatus); // Await the API response
      if (success) {
        params.setValue(newStatus); // Update status in grid only if the API call is successful
      } else {
        // Revert checkbox state if the API call fails
        checkbox.checked = !checkbox.checked;
      }
    });
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    // Ensure the checkbox is checked/unchecked based on the value
    const checkbox = this.eGui.querySelector('input[type="checkbox"]');
    checkbox.checked = params.value === 1;
    return true;
  }
}

// Helper function to format date in "dd-mm-yyyy time" format
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
  hours = hours % 12; // Convert to 12-hour format
  hours = hours ? String(hours).padStart(2, "0") : "12"; // If hours is 0, set to 12

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`; // Include AM/PM
}
let isEditing = false;
const customerData = {
  id: "",
  CustomerName: "",
  companyAddress: "",
};
const onBtnAdd = () => {
  isEditing = false;
  customerData.id = "";
  customerData.CustomerName = "";
  customerData.companyAddress = "";
  const customerInput = document.getElementById("customerName");
  const companyAddressInput = document.getElementById("companyAddress");
  customerInput.value = "";
  companyAddressInput.value = "";
};
// Function to handle editing
function handleEdit(rowData) {
  isEditing = true;
  console.log("Edit button clicked for:", rowData);
  const customerInput = document.getElementById("customerName");
  const companyAddressInput = document.getElementById("companyAddress");

  customerInput.value = rowData.customerName;
  companyAddressInput.value = rowData.companyAddress;
  console.log({
    name: rowData.customerName,
    address: rowData.companyAddressm,
    id: rowData.customerId,
  });
  customerData.id = rowData.customerId;
  customerData.CustomerName = rowData.customerName;
  customerData.companyAddress = rowData.companyAddress;
}
const handleSubmit = (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!isEditing) {
    const apiUrl =
      "https://stingray-app-4smpo.ondigitalocean.app/customers/add";
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("customer", customerData.CustomerName);
    formData.append("customerAddress", customerData.companyAddress);
    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data.errFlag === 0) {
          console.log("data", data);
          fetchCustomerData(gridApi);
          closeModal();
        }
      });
  } else {
    console.log({ authToken });
    const apiUrl =
      "https://stingray-app-4smpo.ondigitalocean.app/customers/update";
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("customer", customerData.CustomerName);
    formData.append("customerAddress", customerData.companyAddress);
    formData.append("customerId", customerData.id);
    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data.errFlag === 0) {
          console.log("data", data);
          fetchCustomerData(gridApi);
          closeModal();
        }
      });
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
// Function to fetch data from API
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

    console.log("Customer data:", data);

    // Format the data for ag-Grid
    const formattedData = data.map((item) => ({
      customerName: item.customer_name,
      companyAddress: item.company_address,
      createdDate: formatDate(item.created_date), // Format date here
      devicesTagged: [], // Since the actual data doesn't have this field, default it to an empty array
      status: item.status,
      customerId: item.id,
    }));

    // Update ag-Grid row data
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
}

// Function to toggle status and make API call
async function toggleStatus(customerId, newStatus) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl =
    "https://stingray-app-4smpo.ondigitalocean.app/customers/status";

  const formData = new FormData();
  formData.append("token", authToken); // Add the token
  formData.append("status", newStatus); // Add the new status
  formData.append("customerId", customerId); // Add the customer ID

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
      return true; // Indicate success
    }
    return false;
  } catch (error) {
    console.error("Error updating customer status:", error);
    return false; // Indicate failure
  }
}

// Define gridOptions after StatusCellRenderer class is defined
const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      headerName: "Sl. No", // Serial number column
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
      field: "createdDate", // Use the formatted date field
      filter: "agDateColumnFilter", // Enable date filter
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          cellValue = cellValue.split(" ")[0];
          const dateParts = cellValue.split("-");
          const year = Number(dateParts[2]);
          const month = Number(dateParts[1]) - 1; // Months are zero-based in JS
          const day = Number(dateParts[0]);
          const cellDate = new Date(year, month, day);
          // Compare dates
          if (cellDate < filterLocalDateAtMidnight) {
            return -1; // cell value is before the filter date
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1; // cell value is after the filter date
          } else {
            return 0; // dates are equal
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
      cellRenderer: StatusCellRenderer, // Use custom renderer
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
    // give permission to copy dat form each cell
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
  paginationPageSize: 5,
  paginationPageSizeSelector: [5, 10, 15],
  suppressExcelExport: true,
};

// Initialize the grid after DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  // Fetch customer data after initializing the grid
  fetchCustomerData(gridApi);
});

// Function to export grid data to CSV
function onBtnExport() {
  gridApi.exportDataAsCsv();
}
