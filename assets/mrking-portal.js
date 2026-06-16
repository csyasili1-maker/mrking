const storeKey = "mrkingPortalState";
const sessionKey = "mrkingPortalUser";

document.body.dataset.portalReady = "true";

const defaultState = {
  users: [
    { id: "A1001", name: "Ravi Kumar", email: "affiliate@mrking.demo", role: "affiliate", phone: "7675090687", status: "Active", joined: "2026-06-01" },
    { id: "V2001", name: "Solar Vendor One", email: "vendor@mrking.demo", role: "vendor", phone: "9000000001", status: "Verified", joined: "2026-06-03" },
    { id: "AD001", name: "MR. KING Admin", email: "admin@mrking.demo", role: "admin", phone: "7675090687", status: "Owner", joined: "2026-06-01" },
  ],
  leads: [
    { id: "L-501", name: "Suresh Babu", phone: "9848012345", area: "Guntur", capacity: "3KW", source: "Affiliate", affiliate: "Ravi Kumar", status: "Hot" },
    { id: "L-502", name: "Lakshmi Homes", phone: "9912211000", area: "Krishna", capacity: "5KW", source: "Website", affiliate: "Direct", status: "Pending" },
    { id: "L-503", name: "Vijay Kumar", phone: "9700011122", area: "Tenali", capacity: "2KW", source: "Affiliate", affiliate: "Ravi Kumar", status: "Closed" },
  ],
  orders: [
    { id: "O-901", customer: "Suresh Babu", vendor: "Solar Vendor One", capacity: "3KW", value: "Rs. 1,95,000", status: "Site Survey" },
    { id: "O-902", customer: "Vijay Kumar", vendor: "Solar Vendor One", capacity: "2KW", value: "Rs. 1,45,000", status: "Installed" },
    { id: "O-903", customer: "Lakshmi Homes", vendor: "Pending Assignment", capacity: "5KW", value: "Rs. 3,20,000", status: "Quotation" },
  ],
  payouts: [
    { id: "P-301", affiliate: "Ravi Kumar", level: "Manager", systems: 3, amount: "Rs. 21,000", status: "Approved" },
    { id: "P-302", affiliate: "Ravi Kumar", level: "Front Line", systems: 10, amount: "Rs. 10,000", status: "Pending" },
  ],
};

function readState() {
  const saved = localStorage.getItem(storeKey);
  if (!saved) {
    localStorage.setItem(storeKey, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }
  return JSON.parse(saved);
}

function writeState(state) {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function setSession(user) {
  localStorage.setItem(sessionKey, JSON.stringify(user));
}

function getSession() {
  const saved = localStorage.getItem(sessionKey);
  return saved ? JSON.parse(saved) : null;
}

function rolePath(role) {
  return {
    affiliate: "/affiliate-panel",
    vendor: "/vendor-panel",
    admin: "/admin-panel",
  }[role] || "/login";
}

function currencyNumber(value) {
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

function badgeClass(status) {
  const lowered = String(status || "").toLowerCase();
  if (lowered.includes("hot") || lowered.includes("active") || lowered.includes("approved") || lowered.includes("verified")) return "hot";
  if (lowered.includes("closed") || lowered.includes("installed") || lowered.includes("owner")) return "closed";
  return "pending";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-demo-login]");
  if (!button) return;
  const role = button.dataset.demoLogin;
  loginDemoRole(role);
});

function loginDemoRole(role) {
  const state = readState();
  const user = state.users.find((item) => item.role === role);
  setSession(user);
  window.location.assign(rolePath(role));
}

window.mrkingDemoLogin = loginDemoRole;

document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const role = data.get("role");
  const email = String(data.get("email") || "").trim().toLowerCase();
  const state = readState();
  let user = state.users.find((item) => item.email.toLowerCase() === email && item.role === role);

  if (!user) {
    user = state.users.find((item) => item.role === role);
  }

  setSession(user);
  window.location.href = rolePath(role);
});

document.querySelector("[data-signup-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const role = data.get("role");
  const state = readState();
  const user = {
    id: `${role.slice(0, 1).toUpperCase()}${Date.now().toString().slice(-5)}`,
    name: String(data.get("name") || "MR. KING Partner"),
    email: String(data.get("email") || "").toLowerCase(),
    phone: String(data.get("phone") || ""),
    role,
    status: role === "vendor" ? "Pending Verification" : "Active",
    joined: new Date().toISOString().slice(0, 10),
  };

  state.users.push(user);
  writeState(state);
  setSession(user);
  window.location.href = rolePath(role);
});

function requireRole(role) {
  let user = getSession();
  if (!user || user.role !== role) {
    const state = readState();
    user = state.users.find((item) => item.role === role);
    setSession(user);
  }
  document.querySelectorAll("[data-user-name]").forEach((item) => (item.textContent = user.name));
  document.querySelectorAll("[data-user-role]").forEach((item) => (item.textContent = user.role));
  return user;
}

