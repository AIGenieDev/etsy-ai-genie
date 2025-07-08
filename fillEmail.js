(function () {
  // Step 1: 从 URL 获取 email，并保存到 localStorage
  let emailFromURL = new URLSearchParams(window.location.search).get("email");

  if (emailFromURL) {
    localStorage.setItem("checkout_email", emailFromURL);
    console.log("[AutoFill] Email found in URL:", emailFromURL);
  } else {
    emailFromURL = localStorage.getItem("checkout_email");
    console.log("[AutoFill] Email loaded from localStorage:", emailFromURL);
  }

  // Step 2: 如果获取到了 email，尝试自动填入输入框
  if (emailFromURL) {
    const fillEmail = (attempt = 1) => {
      const input = document.querySelector('input[type="email"]');
      if (input) {
        if (input.value === '') {
          input.value = emailFromURL;
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
