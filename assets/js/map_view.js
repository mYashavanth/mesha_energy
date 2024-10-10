let gridApi;
function convertDateFormat(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
function convertToDecimalDegrees(coordinate) {
  const degrees = Math.floor(coordinate / 100);
  const minutes = coordinate - degrees * 100;

  const decimalDegrees = degrees + minutes / 60;

  return decimalDegrees;
}
async function fetchAllDevicesData(customerId) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/devices/all/${customerId}/${authToken}`;

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
    } else {
      console.log("device data:", data);
      const formattedData = data.map((item) => ({
        deviceId: item.device_id,
        deviceLogDate: convertDateFormat(item.device_log_date),
        lat: convertToDecimalDegrees(Number(item.lat)),
        long: convertToDecimalDegrees(Number(item.long)),
        speed: item.speed,
        temperature: item.temperature,
        v1: item.v1,
        v2: item.v2,
        v3: item.v3,
        v4: item.v4,
        bankVoltage: (
          Number(item.v1) +
          Number(item.v2) +
          Number(item.v3) +
          Number(item.v4)
        ).toFixed(2),
        time: item.latest_updated_time,
        current: item.current,
      }));
      console.log("formattedData:", formattedData);

      gridApi.setGridOption("rowData", formattedData);
    }
  } catch (error) {
    console.error("Error fetching device data:", error);
    window.location.href = "login.html";
  }
}
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

document.addEventListener("DOMContentLoaded", async function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);
  const customerId = document.getElementById("customerId");
  const customerData = await fetchCustomerData();

  if (customerData) {
    console.log("Customer data:", customerData);

    customerData.forEach((customer) => {
      const option = document.createElement("option");
      option.value = customer.id;
      option.textContent = customer.customer_name;
      customerId.appendChild(option);
    });
    const storedCustomerId = localStorage.getItem("selectedCustomerId");
    console.log({
      "storedCustomerId:": storedCustomerId,
      customerData: customerData,
    });

    if (
      storedCustomerId &&
      customerData.some((customer) => customer.id == storedCustomerId)
    ) {
      customerId.value = storedCustomerId;
    } else {
      customerId.value = customerData[0].id;
      localStorage.setItem("selectedCustomerId", customerData[0].id);
    }

    const initialCustomerId = customerId.value;
    await fetchAllDevicesData(initialCustomerId);

    let intervalId = setInterval(async () => {
      await fetchAllDevicesData(customerId.value);
    }, 30000);

    customerId.addEventListener("change", async function () {
      const selectedCustomerId = this.value;
      localStorage.setItem("selectedCustomerId", selectedCustomerId);

      await fetchAllDevicesData(selectedCustomerId);

      clearInterval(intervalId);
      intervalId = setInterval(async () => {
        await fetchAllDevicesData(selectedCustomerId);
      }, 30000);
    });
  }
});
const gridOptions = {
  rowData: [
    {
      bankVoltage: "55.84",
      deviceId: "MESH0002",
      deviceLogDate: "09/10/2024",
      lat: 28.32406,
      long: 77.819845,
      speed: "0",
      temperature: "37",
      time: "23:38",
      v1: "14.12",
      v2: "13.90",
      v3: "13.92",
      v4: "13.90",
      current: "5.5",
    },
  ],
  columnDefs: [
    {
      headerName: "Device ID",
      field: "deviceId",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Status",
      field: "status",
      maxWidth: 100,
      cellRenderer: () => {
        return `<span style="color: green; font-weight: bold; border: 1px solid green; padding: 5px; border-radius: 5px; background-color: rgb(213, 255, 213)">Active</span>`;
      },
      sortable: false,
      filter: false,
    },
    {
      headerName: "B1",
      field: "v1",
      maxWidth: 80,
    },
    {
      headerName: "B2",
      field: "v2",
      maxWidth: 80,
    },
    {
      headerName: "B3",
      field: "v3",
      maxWidth: 80,
    },
    {
      headerName: "B4",
      field: "v4",
      maxWidth: 80,
    },
    {
      headerName: "Bank Voltage",
      field: "bankVoltage",
      maxWidth: 80,
    },
    {
      headerName: "A",
      field: "current",
      maxWidth: 80,
    },
    {
      headerName: "Distance",
      field: "deviceId",
      cellRenderer: (params) => {
        const cellDiv = document.createElement("div");
        cellDiv.innerHTML = "Loading...";

        const deviceId = params.value;
        const authToken = localStorage.getItem("authToken");
        const distanceApiUrl = `https://stingray-app-4smpo.ondigitalocean.app/distance-travelled/${deviceId}/${authToken}`;

        fetch(distanceApiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            return response.json();
          })
          .then((result) => {
            console.log({ result });

            // Once we get the data, update the cell content
            cellDiv.innerHTML = `${result[0].distance_in_kms} km`;
          })
          .catch((error) => {
            console.error("Error fetching distance:", error);
            cellDiv.innerHTML = "Error";
          });

        return cellDiv;
      },
    },
    {
      headerName: "T",
      field: "temperature",
      maxWidth: 70,
    },
    {
      headerName: "Date & Time",
      field: "deviceLogDate",
      valueGetter: (params) => {
        // Format date and time in dd/mm/yyyy - time
        const date = params.data.deviceLogDate;
        const time = params.data.time;
        return `${date} - ${time}`;
      },
    },
    {
      headerName: "Location",
      field: "location",
      maxWidth: 100,
      cellRenderer: (params) => {
        const lat = params.data.lat;
        const long = params.data.long;
        return `<button onclick="consoleLocation(${lat}, ${long})">View</button>`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      maxWidth: 100,
      cellRenderer: (params) => {
        const deviceId = params.data.deviceId;
        return `<button onclick="consoleDeviceId('${deviceId}')">Action</button>`;
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
};

// Helper functions for button actions
function consoleLocation(lat, long) {
  console.log("Latitude:", lat, "Longitude:", long);
}

function consoleDeviceId(deviceId) {
  console.log("Device ID:", deviceId);
}
