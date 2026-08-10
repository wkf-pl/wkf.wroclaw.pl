const yearElement = document.getElementById("year");
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

(function () {
  const form = document.getElementById("contact-form");
  const senderNameInput = document.getElementById("sender-name");
  const topicInput = document.getElementById("topic");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const consentInput = document.getElementById("consent");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (
    !form ||
    !senderNameInput ||
    !topicInput ||
    !emailInput ||
    !phoneInput ||
    !messageInput ||
    !consentInput ||
    !submitButton
  ) {
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneOrMessengerPattern = /^[+\d@a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ][+\d@a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ ._()/:-]{2,79}$/;
  const validTopics = new Set(["join", "game", "workshop", "partnership", "other"]);
  const formDraftStorageKey = "wkfContactFormDraft";

  function getContactFormValidationState() {
    const senderName = senderNameInput.value.trim();
    const topic = topicInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    const isSenderNameValid = senderName.length >= 2;
    const isTopicValid = validTopics.has(topic);
    const isEmailValid = emailPattern.test(email);
    const isPhoneValid = phone === "" || phoneOrMessengerPattern.test(phone);
    const isMessageValid = message.length >= 10;
    const isConsentValid = consentInput.checked;

    return {
      isSenderNameValid,
      isTopicValid,
      isEmailValid,
      isPhoneValid,
      isMessageValid,
      isConsentValid,
      isFormValid:
        isSenderNameValid &&
        isTopicValid &&
        isEmailValid &&
        isPhoneValid &&
        isMessageValid &&
        isConsentValid
    };
  }

  function updateSubmitButtonState() {
    const validation = getContactFormValidationState();
    const shouldShowFieldValidation = (field) =>
      form.classList.contains("wkf-validation-visible") || field.dataset.touched === "true";
    submitButton.disabled = !validation.isFormValid;
    submitButton.setAttribute("aria-disabled", String(!validation.isFormValid));

    senderNameInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(senderNameInput) && !validation.isSenderNameValid);
    topicInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(topicInput) && !validation.isTopicValid);
    emailInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(emailInput) && !validation.isEmailValid);
    phoneInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(phoneInput) && !validation.isPhoneValid);
    messageInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(messageInput) && !validation.isMessageValid);
    consentInput.classList.toggle("wkf-invalid-field", shouldShowFieldValidation(consentInput) && !validation.isConsentValid);
  }

  function getDraftPayload() {
    return {
      senderName: senderNameInput.value,
      topic: topicInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      message: messageInput.value,
      consent: consentInput.checked
    };
  }

  function saveFormDraft() {
    try {
      sessionStorage.setItem(formDraftStorageKey, JSON.stringify(getDraftPayload()));
    } catch {
      // Storage may be unavailable in private browsing modes.
    }
  }

  function readFormDraft() {
    try {
      const rawDraft = sessionStorage.getItem(formDraftStorageKey);
      if (!rawDraft) {
        return null;
      }

      const parsedDraft = JSON.parse(rawDraft);
      return parsedDraft && typeof parsedDraft === "object" ? parsedDraft : null;
    } catch {
      return null;
    }
  }

  function clearFormDraft() {
    try {
      sessionStorage.removeItem(formDraftStorageKey);
    } catch {
      // Storage may be unavailable in private browsing modes.
    }
  }

  function restoreFormDraft() {
    const draft = readFormDraft();
    if (!draft) {
      return;
    }

    senderNameInput.value = typeof draft.senderName === "string" ? draft.senderName : "";
    topicInput.value = typeof draft.topic === "string" ? draft.topic : "";
    emailInput.value = typeof draft.email === "string" ? draft.email : "";
    phoneInput.value = typeof draft.phone === "string" ? draft.phone : "";
    messageInput.value = typeof draft.message === "string" ? draft.message : "";
    consentInput.checked = draft.consent === true;
  }

  function getOrCreateStatusModal() {
    let modalElement = document.getElementById("contact-status-modal");
    if (!modalElement) {
      modalElement = document.createElement("div");
      modalElement.id = "contact-status-modal";
      modalElement.className = "modal fade";
      modalElement.tabIndex = -1;
      modalElement.setAttribute("aria-hidden", "true");
      modalElement.innerHTML =
        '<div class="modal-dialog modal-dialog-centered">' +
        '  <div class="modal-content">' +
        '    <div class="modal-header">' +
        '      <h5 class="modal-title" id="contact-status-modal-title"></h5>' +
        '      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Zamknij"></button>' +
        '    </div>' +
        '    <div class="modal-body" id="contact-status-modal-body"></div>' +
        '    <div class="modal-footer">' +
        '      <button type="button" id="contact-status-modal-button" class="btn" data-bs-dismiss="modal">Ok</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(modalElement);
    }

    return {
      modalElement,
      titleElement: modalElement.querySelector("#contact-status-modal-title"),
      bodyElement: modalElement.querySelector("#contact-status-modal-body"),
      buttonElement: modalElement.querySelector("#contact-status-modal-button")
    };
  }

  function showStatusModal(config) {
    if (!window.bootstrap || !window.bootstrap.Modal) {
      return;
    }

    const { modalElement, titleElement, bodyElement, buttonElement } = getOrCreateStatusModal();
    if (!titleElement || !bodyElement || !buttonElement) {
      return;
    }

    titleElement.textContent = config.title;
    bodyElement.innerHTML = config.bodyHtml;
    buttonElement.className = `btn ${config.buttonClass}`;
    buttonElement.textContent = "Ok";

    const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }

  function clearContactStatusFromUrl() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("contactStatus")) {
      return;
    }

    url.searchParams.delete("contactStatus");
    const replacement = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", replacement);
  }

  function handleContactRedirectStatus() {
    const url = new URL(window.location.href);
    const contactStatus = url.searchParams.get("contactStatus");

    if (contactStatus === "success") {
      clearFormDraft();
      form.reset();
      updateSubmitButtonState();
      showStatusModal({
        title: "Wiadomość wysłana",
        bodyHtml: "Dziękujemy. Odpowiemy najszybciej, jak będzie to możliwe.",
        buttonClass: "btn-success"
      });
      clearContactStatusFromUrl();
      return;
    }

    if (contactStatus === "error") {
      restoreFormDraft();
      updateSubmitButtonState();
      showStatusModal({
        title: "Nie udało się wysłać wiadomości",
        bodyHtml: "Spróbuj ponownie później albo napisz bezpośrednio na kontakt@wkf.wroclaw.pl.",
        buttonClass: "btn-danger"
      });
      clearContactStatusFromUrl();
    }
  }

  function handleFieldInteraction(event) {
    if (event.target instanceof HTMLElement && form.contains(event.target)) {
      event.target.dataset.touched = "true";
    }
    updateSubmitButtonState();
  }

  form.addEventListener("input", handleFieldInteraction);
  form.addEventListener("change", handleFieldInteraction);
  form.addEventListener("submit", function (event) {
    if (!getContactFormValidationState().isFormValid) {
      event.preventDefault();
      form.classList.add("wkf-validation-visible");
      updateSubmitButtonState();
      return;
    }

    saveFormDraft();
  });

  updateSubmitButtonState();
  window.addEventListener("load", handleContactRedirectStatus, { once: true });
})();
