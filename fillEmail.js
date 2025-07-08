(function () {
  // Step 1: 获取并保存 email 参数到 localStorage
  let emailFromURL = new URLSearchParams(window.location.search).get("email");

  if (emailFromURL) {
    localStorage.setItem("checkout_email", emailFromURL);
  } else {
    emailFromURL = localStorage.getItem("checkout_email");
  }

  // Step 2: 自动填入 email 字段
  if (emailFromURL) {
    const fillEmail = () => {
      const input = document.querySelector('input[type="email"]');
      if (input && input.value === '') {
        input.value = emailFromURL;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        setTimeout(fillEmail, 300);
      }
    };

    fillEmail();
  }
})();