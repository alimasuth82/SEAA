import { showToast } from "./toast.js";

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Wait for EmailJS to be loaded
function waitForEmailJS() {
  return new Promise((resolve) => {
    if (window.emailjs) {
      resolve();
    } else {
      const checkEmailJS = setInterval(() => {
        if (window.emailjs) {
          clearInterval(checkEmailJS);
          resolve();
        }
      }, 100);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const subscribeBtn = document.getElementById("subscribeBtn");
  const emailInput = document.querySelector('.newsletter input[type="email"]');

  console.log("Newsletter script loaded");
  console.log("Subscribe button:", subscribeBtn);
  console.log("Email input:", emailInput);

  if (!subscribeBtn || !emailInput) {
    console.error("Subscribe button or email input not found!");
    return;
  }

  // Wait for EmailJS to load
  await waitForEmailJS();
  console.log("EmailJS loaded:", window.emailjs);

  subscribeBtn.addEventListener("click", function(e) {
    e.preventDefault();
    console.log("Subscribe button clicked");
    
    const email = emailInput.value.trim();
    console.log("Email:", email);

    // Validate email
    if (!email) {
      showToast("Please enter your email address", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Disable button during submission
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = "Subscribing...";

    console.log("Sending email via EmailJS...");
    window.emailjs.send("seaa-email-service", "seaa-newsletter-template", {
      recipient: email 
    })
    .then((response) => {
      console.log("EmailJS success:", response);
      showToast("Successfully subscribed! Check your email.", "success");
      emailInput.value = "";
    })
    .catch((error) => {
      console.error("EmailJS Error:", error);
      console.error("Error details:", JSON.stringify(error));
      showToast("Failed to subscribe. Please try again.", "error");
    })
    .finally(() => {
      subscribeBtn.disabled = false;
      subscribeBtn.textContent = "Subscribe";
    });
  });
});