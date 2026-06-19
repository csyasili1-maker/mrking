const storeKey = "mrkingPortalState";
const sessionKey = "mrkingPortalUser";

document.body.dataset.portalReady = "true";

const defaultState = {
  users: [
    { id: "MRK-A-1001", name: "Ravi Kumar", email: "affiliate@mrking.demo", role: "affiliate", phone: "7675090687", area: "Guntur", status: "Active", joined: "2026-06-01", agreement: "Accepted" },
    { id: "MRK-V-2001", name: "Solar Vendor One", email: "vendor@mrking.demo", role: "vendor", phone: "9000000001", area: "Krishna", status: "Verified", joined: "2026-06-03", agreement: "Accepted" },
    { id: "MRK-AD-001", name: "MR. KING Admin", email: "admin@mrking.demo", role: "admin", phone: "7675090687", area: "Head Office", status: "Owner", joined: "2026-06-01", agreement: "Accepted" },
  ],
  leads: [
    { id: "MRK-L-501", name: "Suresh Babu", phone: "9848012345", district: "Guntur", area: "Guntur Urban", capacity: "3KW", source: "Affiliate", affiliate: "Ravi Kumar", status: "Hot" },
    { id: "MRK-L-502", name: "Lakshmi Homes", phone: "9912211000", district: "Krishna", area: "Vijayawada", capacity: "5KW", source: "Website", affiliate: "Direct", status: "Pending" },
    { id: "MRK-L-503", name: "Vijay Kumar", phone: "9700011122", district: "Guntur", area: "Tenali", capacity: "2KW", source: "Affiliate", affiliate: "Ravi Kumar", status: "Closed" },
  ],
  orders: [
    { id: "MRK-O-901", customer: "Suresh Babu", vendor: "Solar Vendor One", capacity: "3KW", value: "Rs. 1,95,000", status: "Site Survey" },
    { id: "MRK-O-902", customer: "Vijay Kumar", vendor: "Solar Vendor One", capacity: "2KW", value: "Rs. 1,45,000", status: "Installed" },
    { id: "MRK-O-903", customer: "Lakshmi Homes", vendor: "Pending Assignment", capacity: "5KW", value: "Rs. 3,20,000", status: "Quotation" },
  ],
  payouts: [
    { id: "MRK-P-301", affiliate: "Ravi Kumar", level: "Manager", systems: 3, amount: "Rs. 21,000", method: "UPI", status: "Approved" },
    { id: "MRK-P-302", affiliate: "Ravi Kumar", level: "Front Line", systems: 10, amount: "Rs. 10,000", method: "Bank Transfer", status: "Pending" },
  ],
  applications: [
    { id: "MRK-APP-701", name: "Ravi Kumar", role: "Affiliate Partner", area: "Guntur", agreement: "Accepted", status: "Approved" },
    { id: "MRK-APP-702", name: "Solar Vendor One", role: "Vendor / Installer", area: "Krishna", agreement: "Accepted", status: "Verified" },
  ],
  topEarners: [
    { rank: 1, id: "MRK-A-1001", name: "Ravi Kumar", area: "Guntur", systems: 13, income: "Rs. 31,000" },
    { rank: 2, id: "MRK-A-1004", name: "Kiran Solar Team", area: "Vijayawada", systems: 9, income: "Rs. 24,500" },
    { rank: 3, id: "MRK-A-1007", name: "Lakshmi Partner", area: "Tenali", systems: 6, income: "Rs. 18,000" },
  ],
};

