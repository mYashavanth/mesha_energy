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
  userData.username = "";
  userData.email = "";
  userData.password = "";

  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  usernameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
};
function handleEdit(rowData) {
  isEditing = true;
  console.log("Edit button clicked for:", rowData);
  userData.super_admin_id = rowData.id;
  userData.username = rowData.userName;
  userData.email = rowData.email;
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  usernameInput.value = rowData.userName;
  emailInput.value = rowData.email;
  passwordInput.value = "";
}
const handleUserSubmit = (event) => {
  event.preventDefault();
  const authToken = localStorage.getItem("authToken");

  if (!isEditing) {
    const apiUrl =
      "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/add";
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data.errFlag === 0) {
          console.log("data", data);
          fetchSuperAdminUsers(gridApi);
          closeModal();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    console.log({ authToken });
    const apiUrl =
      "https://stingray-app-4smpo.ondigitalocean.app/super-admin-users/update";
    const formData = new FormData();
    formData.append("token", authToken);
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("super_admin_id", userData.super_admin_id);

    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        if (data.errFlag === 0) {
          console.log("data", data);
          fetchSuperAdminUsers(gridApi);
          closeModal();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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

    console.log("Customer data:", data);

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
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return 80;
  },
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 30],
  suppressExcelExport: true,
};

document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  fetchSuperAdminUsers(gridApi);
});

function onBtnExport() {
  gridApi.exportDataAsCsv();
}