document.querySelectorAll("[data-logout]").forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.removeItem(sessionKey);
    window.location.href = "/login";
  });
});

function renderAffiliatePanel(user) {
  const state = readState();
  const myLeads = state.leads.filter((lead) => lead.affiliate === user.name || lead.source === "Affiliate");
  const closed = myLeads.filter((lead) => lead.status === "Closed").length;
  const pending = myLeads.filter((lead) => lead.status !== "Closed").length;
  const projectedIncome = closed * 7000 + pending * 1500;

  document.querySelector("[data-metric='leads']").textContent = myLeads.length;
  document.querySelector("[data-metric='closed']").textContent = closed;
  document.querySelector("[data-metric='income']").textContent = projectedIncome.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  document.querySelector("[data-metric='level']").textContent = closed >= 30 ? "Manager" : closed >= 10 ? "Supervisor" : "Agent";
  document.querySelector("[data-referral-link]").textContent = `https://mrking-eight.vercel.app/signup?ref=${encodeURIComponent(user.id)}`;

  const rows = myLeads.map((lead) => `<tr><td>${lead.id}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${lead.area}</td><td>${lead.capacity}</td><td><span class="status-pill ${badgeClass(lead.status)}">${lead.status}</span></td></tr>`).join("");
  document.querySelector("[data-affiliate-leads]").innerHTML = rows;

  document.querySelector("[data-lead-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.leads.unshift({
      id: `L-${Date.now().toString().slice(-4)}`,
      name: data.get("name"),
      phone: data.get("phone"),
      area: data.get("area"),
      capacity: data.get("capacity"),
      source: "Affiliate",
      affiliate: user.name,
      status: "Pending",
    });
    writeState(state);
    window.location.reload();
  });
}

function renderVendorPanel(user) {
  const state = readState();
  const vendorOrders = state.orders.filter((order) => order.vendor === user.name || order.vendor === "Solar Vendor One");
  const pipeline = vendorOrders.reduce((sum, order) => sum + currencyNumber(order.value), 0);
  document.querySelector("[data-metric='orders']").textContent = vendorOrders.length;
  document.querySelector("[data-metric='installed']").textContent = vendorOrders.filter((order) => order.status === "Installed").length;
  document.querySelector("[data-metric='pipeline']").textContent = pipeline.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  document.querySelector("[data-metric='rating']").textContent = "4.8";

  document.querySelector("[data-vendor-orders]").innerHTML = vendorOrders.map((order) => `<tr><td>${order.id}</td><td>${order.customer}</td><td>${order.capacity}</td><td>${order.value}</td><td><span class="status-pill ${badgeClass(order.status)}">${order.status}</span></td></tr>`).join("");
}

function renderAdminPanel() {
  const state = readState();
  document.querySelector("[data-metric='users']").textContent = state.users.length;
  document.querySelector("[data-metric='leads']").textContent = state.leads.length;
  document.querySelector("[data-metric='orders']").textContent = state.orders.length;
  document.querySelector("[data-metric='payouts']").textContent = state.payouts.length;

  document.querySelector("[data-admin-users]").innerHTML = state.users.map((user) => `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.role}</td><td>${user.phone}</td><td><span class="status-pill ${badgeClass(user.status)}">${user.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-leads]").innerHTML = state.leads.map((lead) => `<tr><td>${lead.id}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${lead.area}</td><td>${lead.capacity}</td><td><span class="status-pill ${badgeClass(lead.status)}">${lead.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-orders]").innerHTML = state.orders.map((order) => `<tr><td>${order.id}</td><td>${order.customer}</td><td>${order.vendor}</td><td>${order.capacity}</td><td>${order.value}</td><td><span class="status-pill ${badgeClass(order.status)}">${order.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-payouts]").innerHTML = state.payouts.map((payout) => `<tr><td>${payout.id}</td><td>${payout.affiliate}</td><td>${payout.level}</td><td>${payout.systems}</td><td>${payout.amount}</td><td><span class="status-pill ${badgeClass(payout.status)}">${payout.status}</span></td></tr>`).join("");

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.adminTab;
      document.querySelectorAll("[data-admin-tab]").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".admin-section").forEach((section) => section.classList.toggle("active", section.id === target));
    });
  });
}

const panel = document.body.dataset.panel;
if (panel === "affiliate") {
  const user = requireRole("affiliate");
  if (user) renderAffiliatePanel(user);
}
if (panel === "vendor") {
  const user = requireRole("vendor");
  if (user) renderVendorPanel(user);
}
if (panel === "admin") {
  const user = requireRole("admin");
  if (user) renderAdminPanel(user);
}
