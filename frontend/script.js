const API_BASE_URL = "http://localhost:5000/api/tires";

const tableBody = document.getElementById("tireTableBody");
const statusBadge = document.getElementById("statusBadge");
const addTireForm = document.getElementById("addTireForm");

function setConnectionStatus(ok) {
  if (ok) {
    statusBadge.textContent = "Connection Status: Online";
    statusBadge.classList.remove("status-error");
    statusBadge.classList.add("status-ok");
  } else {
    statusBadge.textContent = "Connection Status: Offline";
    statusBadge.classList.remove("status-ok");
    statusBadge.classList.add("status-error");
  }
}

function buildRow(tire) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${tire.brand}</td>
    <td>${tire.model}</td>
    <td>${tire.size}</td>
    <td>${tire.quantity}</td>
    <td>
      <div class="actions">
        <button class="btn btn-secondary" data-action="sell" data-id="${tire.id}">Sell (-1)</button>
        <button class="btn" data-action="restock" data-id="${tire.id}">Restock (+1)</button>
      </div>
    </td>
  `;
  return tr;
}

async function fetchTires() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch tires: ${response.status}`);
    }

    const tires = await response.json();
    tableBody.innerHTML = "";
    tires.forEach((tire) => tableBody.appendChild(buildRow(tire)));
    setConnectionStatus(true);
  } catch (error) {
    console.error(error);
    setConnectionStatus(false);
    tableBody.innerHTML = "";
  }
}

async function updateQuantity(id, delta) {
  try {
    const response = await fetch(`${API_BASE_URL}/update-quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delta })
    });

    if (!response.ok) {
      throw new Error(`Failed to update quantity: ${response.status}`);
    }

    setConnectionStatus(true);
    await fetchTires();
  } catch (error) {
    console.error(error);
    setConnectionStatus(false);
  }
}

async function addTire(event) {
  event.preventDefault();
  const formData = new FormData(addTireForm);
  const payload = {
    brand: formData.get("brand"),
    model: formData.get("model"),
    size: formData.get("size"),
    quantity: Number(formData.get("quantity"))
  };

  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to add tire: ${response.status}`);
    }

    addTireForm.reset();
    setConnectionStatus(true);
    await fetchTires();
  } catch (error) {
    console.error(error);
    setConnectionStatus(false);
  }
}

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const delta = action === "sell" ? -1 : 1;
  updateQuantity(id, delta);
});

addTireForm.addEventListener("submit", addTire);

fetchTires();
