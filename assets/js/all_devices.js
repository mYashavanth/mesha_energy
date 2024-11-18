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
      const formattedData = data.map((item, index) => ({
        index: index + 1,
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
  rowData: [],
  columnDefs: [
    {
      headerName: "Device ID",
      field: "deviceId",
      sortable: true,
      filter: true,
      maxWidth: 150,
      onCellClicked: (params) => {
        // Store the deviceId in local storage
        localStorage.setItem("selectedDeviceId", params.value);

        // Redirect to index.html
        window.location.href = "index.html";
      },
    },
    {
      headerName: "Status",
      field: "status",
      filter: false,
      sortable: false,
      maxWidth: 100,
      cellRenderer: (params) => {
        const deviceLogDate = params.data.deviceLogDate; // e.g., "09/10/2024"
        const logTime = params.data.time; // e.g., "23:38"

        // Get the current date and time components separately
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // months are 0-based
        const currentDay = currentDate.getDate();
        const currentHours = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();

        // Parse the deviceLogDate and time separately
        const [logDay, logMonth, logYear] = deviceLogDate
          .split("/")
          .map(Number); // "MM/DD/YYYY" format
        const [logHours, logMinutes] = logTime.split(":").map(Number); // "HH:MM" format

        let statusText = "Online";
        let backgroundColor = "rgb(213, 255, 213)"; // Green background

        // Compare the dates
        if (
          logYear < currentYear ||
          (logYear === currentYear && logMonth < currentMonth) ||
          (logYear === currentYear &&
            logMonth === currentMonth &&
            logDay < currentDay)
        ) {
          // Device date is in the past
          statusText = "Offline";
          backgroundColor = "#EFEFEF";
        } else if (
          logYear === currentYear &&
          logMonth === currentMonth &&
          logDay === currentDay
        ) {
          // If the date is today, compare the times
          const timeDifference =
            (currentHours - logHours) * 60 + (currentMinutes - logMinutes); // difference in minutes

          if (timeDifference >= 5) {
            statusText = "Offline";
            backgroundColor = "#EFEFEF";
          }
        }

        return `<span style="color: ${
          statusText === "Online" ? "#0D5E36" : "gray"
        };  border: 1px solid ${
          statusText === "Online" ? "#0D5E36" : "gray"
        }; padding: 5px; border-radius: 5px; background-color: ${backgroundColor}">${statusText}</span>`;
      },
    },
    {
      headerName: "Alert",
      field: "alert",
      maxWidth: 70,
      filter: false,
      sortable: false,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        const customerId = localStorage.getItem("selectedCustomerId");
        const authToken = localStorage.getItem("authToken");
        const voltageApiUrl = `https://stingray-app-4smpo.ondigitalocean.app/voltage-settings/${customerId}/${authToken}`;
        const alertDiv = document.createElement("div");

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
            // Check if voltageData is empty or undefined
            if (!voltageData || voltageData.length === 0) {
              // If empty, display a gray circle
              alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
              return;
            }

            const voltageSettings = voltageData[0];
            const { v1, v2, v3, v4 } = params.data;
            const checkAlert = (value, low, high) =>
              value < parseFloat(low) || value > parseFloat(high);

            const isAlert = [
              checkAlert(v1, voltageSettings.v1_low, voltageSettings.v1_high),
              checkAlert(v2, voltageSettings.v2_low, voltageSettings.v2_high),
              checkAlert(v3, voltageSettings.v3_low, voltageSettings.v3_high),
              checkAlert(v4, voltageSettings.v4_low, voltageSettings.v4_high),
            ].some(Boolean);

            const allZero = [
              "v1_high",
              "v1_low",
              "v2_high",
              "v2_low",
              "v3_high",
              "v3_low",
              "v4_high",
              "v4_low",
            ].every((key) => parseFloat(voltageSettings[key]) === 0);

            if (allZero) {
              alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: gray; border-radius: 50%;"></span>`;
            } else {
              alertDiv.innerHTML = `<span style="display: inline-block; width: 12px; height: 12px; background-color: ${
                isAlert ? "red" : "green"
              }; border-radius: 50%;"></span>`;
            }
          })
          .catch((error) => {
            console.error("Error fetching voltage settings:", error);
            alertDiv.innerHTML = `<span style="color: red;">Error</span>`;
          });

        return alertDiv;
      },
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
      filter: false,
      sortable: false,
      maxWidth: 130,
    },
    {
      headerName: "A",
      field: "current",
      maxWidth: 80,
    },
    {
      headerName: "Distance",
      field: "deviceId",
      maxWidth: 130,
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
      cellRenderer: (params) => {
        const date = params.data.deviceLogDate;
        const time = params.data.time;
        // Use <br> for a line break between date and time
        return `${date} <br> ${time}`;
      },
      filter: "agDateColumnFilter",
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const date = cellValue.split(" <br> ")[0]; // Extract date part only for comparison
          const dateParts = date.split("/");
          const day = Number(dateParts[0]);
          const month = Number(dateParts[1]) - 1;
          const year = Number(dateParts[2]);
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
      headerName: "Location",
      field: "location",
      filter: false,
      sortable: false,
      maxWidth: 100,
      cellRenderer: (params) => {
        const lat = params.data.lat;
        const long = params.data.long;
        return `<button 
              type="button"
              class="btn btn-outline-success btn-sm mt-2"
              onclick="openMapModal(${lat}, ${long})"
            >View</button>`;
      },
    },
    {
      headerName: "Action",
      field: "action",
      filter: false,
      sortable: false,
      maxWidth: 100,
      cellRenderer: (params) => {
        const deviceId = params.data.deviceId;
        return `<button
                  type="button"
                  class="btn btn-light mt-2"
                  data-bs-toggle="modal"
                  data-bs-target="#dateModal"
                  onclick="setDeviceId('${deviceId}')"
                >
                <i class="bi bi-download"></i>
                </button>`;
      },
    },
  ],

  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    // floatingFilter: true,
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
function openMapModal(lat, lng) {
  const mapModal = new bootstrap.Modal(document.getElementById("mapModal"));

  mapModal.show();

  document.getElementById("mapModal").addEventListener(
    "shown.bs.modal",
    function () {
      initMap(lat, lng);
    },
    { once: true }
  );
}
function initMap(lat, lng) {
  const location = { lat: lat, lng: lng };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: location,
  });

  const icon = {
    url: "https://i.postimg.cc/76gy7c3M/auto.png",
    scaledSize: new google.maps.Size(48, 48),
  };

  const marker = new google.maps.Marker({
    position: location,
    map: map,
    icon: icon,
  });
}

