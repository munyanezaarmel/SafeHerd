let puterInstance = null;
let contextPrompt = "";
let openFAQ = null;

async function loadContext() {
  try {
    const response = await fetch("context.txt");
    if (!response.ok) throw new Error("Failed to load context");
    contextPrompt = await response.text();
    console.log("Context loaded successfully");
  } catch (error) {
    console.error("Error loading context:", error);
    contextPrompt = "SafeHerd is a livestock management platform...";
  }
}

function updateVisitorCount() {
  let visitCount = localStorage.getItem("safeherd_visits");
  if (!visitCount) {
    visitCount = 0;
  }
  visitCount = parseInt(visitCount) + 1;
  localStorage.setItem("safeherd_visits", visitCount);
  document.getElementById("visitCount").textContent = visitCount;
}

document.addEventListener("DOMContentLoaded", async function () {
  await loadContext();
  updateVisitorCount();
  initializeScrollEffects();
  initializeTheme();

  try {
    // console.log("Puter initialized successfully");
    addMessage("Welcome! Ask me anything about SafeHerd.", "bot");
  } catch (error) {
    console.error("Failed to initialize Puter:", error);
    addMessage(
      "Chat service is temporarily unavailable. Please try again later.",
      "bot"
    );
  }

  const farmersBtn = document.getElementById("farmersBtn");
  const investorsBtn = document.getElementById("investorsBtn");
  const farmersContent = document.getElementById("farmersContent");
  const investorsContent = document.getElementById("investorsContent");

  if (farmersBtn && investorsBtn && farmersContent && investorsContent) {
    farmersBtn.addEventListener("click", function () {
      farmersBtn.classList.add("active");
      investorsBtn.classList.remove("active");
      farmersContent.classList.add("active");
      investorsContent.classList.remove("active");
    });

    investorsBtn.addEventListener("click", function () {
      investorsBtn.classList.add("active");
      farmersBtn.classList.remove("active");
      investorsContent.classList.add("active");
      farmersContent.classList.remove("active");
    });
  } else {
    console.error("Toggle elements not found");
  }
});

const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

hamburgerBtn.addEventListener("click", function () {
  navMenu.classList.toggle("active");
});

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  navMenu.classList.remove("active");
}

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    scrollToSection(targetId);
  });
});

function toggleFAQ(index) {
  const faqItems = document.querySelectorAll(".faq-item");
  const currentItem = faqItems[index];
  if (openFAQ !== null && openFAQ !== index) {
    faqItems[openFAQ].classList.remove("active");
  }

  if (openFAQ === index) {
    currentItem.classList.remove("active");
    openFAQ = null;
  } else {
    currentItem.classList.add("active");
    openFAQ = index;
  }
}

function addMessage(text, type) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}-message`;

  const avatarDiv = document.createElement("div");
  avatarDiv.className = `message-avatar ${type}-avatar`;

  if (type === "bot") {
    const logoImg = document.createElement("img");
    logoImg.src = "./images/logo.png";
    logoImg.alt = "SafeHerd Logo";
    logoImg.className = "bot-avatar-img";
    avatarDiv.appendChild(logoImg);
  } else {
    avatarDiv.textContent = "👤";
  }

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  contentDiv.textContent = text;

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) {
    alert("Please enter a question");
    return;
  }

  addMessage(message, "user");
  chatInput.value = "";

  try {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing";
    typingDiv.innerHTML = `<div class="typing-indicator">Thinking...</div>`;
    document.getElementById("chatMessages").appendChild(typingDiv);

    const fullPrompt = `${contextPrompt}\n\nUser question: ${message}`;
    const response = await puter.ai.chat(fullPrompt);

    document.getElementById("chatMessages").removeChild(typingDiv);

    if (response) {
      addMessage(response, "bot");
    } else {
      throw new Error("Empty response");
    }
  } catch (error) {
    console.error("Chat error:", error);
    document.getElementById("chatMessages").removeChild(typingDiv);
    addMessage(
      "Sorry, I'm having trouble connecting. Please try again later.",
      "bot"
    );
  }
}
function askSampleQuestion(question) {
  document.getElementById("chatInput").value = question;
  sendMessage();
}

document.getElementById("chatInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

function submitForm(event) {
  event.preventDefault();

  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("userName");
  const emailInput = document.getElementById("userEmail");
  const messageInput = document.getElementById("userMessage");

  clearErrorMessages();

  let isValid = true;

  if (nameInput.value.trim() === "") {
    showError(nameInput, "Name is required");
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput.value.trim() === "") {
    showError(emailInput, "Email is required");
    isValid = false;
  } else if (!emailRegex.test(emailInput.value)) {
    showError(emailInput, "Please enter a valid email address");
    isValid = false;
  }

  if (messageInput.value.trim() === "") {
    showError(messageInput, "Message is required");
    isValid = false;
  }

  if (isValid) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent =
      "Thank you! Your message has been sent successfully.";
    form.insertBefore(successDiv, form.firstChild);

    form.reset();

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
}

function showError(input, message) {
  input.classList.add("error");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  input.parentNode.appendChild(errorDiv);
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  const errorInputs = document.querySelectorAll(".error");

  errorMessages.forEach((msg) => msg.remove());
  errorInputs.forEach((input) => input.classList.remove("error"));
}

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");

  body.classList.toggle("dark-mode");

  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("safeherd_theme", isDarkMode ? "dark" : "light");

  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";

  document.documentElement.style.transition =
    "background-color 0.3s ease, color 0.3s ease";
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("safeherd_theme");
  const themeToggle = document.getElementById("themeToggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function initializeScrollEffects() {
  const backToTopBtn = document.getElementById("backToTop");

  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });
}
