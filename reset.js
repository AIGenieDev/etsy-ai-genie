// reset.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ✅ 初始化 Supabase 客户端
const supabase = createClient(
  'https://gvfjlzmnyfmtqdyquawp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4'
);

// ✅ 如果是 Supabase 重定向传来的 token，就自动转为 hash
const queryParams = new URLSearchParams(window.location.search);
const token = queryParams.get("token");
const type = queryParams.get("type");

if (token && type === "recovery") {
  const newUrl = `${window.location.origin}${window.location.pathname}#access_token=${token}&type=recovery`;
  window.location.replace(newUrl);
}

window.addEventListener('DOMContentLoaded', async () => {
  // ✅ 从 URL hash 中获取 access_token 和 refresh_token
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get("access_token");
  const refreshToken = urlParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    document.getElementById("status").textContent = "❌ Missing access_token or refresh_token in URL.";
    return;
  }

  // ✅ 设置 Supabase 会话
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (sessionError) {
    document.getElementById("status").textContent = "❌ Failed to set session: " + sessionError.message;
    return;
  }

  // ✅ 按钮点击逻辑
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      const newPassword = document.getElementById("new-password").value;

      if (!newPassword || newPassword.length < 6) {
        document.getElementById("status").textContent = "❌ Please enter a password with at least 6 characters.";
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        document.getElementById("status").textContent = "❌ " + error.message;
      } else {
        document.getElementById("status").textContent = "✅ Password updated successfully!";
        setTimeout(() => {
          window.location.href = "login.html"; // ✅ 可选：成功后跳转
        }, 2000);
      }
    });
  } else {
    document.getElementById("status").textContent = "❌ Reset button not found.";
  }
});