function setDeviceId(deviceId) {
  console.log("Device ID:", deviceId);
  document.getElementById("deviceId").value = deviceId;
  localStorage.setItem("selectedDeviceId", deviceId);
}

document.addEventListener("DOMContentLoaded", async function () {
  const deviceIdSelect = document.getElementById("deviceId");

  let deviceIdDetais = await fetchDeviceData();
  if (deviceIdDetais) {
    console.log("deviceIdDetais", deviceIdDetais);

    deviceIdDetais.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.device_id;
      option.text = device.device_id;
      deviceIdSelect.appendChild(option);
    });

    const storedDeviceId = localStorage.getItem("selectedDeviceId");
    if (
      storedDeviceId &&
      deviceIdDetais.some((device) => device.device_id === storedDeviceId)
    ) {
      deviceIdSelect.value = storedDeviceId;
    } else {
      deviceIdSelect.value = deviceIdDetais[0].device_id;
      localStorage.setItem("selectedDeviceId", deviceIdDetais[0].device_id);
    }

    deviceIdSelect.addEventListener("change", async function () {
      const selectedDeviceId = this.value;
      localStorage.setItem("selectedDeviceId", selectedDeviceId);
    });
  }
});
async function fetchDeviceData() {
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

    if (data.errFlag === 1) {
      window.location.href = "login.html";
      return null;
    } else {
      console.log("device data:", data);
      return data;
    }
  } catch (error) {
    console.error("Error fetching device data:", error);
    window.location.href = "login.html";
    return null;
  }
}
const errorMsg = document.getElementById("inputValidationMsg");
let selectedDates = [];

// Initialize Flatpickr for range selection with a 10-day limit
flatpickr("#dateRange", {
  mode: "range",
  inline: true,
  dateFormat: "Y-m-d",
  theme: "material_green",
  onChange: function (dates) {
    // Limit the range to 10 days
    if (dates.length === 2) {
      const diff = Math.ceil((dates[1] - dates[0]) / (1000 * 60 * 60 * 24));
      if (diff > 30) {
        // alert("Please select a range of up to 10 days.");
        errorMsg.textContent = "Please select a range of up to 30 days.";
        toClearErrorMsg();
        this.clear(); // Clears the selected dates
      }
    }
    selectedDates = dates;
  },
});

// Function to format date as YYYY-MM-DD in local time zone
function formatDateToLocal(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Month is zero-indexed
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}
var errorTimeout;
function toClearErrorMsg() {
  clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    errorMsg.textContent = "";
  }, 5000);
}

// Function to handle the download
function handleDownload(downloadType) {
  const selectedId = document.getElementById("deviceId").value;
  const authToken = localStorage.getItem("authToken");

  if (selectedDates.length === 2 && selectedId && authToken) {
    const fromDate = formatDateToLocal(selectedDates[0]);
    const toDate = formatDateToLocal(selectedDates[1]);

    let downloadUrl = "";

    // Determine the URL based on the button clicked (1 for Date Range, 2 for Charging/Discharging)
    if (downloadType === 1) {
      downloadUrl = `https://stingray-app-4smpo.ondigitalocean.app/download/csv/date-range/${selectedId}/${fromDate}/${toDate}/${authToken}`;
    } else if (downloadType === 2) {
      downloadUrl = `https://stingray-app-4smpo.ondigitalocean.app/download/charge_discharge/csv/date-range/${selectedId}/${fromDate}/${toDate}/${authToken}`;
    }

    // Create a hidden anchor element and trigger the download
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "report.csv"; // The filename can be customized if needed
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } else {
    // alert("Please select a date range, ID, and ensure you're authenticated.");
    errorMsg.textContent =
      "Please select a Device ID, Date Range, and ensure you're Authenticated.";
    toClearErrorMsg();
  }
}

// Attach event listeners for the download buttons
document.getElementById("download1").addEventListener("click", function () {
  handleDownload(1); // Date Range Report
});
document.getElementById("download2").addEventListener("click", function () {
  handleDownload(2); // Charging and Discharging Report
});

// Clear date range button functionality
document.getElementById("clearDateRange").addEventListener("click", () => {
  document.getElementById("dateRange")._flatpickr.clear();
  selectedDates = [];
});
document.getElementById("dateModatCancel").addEventListener("click", () => {
  document.getElementById("dateRange")._flatpickr.clear();
  selectedDates = [];
});

// Check if the "showModal" query parameter is present
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  // console.log(urlParams);

  if (urlParams.get("showModal") === "true") {
    var myModal = new bootstrap.Modal(document.getElementById("dateModal"));
    myModal.show();
  } else if (urlParams.get("lat") && urlParams.get("lng")) {
    console.log(urlParams.get("lat"), urlParams.get("lng"));
    openMapModal(Number(urlParams.get("lat")), Number(urlParams.get("lng")));
  }
});
