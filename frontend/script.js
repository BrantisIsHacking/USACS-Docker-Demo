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
        <div class="action-group">
          <label class="amount-control" for="sell-amount-${tire.id}">Sell Amount</label>
          <input
            id="sell-amount-${tire.id}"
            type="number"
            data-sell-amount
            min="1"
            max="${tire.quantity}"
            step="1"
            value="1"
            aria-label="Sell amount for ${tire.brand} ${tire.model}"
          >
          <button class="btn btn-secondary" data-action="sell" data-id="${tire.id}">Sell</button>
        </div>
        <div class="action-group">
          <label class="amount-control" for="restock-amount-${tire.id}">Restock Amount</label>
          <input
            id="restock-amount-${tire.id}"
            type="number"
            data-restock-amount
            min="1"
            step="1"
            value="1"
            aria-label="Restock amount for ${tire.brand} ${tire.model}"
          >
          <button class="btn" data-action="restock" data-id="${tire.id}">Restock</button>
        </div>
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

  const actions = button.closest(".actions");
  const amountSelector =
    button.dataset.action === "sell" ? "input[data-sell-amount]" : "input[data-restock-amount]";
  const amountInput = actions ? actions.querySelector(amountSelector) : null;
  const amount = Number(amountInput ? amountInput.value : 1);

  if (!Number.isInteger(amount) || amount < 1) {
    if (amountInput) {
      amountInput.value = "1";
    }
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const delta = action === "sell" ? -amount : amount;
  updateQuantity(id, delta);
});

addTireForm.addEventListener("submit", addTire);

fetchTires();
