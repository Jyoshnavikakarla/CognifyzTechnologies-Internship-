const navLinks = document.querySelector("#navLinks");
const menuButton = document.querySelector("#menuButton");
const eligibilityChecks = document.querySelectorAll(".eligibility");
const eligibilityResult = document.querySelector("#eligibilityResult");
const faqQuestions = document.querySelectorAll(".faq-question");
const form = document.querySelector("#applicationForm");
const formMessage = document.querySelector("#formMessage");
const progressText = document.querySelector("#formProgressText");
const progressBar = document.querySelector("#formProgressBar");
const clearDraft = document.querySelector("#clearDraft");
const countdown = document.querySelector("#countdown");
const toast = document.querySelector("#toast");
const trackPanel = document.querySelector("#trackPanel");
const trackButtons = document.querySelectorAll(".track-button");
const previewName = document.querySelector("#previewName");
const previewMeta = document.querySelector("#previewMeta");
const previewSkills = document.querySelector("#previewSkills");
const draftKey = "cognifyz-web-internship-application";

const trackContent = {
  frontend: {
    title: "Frontend Track",
    text: "Focus on responsive pages, CSS Grid, Flexbox, landing pages, and clean visual structure.",
    items: ["Tools: HTML, CSS, Bootstrap", "Project: Responsive internship landing page", "Outcome: Better layout and UI design confidence"]
  },
  javascript: {
    title: "JavaScript Track",
    text: "Practice DOM manipulation, forms, localStorage, validation, accordions, menus, and dynamic UI updates.",
    items: ["Tools: JavaScript, DOM APIs", "Project: Interactive application dashboard", "Outcome: Stronger front-end logic skills"]
  },
  portfolio: {
    title: "Portfolio Track",
    text: "Prepare polished project pages that explain your skills, process, and internship tasks clearly.",
    items: ["Tools: GitHub, LinkedIn, project writeups", "Project: Personal portfolio section", "Outcome: Better project presentation"]
  }
};

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("is-open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
  });
});

function updateEligibility() {
  const checked = [...eligibilityChecks].filter((box) => box.checked).length;

  if (checked === 4) {
    eligibilityResult.textContent = "You look ready to apply for this internship.";
    return;
  }

  if (checked >= 2) {
    eligibilityResult.textContent = "You are close. Strengthen the remaining skills and apply.";
    return;
  }

  eligibilityResult.textContent = "Select the boxes to check your readiness.";
}

eligibilityChecks.forEach((box) => {
  box.addEventListener("change", updateEligibility);
});

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;
    answer.classList.toggle("is-open");
  });
});

function getFormFields() {
  return [...form.querySelectorAll("input, select, textarea")];
}

function updateProgress() {
  const fields = getFormFields();
  const filled = fields.filter((field) => field.value.trim() !== "").length;
  const percent = Math.round((filled / fields.length) * 100);

  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  updatePreview();
}

function updatePreview() {
  const name = document.querySelector("#fullName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const duration = document.querySelector("#duration").value;
  const skills = document.querySelector("#skills").value.trim();

  previewName.textContent = name || "Applicant Name";
  previewMeta.textContent = [duration, email, phone].filter(Boolean).join(" | ") || "Duration and contact details will appear here.";
  previewSkills.textContent = skills || "Skills preview updates while you type.";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function updateCountdown() {
  const now = new Date();
  const target = new Date();
  target.setDate(now.getDate() + 7);
  target.setHours(18, 0, 0, 0);

  const diff = target - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  countdown.textContent = `${days}d ${hours}h ${minutes}m`;
}

function saveDraft() {
  const data = {};

  getFormFields().forEach((field) => {
    data[field.name] = field.value;
  });

  localStorage.setItem(draftKey, JSON.stringify(data));
  updateProgress();
  window.clearTimeout(saveDraft.timer);
  saveDraft.timer = window.setTimeout(() => {
    showToast("Draft saved in this browser.");
  }, 700);
}

function loadDraft() {
  const saved = localStorage.getItem(draftKey);

  if (!saved) {
    updateProgress();
    return;
  }

  const data = JSON.parse(saved);

  getFormFields().forEach((field) => {
    field.value = data[field.name] || "";
  });

  updateProgress();
}

form.addEventListener("input", saveDraft);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    formMessage.textContent = "Please complete all required fields before submitting.";
    return;
  }

  const name = document.querySelector("#fullName").value.trim();
  formMessage.textContent = `Thanks, ${name}. Your internship application demo has been submitted.`;
  showToast("Application submitted successfully.");
  localStorage.removeItem(draftKey);
  form.reset();
  updateProgress();
});

clearDraft.addEventListener("click", () => {
  localStorage.removeItem(draftKey);
  form.reset();
  formMessage.textContent = "Draft cleared.";
  showToast("Draft cleared.");
  updateProgress();
});

trackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = trackContent[button.dataset.track];

    trackButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    trackPanel.innerHTML = `
      <h3>${content.title}</h3>
      <p>${content.text}</p>
      <ul>${content.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    `;

    showToast(`${content.title} selected.`);
  });
});

setInterval(updateCountdown, 60000);
updateCountdown();
loadDraft();
