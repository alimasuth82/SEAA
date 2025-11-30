import { showToast } from "./toast.js";

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation function
function isValidPhone(phone) {
  // Allow empty phone since it's optional
  if (!phone || phone.trim() === '') return true;
  const phoneRegex = /^\+?\d[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone);
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
  const contactForm = document.querySelector('.contact-form form');
  const submitBtn = contactForm?.querySelector('.btn-cta');

  if (!contactForm) {
    console.error("Contact form not found!");
    return;
  }

  // Wait for EmailJS to load
  await waitForEmailJS();

  contactForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const firstName = formData.get('firstName')?.trim() || '';
    const lastName = formData.get('lastName')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const topic = formData.get('topic')?.trim() || '';
    const message = formData.get('message')?.trim() || '';

    // Validate required fields
    if (!firstName) {
      showToast("Please enter your first name", "error");
      return;
    }

    if (!lastName) {
      showToast("Please enter your last name", "error");
      return;
    }

    if (!email) {
      showToast("Please enter your email address", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (!isValidPhone(phone)) {
      showToast("Please enter a valid phone number", "error");
      return;
    }

    if (!topic) {
      showToast("Please select a topic", "error");
      return;
    }

    if (!message) {
      showToast("Please enter your message", "error");
      return;
    }

    // Disable submit button during submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    // Send email via EmailJS
    try {
      const response = await window.emailjs.send("seaa-email-service", "seaa-contact-template", {
        from_firstName: firstName,
        from_lastName: lastName,
        from_name: `${firstName} ${lastName}`,
        from_email: email,
        from_phone: phone || "Not provided",
        topic: topic,
        message: message,
        reply_to: email
      });

      console.log("EmailJS success:", response);
      showToast("Message sent successfully! We'll get back to you soon.", "success");
      contactForm.reset();
    } catch (error) {
      console.error("EmailJS Error:", error);
      showToast("Failed to send message. Please try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
});
