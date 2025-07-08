(function () {
  // ✅ 优先从 hash 中获取 email，例如：#email=sarah@example.com
  function getEmailFromHashOrStorage() {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const emailFromHash = hashParams.get("email");
    if (emailFromHash) {
      localStorage.setItem("checkout_email", emailFromHash);
      console.log("[AutoFill] Email found in HASH:", emailFromHash);
      return emailFromHash;
    }

    const stored = localStorage.getItem("checkout_email");
    console.log("[AutoFill] Email loaded from localStorage:", stored);
    return stored;
  }

  const email = getEmailFromHashOrStorage();

  if (email) {
    const fillEmail = (attempt = 1) => {
      const input = document.querySelector('input[type="email"]');
      if (input) {
        if (input.value === '') {
          input.value = email;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          console.log("[AutoFill] Email auto-filled successfully.");
        } else {
          console.log("[AutoFill] Email field already filled.");
        }
      } else {
        if (attempt < 20) {
          setTimeout(() => fillEmail(attempt + 1), 300);
        } else {
          console.warn("[AutoFill] Email field not found after 20 attempts.");
        }
      }
    };

    fillEmail();
  }
})();
