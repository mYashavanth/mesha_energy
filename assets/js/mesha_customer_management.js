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

const gridOptions = {
  rowData: [
    {
      customerName: "John Doe",
      companyAddress: "123 Main St, New York, NY",
      devicesTagged: ["Device A", "Device B", "Device C"],
      status: 1,
    },
    {
      customerName: "Jane Smith",
      companyAddress: "456 Elm St, Los Angeles, CA",
      devicesTagged: ["Device X", "Device Y"],
      status: 0,
    },
    {
      customerName: "Michael Johnson",
      companyAddress: "789 Maple Ave, Chicago, IL",
      devicesTagged: ["Device P", "Device Q", "Device R", "Device S"],
      status: 1,
    },
    {
      customerName: "Emily Davis",
      companyAddress: "101 Pine Rd, Austin, TX",
      devicesTagged: ["Device M", "Device N"],
      status: 1,
    },
    {
      customerName: "Chris Brown",
      companyAddress: "202 Oak St, Miami, FL",
      devicesTagged: ["Device G", "Device H", "Device I"],
      status: 0,
    },
  ],

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
function handleEdit(rowData) {
  console.log("Edit button clicked for:", rowData);
}

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
// Toggle status function to handle changes
function toggleStatus(rowId, newStatus) {
  const rowNode = gridApi.getRowNode(rowId);
  rowNode.setDataValue("status", newStatus);

  // Optionally send an API request to persist the change
  console.log(`Status for row ${rowId} changed to ${newStatus}`);
}

// Initialize the grid
document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);
});
