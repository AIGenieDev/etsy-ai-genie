(function () {
  // 👉 这里替换为你实际传入的 email
  const email = "youremail@example.com";  // 请在注入前动态替换

  const fill = () => {
    const input = document.querySelector('input[type="email"]');
    if (input && input.value === '') {
      input.value = email;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      setTimeout(fill, 300); // 重试直到输入框出现
    }
  };

  fill();
})();