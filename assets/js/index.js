document.addEventListener("DOMContentLoaded", async function () {
  const deviceIdSelect = document.getElementById("deviceId");
  const customerName = document.getElementById("customerName");
  const date = document.getElementById("date");
  const time = document.getElementById("time");
  // card Data elements
  const voltage1 = document.getElementById("voltage1");
  const voltage2 = document.getElementById("voltage2");
  const voltage3 = document.getElementById("voltage3");
  const voltage4 = document.getElementById("voltage4");
  const batteryBankVoltage = document.getElementById("batteryBankVoltage");
  const current = document.getElementById("current");
  const temperature = document.getElementById("temperature");
  const speed = document.getElementById("speed");
  const distance = document.getElementById("distance");
  // card Data elements

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

    const initialDeviceId = deviceIdSelect.value;
    await fetchDeviceDetails(initialDeviceId);

    let intervalId = setInterval(async () => {
      await fetchDeviceDetails(deviceIdSelect.value);
    }, 30000);

    deviceIdSelect.addEventListener("change", async function () {
      const selectedDeviceId = this.value;
      localStorage.setItem("selectedDeviceId", selectedDeviceId);
      const selectedDevice = deviceIdDetais.find(
        (device) => device.device_id === selectedDeviceId
      );
      if (selectedDevice) {
        customerName.textContent = selectedDevice.customer_name;
      }

      await fetchDeviceDetails(selectedDeviceId);
      updateCharts();
      // clearInterval(graphIntervalId);
      // graphIntervalId = setInterval(updateCharts, 30000);

      clearInterval(intervalId);
      intervalId = setInterval(async () => {
        await fetchDeviceDetails(selectedDeviceId);
      }, 30000);
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

async function fetchDeviceDetails(deviceId) {
  const authToken = localStorage.getItem("authToken");
  const apiUrl = `https://stingray-app-4smpo.ondigitalocean.app/dashboard/primary-data/${deviceId}/${authToken}`;
  const distanceApiUrl = `https://stingray-app-4smpo.ondigitalocean.app/distance-travelled/${deviceId}/${authToken}`;

  try {
    const [deviceResponse, distanceResponse] = await Promise.all([
      fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(distanceApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!deviceResponse.ok) {
      throw new Error(`Device Data Error: ${deviceResponse.status}`);
    }
    if (!distanceResponse.ok) {
      throw new Error(`Distance Data Error: ${distanceResponse.status}`);
    }

    const deviceData = await deviceResponse.json();
    const distanceData = await distanceResponse.json();
    console.log({ deviceData, distanceData });

    if (deviceData.errFlag === 1 || distanceData.errFlag === 1) {
      window.location.href = "login.html";
      return null;
    }

    if (deviceData.length > 0) {
      date.textContent = convertDateFormat(deviceData[0].device_log_date);
      time.textContent = deviceData[0].latest_updated_time;

      voltage1.textContent = deviceData[0].v1;
      voltage2.textContent = deviceData[0].v2;
      voltage3.textContent = deviceData[0].v3;
      voltage4.textContent = deviceData[0].v4;
      batteryBankVoltage.textContent = (
        Number(deviceData[0].v1) +
        Number(deviceData[0].v2) +
        Number(deviceData[0].v3) +
        Number(deviceData[0].v4)
      ).toFixed(2);
      current.textContent = deviceData[0].current;
      temperature.textContent = deviceData[0].temperature;
      speed.textContent = deviceData[0].speed;
    } else {
      date.textContent = "";
      time.textContent = "";
      voltage1.textContent = "0.00";
      voltage2.textContent = "0.00";
      voltage3.textContent = "0.00";
      voltage4.textContent = "0.00";
      batteryBankVoltage.textContent = "0.00";
      current.textContent = "0.00";
      temperature.textContent = "0.00";
      speed.textContent = "0.00";
    }

    if (distanceData.length > 0) {
      distance.textContent = distanceData[0].distance_in_kms.toFixed(2);
    } else {
      distance.textContent = "0.00";
    }
  } catch (error) {
    console.error("Error fetching device data:", error);
    window.location.href = "login.html";
    return null;
  }
}

function convertDateFormat(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