function readState() {
  const saved = localStorage.getItem(storeKey);
  if (!saved) {
    localStorage.setItem(storeKey, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }
  const state = JSON.parse(saved);
  const merged = { ...JSON.parse(JSON.stringify(defaultState)), ...state };
  merged.users = (state.users || defaultState.users).map((user, index) => ({
    ...user,
    area: user.area || (user.role === "admin" ? "Head Office" : "Guntur"),
    agreement: user.agreement || "Accepted",
    id: user.id && user.id.startsWith("MRK-") ? user.id : nextId(user.role || "affiliate", index + 1),
  }));
  merged.leads = (state.leads || defaultState.leads).map((lead, index) => ({
    ...lead,
    district: lead.district || lead.area || "Guntur",
    area: lead.area || "Guntur",
    id: lead.id && lead.id.startsWith("MRK-") ? lead.id : `MRK-L-${501 + index}`,
  }));
  localStorage.setItem(storeKey, JSON.stringify(merged));
  return merged;
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

function nextId(role, offset = 0) {
  const prefix = { affiliate: "MRK-A", vendor: "MRK-V", admin: "MRK-AD" }[role] || "MRK-A";
  const base = role === "vendor" ? 2000 : role === "admin" ? 1 : 1000;
  return `${prefix}-${String(base + offset).padStart(role === "admin" ? 3 : 4, "0")}`;
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
    id: nextId(role, state.users.filter((item) => item.role === role).length + 1),
    name: String(data.get("name") || "MR. KING Partner"),
    email: String(data.get("email") || "").toLowerCase(),
    phone: String(data.get("phone") || ""),
    area: String(data.get("area") || ""),
    role,
    status: role === "vendor" ? "Pending Verification" : "Active",
    joined: new Date().toISOString().slice(0, 10),
    agreement: data.get("agreement") ? "Accepted" : "Pending",
  };

  state.users.push(user);
  state.applications.unshift({
    id: `MRK-APP-${Date.now().toString().slice(-4)}`,
    name: user.name,
    role: role === "vendor" ? "Vendor / Installer" : role === "admin" ? "Admin Team" : "Affiliate Partner",
    area: user.area || "Not mentioned",
    agreement: user.agreement,
    status: role === "vendor" ? "Verification Pending" : "Submitted",
  });
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
  const nextGoal = closed >= 75 ? "MR. KING Club: reach 100 systems" : closed >= 30 ? "Director: reach 75 systems" : closed >= 10 ? "Manager: reach 30 systems" : "Supervisor: reach 10 systems";

  document.querySelector("[data-metric='leads']").textContent = myLeads.length;
  document.querySelector("[data-metric='closed']").textContent = closed;
  document.querySelector("[data-metric='income']").textContent = projectedIncome.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  document.querySelector("[data-metric='level']").textContent = closed >= 30 ? "Manager" : closed >= 10 ? "Supervisor" : "Agent";
  document.querySelector("[data-referral-link]").textContent = `https://mrking-eight.vercel.app/signup?ref=${encodeURIComponent(user.id)}`;
  document.querySelectorAll("[data-user-id]").forEach((item) => (item.textContent = user.id));
  document.querySelectorAll("[data-next-goal]").forEach((item) => (item.textContent = nextGoal));

  const rows = myLeads.map((lead) => `<tr><td>${lead.id}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${lead.district || lead.area}</td><td>${lead.area}</td><td>${lead.capacity}</td><td><span class="status-pill ${badgeClass(lead.status)}">${lead.status}</span></td></tr>`).join("");
  document.querySelector("[data-affiliate-leads]").innerHTML = rows;
  document.querySelector("[data-affiliate-payments]").innerHTML = state.payouts.filter((payout) => payout.affiliate === user.name).map((payout) => `<tr><td>${payout.id}</td><td>${payout.level}</td><td>${payout.systems}</td><td>${payout.amount}</td><td>${payout.method || "Bank Transfer"}</td><td><span class="status-pill ${badgeClass(payout.status)}">${payout.status}</span></td></tr>`).join("");
  document.querySelector("[data-top-earners]").innerHTML = state.topEarners.map((earner) => `<li><strong>#${earner.rank} ${earner.name}</strong><span>${earner.area} · ${earner.systems} systems · ${earner.income}</span></li>`).join("");

  document.querySelector("[data-lead-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state.leads.unshift({
      id: `MRK-L-${Date.now().toString().slice(-4)}`,
      name: data.get("name"),
      phone: data.get("phone"),
      district: data.get("district"),
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
  document.querySelector("[data-admin-leads]").innerHTML = state.leads.map((lead) => `<tr><td>${lead.id}</td><td>${lead.name}</td><td>${lead.phone}</td><td>${lead.district || lead.area}</td><td>${lead.area}</td><td>${lead.capacity}</td><td><span class="status-pill ${badgeClass(lead.status)}">${lead.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-orders]").innerHTML = state.orders.map((order) => `<tr><td>${order.id}</td><td>${order.customer}</td><td>${order.vendor}</td><td>${order.capacity}</td><td>${order.value}</td><td><span class="status-pill ${badgeClass(order.status)}">${order.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-payouts]").innerHTML = state.payouts.map((payout) => `<tr><td>${payout.id}</td><td>${payout.affiliate}</td><td>${payout.level}</td><td>${payout.systems}</td><td>${payout.amount}</td><td>${payout.method || "Bank Transfer"}</td><td><span class="status-pill ${badgeClass(payout.status)}">${payout.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-applications]").innerHTML = state.applications.map((application) => `<tr><td>${application.id}</td><td>${application.name}</td><td>${application.role}</td><td>${application.area}</td><td>${application.agreement}</td><td><span class="status-pill ${badgeClass(application.status)}">${application.status}</span></td></tr>`).join("");
  document.querySelector("[data-admin-earners]").innerHTML = state.topEarners.map((earner) => `<tr><td>#${earner.rank}</td><td>${earner.id}</td><td>${earner.name}</td><td>${earner.area}</td><td>${earner.systems}</td><td>${earner.income}</td></tr>`).join("");

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
