const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const header = document.querySelector(".site-header");

document.body.classList.add("loading");

window.addEventListener("load", () => {
  document.body.classList.remove("loading");
  document.body.classList.add("ready");
});

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sections = Array.from(document.querySelectorAll("main section[id]"));
const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

navLinks.forEach((link) => {
  const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/$/, "") || "/";
  if (linkPath === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

function setActiveLink() {
  if (currentPath !== "/") {
    return;
  }

  const current = sections
    .map((section) => ({ id: section.id, top: section.getBoundingClientRect().top }))
    .filter((section) => section.top <= 120)
    .pop();

  navLinks.forEach((link) => {
    link.classList.toggle("active", current && link.getAttribute("href") === `#${current.id}`);
  });
}

setActiveLink();
window.addEventListener("scroll", setActiveLink, { passive: true });

function updateHeaderState() {
  header?.classList.toggle("compact", window.scrollY > 60);
  document.querySelector(".scroll-top")?.classList.toggle("visible", window.scrollY > 500);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const revealTargets = document.querySelectorAll(
  ".section-heading, .split-grid, .two-column, .cards-grid, .content-grid, .process-grid, .opportunity-grid, .commission-card, .gallery-grid, .gallery-page-grid, .contact-grid, .band-grid, .wide-image, .table-card, .calc-layout"
  + ", .premium-grid, .journey-line, .detail-list, .growth-path, .rules-grid, .brand-marquee"
);

revealTargets.forEach((element) => element.classList.add("reveal"));

function revealVisibleTargets() {
  revealTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      element.classList.add("visible");
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("visible"));
}

setTimeout(revealVisibleTargets, 180);
window.addEventListener("scroll", revealVisibleTargets, { passive: true });

document.querySelector(".scroll-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const counters = document.querySelectorAll("[data-count]");

function animateCounter(counter) {
  const target = Number(counter.dataset.count || 0);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  const duration = 1200;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = `${prefix}${value.toLocaleString("en-IN")}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(animateCounter);
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get("name") || "Customer";
    const requirement = data.get("requirement") || "Solar consultation";
    const message = data.get("message") || "Please contact me about MR. KING Solar Consultancy.";
    const text = `Hello MR. KING Solar Consultancy, my name is ${name}. Requirement: ${requirement}. Message: ${message}`;

    window.location.href = `https://wa.me/917675090687?text=${encodeURIComponent(text)}`;
  });
}

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".faq-item").classList.toggle("open");
  });
});

const subsidyForm = document.querySelector("[data-subsidy-calculator]");

if (subsidyForm) {
  const capacity = subsidyForm.querySelector("[name='capacity']");
  const resultUnits = subsidyForm.querySelector("[data-result='units']");
  const resultSubsidy = subsidyForm.querySelector("[data-result='subsidy']");
  const resultNote = subsidyForm.querySelector("[data-result='note']");
  const plans = {
    "2": { units: "240", subsidy: "Rs. 60,000", note: "Suitable for smaller homes with moderate daytime usage." },
    "3": { units: "360", subsidy: "Rs. 78,000", note: "Popular option for family homes under the current subsidy cap." },
    "5": { units: "600", subsidy: "Rs. 78,000", note: "Higher generation capacity; subsidy remains capped as per scheme limits." },
  };

  function updateSubsidy() {
    const plan = plans[capacity.value];
    resultUnits.textContent = `${plan.units} units`;
    resultSubsidy.textContent = plan.subsidy;
    resultNote.textContent = plan.note;
  }

  capacity.addEventListener("change", updateSubsidy);
  updateSubsidy();
}

const incomeForm = document.querySelector("[data-income-calculator]");

if (incomeForm) {
  const directInput = incomeForm.querySelector("[name='direct']");
  const firstInput = incomeForm.querySelector("[name='firstline']");
  const secondInput = incomeForm.querySelector("[name='secondline']");
  const levelSelect = incomeForm.querySelector("[name='level']");
  const total = incomeForm.querySelector("[data-result='income']");
  const directRates = { agent: 5000, supervisor: 6000, manager: 7000, director: 8000, club: 9000 };
  const firstRates = { agent: 0, supervisor: 500, manager: 1000, director: 1500, club: 2000 };

  function updateIncome() {
    const level = levelSelect.value;
    const direct = Number(directInput.value || 0);
    const first = Number(firstInput.value || 0);
    const second = Number(secondInput.value || 0);
    const income = direct * directRates[level] + first * firstRates[level] + second * 500;
    total.textContent = income.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  }

  [directInput, firstInput, secondInput, levelSelect].forEach((input) => {
    input.addEventListener("input", updateIncome);
    input.addEventListener("change", updateIncome);
  });

  updateIncome();
}
