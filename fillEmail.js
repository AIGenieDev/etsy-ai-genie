(function () {
  const emailFromURL = new URLSearchParams(window.location.search).get("email");

  if (emailFromURL) {
    const fillEmail = () => {
      const input = document.querySelector('input[type="email"]');
      if (input && input.value === '') {
        input.value = emailFromURL;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        setTimeout(fillEmail, 300); // 重试直到输入框出现
      }
    };

    fillEmail();
  }
})();
