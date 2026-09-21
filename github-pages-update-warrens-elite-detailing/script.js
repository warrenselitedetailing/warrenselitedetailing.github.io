const quoteForm = document.querySelector("#quoteForm");
const formStatus = document.querySelector("#formStatus");

quoteForm?.addEventListener("submit", async (event) => {
  const action = quoteForm.getAttribute("action") || "";

  if (action.includes("YOUR_FORM_ID")) {
    event.preventDefault();
    formStatus.textContent = "Form endpoint needed: replace YOUR_FORM_ID with your Formspree form ID before publishing.";
    formStatus.className = "form-status error";
    return;
  }

  event.preventDefault();
  formStatus.textContent = "Sending your request...";
  formStatus.className = "form-status";

  try {
    const response = await fetch(action, {
      method: "POST",
      body: new FormData(quoteForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    quoteForm.reset();
    formStatus.textContent = "Thanks. Your quote request has been sent.";
    formStatus.className = "form-status success";
  } catch {
    formStatus.textContent = "Something went wrong. Please try again in a moment.";
    formStatus.className = "form-status error";
  }
});
