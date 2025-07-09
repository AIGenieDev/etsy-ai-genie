// === reset.js ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 创建 Supabase 客户端
const supabase = createClient(
  'https://gvfjlzmnyfmtqdyquawp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4'
);

// 获取 HTML 元素
const statusDiv = document.getElementById("status");
const resetBtn = document.getElementById("reset-btn");
const newPasswordInput = document.getElementById("new-password");

// 从 URL hash 中提取 access_token 和 refresh_token
const url = new URL(window.location.href);
const accessToken = url.hash.match(/access_token=([^&]*)/)?.[1];
const refreshToken = url.hash.match(/refresh_token=([^&]*)/)?.[1];

if (!accessToken || !refreshToken) {
  statusDiv.textContent = "❌ Invalid or expired reset link.";
  statusDiv.className = "message error";
} else {
  verifyAndInitSession();
}

// ✅ 验证 token 并设置会话
async function verifyAndInitSession() {
  try {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) throw sessionError;

    console.log("✅ Session established with token");
  } catch (err) {
    console.error("❌ Failed to set session:", err);
    statusDiv.textContent = "❌ Failed to verify identity. Please try again.";
    statusDiv.className = "message error";
  }
}

// 🔐 监听 captcha 页面返回的 token
window.addEventListener("message", async function handleCaptcha(event) {
  if (event.origin !== "https://aigeniedev.github.io") return;

  const captchaToken = event.data["hcaptcha-token"];
  console.log("🔐 Captcha token received:", captchaToken);

  if (!captchaToken) {
    statusDiv.textContent = "❌ Captcha verification failed.";
    statusDiv.className = "message error";
    return;
  }

  const newPassword = newPasswordInput?.value?.trim();
  if (!newPassword || newPassword.length < 6) {
    statusDiv.textContent = "❗ Password must be at least 6 characters.";
    statusDiv.className = "message error";
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { captchaToken }
    );

    if (error) {
      console.error("❌ Failed to update password:", error);
      statusDiv.textContent = "❌ Failed to update password. Please try again.";
      statusDiv.className = "message error";
    } else {
      statusDiv.textContent =
        "✅ Password updated successfully! You can now close this tab and log in from the extension.";
      statusDiv.className = "message success";
      resetBtn.disabled = true;
      newPasswordInput.disabled = true;
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    statusDiv.textContent = "❌ Unknown error. Please try again.";
    statusDiv.className = "message error";
  }

  window.removeEventListener("message", handleCaptcha);
}, { once: true });

// ⏎ 点击按钮后打开 hCaptcha 验证页面
resetBtn?.addEventListener("click", () => {
  const newPassword = newPasswordInput?.value?.trim();
  if (!newPassword || newPassword.length < 6) {
    statusDiv.textContent = "❗ Password must be at least 6 characters.";
    statusDiv.className = "message error";
    return;
  }

  window.open(
    "https://aigeniedev.github.io/etsy-ai-genie/captcha.html",
    "hcaptcha",
    "width=500,height=600"
  );
});
