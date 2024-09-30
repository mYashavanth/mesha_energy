// Define StatusCellRenderer class
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

    checkbox.addEventListener("change", () => {
      const newStatus = checkbox.checked ? 1 : 0;
      params.setValue(newStatus); // Update status in grid
      toggleStatus(params.node.id, newStatus); // Handle status change
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
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

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

    // Format the data for ag-Grid
    const formattedData = data.map((item) => ({
      customerName: item.customer_name,
      companyAddress: item.company_address,
      createdDate: formatDate(item.created_date), // Format date here
      devicesTagged: [], // Since the actual data doesn't have this field, default it to an empty array
      status: item.status,
    }));

    // Update ag-Grid row data
    gridApi.setGridOption("rowData", formattedData);
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
}

// Define gridOptions after StatusCellRenderer class is defined
const gridOptions = {
  rowData: [],
  columnDefs: [
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
      filter: false,
      sortable: true,
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
      sortable: false,
      cellRenderer: StatusCellRenderer, // Use custom renderer
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      sortable: false,
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

// Function to handle editing
function handleEdit(rowData) {
  console.log("Edit button clicked for:", rowData);
}

// Toggle status function to handle changes
function toggleStatus(rowId, newStatus) {
  const rowNode = gridApi.getRowNode(rowId);
  rowNode.setDataValue("status", newStatus);

  // Optionally send an API request to persist the change
  console.log(`Status for row ${rowId} changed to ${newStatus}`);
}

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
