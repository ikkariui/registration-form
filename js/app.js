"use strict";

/* ---------- Pure validation functions (no DOM access) ---------- */

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return /^\d{2}-\d{4}-\d{3}$/.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  // 8+ chars, no whitespace, 1 uppercase, 1 digit, 1 of @ $ !
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/.test(value);
}

function isValidEmail(value) {
  if (typeof value !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidMobile(value) {
  if (typeof value !== "string") return false;
  return /^(09|\+639)\d{9}$/.test(value.trim());
}

function isValidFullName(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber, isValidPassword };
}

/* ---------- Browser behavior ---------- */

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);

  const form = $("registrationForm");
  const fields = ["fullName", "studentNumber", "email", "mobileNumber",
                  "password", "confirmPassword", "course", "terms"];

  function setError(fieldId, message) {
    const input = $(fieldId);
    const box = $(fieldId + "Error");
    box.textContent = message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.setAttribute("aria-invalid", "false");
    }
    return message === "";
  }

  function checkFullName() {
    const v = $("fullName").value.trim();
    if (v === "") return setError("fullName", "Enter your full name.");
    if (!isValidFullName(v)) return setError("fullName", "Full name must have at least two characters.");
    return setError("fullName", "");
  }

  function checkStudentNumber() {
    const v = $("studentNumber").value;
    if (v.trim() === "") return setError("studentNumber", "Enter your student number.");
    if (!isValidStudentNumber(v)) return setError("studentNumber", "Enter a student number in the format 24-1234-123.");
    return setError("studentNumber", "");
  }

  function checkEmail() {
    const v = $("email").value;
    if (v.trim() === "") return setError("email", "Enter your email address.");
    if (!isValidEmail(v)) return setError("email", "Enter a valid email such as name@example.com, with no spaces.");
    return setError("email", "");
  }

  function checkMobile() {
    const v = $("mobileNumber").value;
    if (v.trim() === "") return setError("mobileNumber", "Enter your mobile number.");
    if (!isValidMobile(v)) return setError("mobileNumber", "Enter 09 or +639 followed by nine digits, with no spaces or hyphens.");
    return setError("mobileNumber", "");
  }

  function checkPassword() {
    const v = $("password").value;
    if (v === "") return setError("password", "Enter a password.");
    if (!isValidPassword(v)) return setError("password", "Password must be 8+ characters with an uppercase letter, a digit, one of @ $ !, and no spaces.");
    return setError("password", "");
  }

  function checkConfirm() {
    const v = $("confirmPassword").value;
    if (v === "") return setError("confirmPassword", "Confirm your password.");
    if (v !== $("password").value) return setError("confirmPassword", "Passwords do not match.");
    return setError("confirmPassword", "");
  }

  function checkCourse() {
    const v = $("course").value;
    if (v !== "BSIT" && v !== "BSCS") return setError("course", "Select BSIT or BSCS.");
    return setError("course", "");
  }

  function checkTerms() {
    if (!$("terms").checked) return setError("terms", "You must agree to the terms to register.");
    return setError("terms", "");
  }

  function updatePasswordFeedback() {
    const v = $("password").value;
    const box = $("passwordFeedback");
    box.classList.remove("ok", "bad");
    if (v === "") { box.textContent = ""; return; }
    const missing = [];
    if (v.length < 8) missing.push("at least 8 characters");
    if (!/[A-Z]/.test(v)) missing.push("an uppercase letter");
    if (!/\d/.test(v)) missing.push("a digit");
    if (!/[@$!]/.test(v)) missing.push("one of @, $, or !");
    if (/\s/.test(v)) missing.push("no spaces");
    if (missing.length === 0) {
      box.textContent = "Password meets all requirements.";
      box.classList.add("ok");
    } else {
      box.textContent = "Password needs: " + missing.join(", ") + ".";
      box.classList.add("bad");
    }
  }

  function clearOutput() {
    $("successMessage").textContent = "";
    $("registrationSummary").hidden = true;
    ["summaryName", "summaryStudentNumber", "summaryEmail",
     "summaryMobileNumber", "summaryCourse"].forEach((id) => { $(id).textContent = ""; });
  }

  // Events
  $("fullName").addEventListener("blur", checkFullName);
  $("password").addEventListener("input", () => {
    updatePasswordFeedback();
    if ($("confirmPassword").value !== "") checkConfirm();
  });
  $("course").addEventListener("change", checkCourse);
  $("terms").addEventListener("change", checkTerms);

  // Re-check a field as the user corrects it, once it has been flagged
  [["studentNumber", checkStudentNumber], ["email", checkEmail],
   ["mobileNumber", checkMobile], ["confirmPassword", checkConfirm]
  ].forEach(([id, fn]) => {
    $(id).addEventListener("input", () => {
      if ($(id).getAttribute("aria-invalid") === "true") fn();
    });
  });
  $("fullName").addEventListener("input", () => {
    if ($("fullName").getAttribute("aria-invalid") === "true") checkFullName();
  });
  $("password").addEventListener("input", () => {
    if ($("password").getAttribute("aria-invalid") === "true") checkPassword();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearOutput();

    const results = [
      checkFullName(), checkStudentNumber(), checkEmail(), checkMobile(),
      checkPassword(), checkConfirm(), checkCourse(), checkTerms()
    ];

    if (!results.every(Boolean)) {
      const firstBad = fields.find((id) => $(id).getAttribute("aria-invalid") === "true");
      if (firstBad) $(firstBad).focus();
      return;
    }

    $("summaryName").textContent = $("fullName").value.trim();
    $("summaryStudentNumber").textContent = $("studentNumber").value.trim();
    $("summaryEmail").textContent = $("email").value.trim();
    $("summaryMobileNumber").textContent = $("mobileNumber").value.trim();
    $("summaryCourse").textContent = $("course").value;
    $("successMessage").textContent = "Registration details validated successfully!";
    $("registrationSummary").hidden = false;
  });

  form.addEventListener("reset", () => {
    fields.forEach((id) => {
      $(id + "Error") && ($(id + "Error").textContent = "");
      $(id).removeAttribute("aria-invalid");
    });
    const fb = $("passwordFeedback");
    fb.textContent = "";
    fb.classList.remove("ok", "bad");
    clearOutput();
  });
}