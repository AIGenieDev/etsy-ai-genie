// === reset.js ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  'https://gvfjlzmnyfmtqdyquawp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4'
);

// 获取 HTML 元素
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const newPasswordInput = document.getElementById('new-password');

// 支持 hash (#access_token=...) 和 query (?token=...)
const url = new URL(window.location.href);
const hashToken = url.hash.match(/access_token=([^&]*)/)?.[1];
const queryToken = url.searchParams.get('token');
const accessToken = hashToken || queryToken;

// 初始状态
if (!accessToken) {
  statusDiv.textContent = '❌ Invalid or expired link.';
  statusDiv.classList.add('error');
} else {
  verifyToken();
}

// 验证 token 是否有效
async function verifyToken() {
  try {
    await supabase.auth.verifyOtp({ type: 'recovery', token: accessToken });
    console.log("✅ Token verified");
  } catch (err) {
    console.error("❌ Verification failed:", err);
    statusDiv.textContent = err?.message?.includes('was issued in the future')
      ? '⚠️ Please correct your device time and refresh.'
      : '❌ Verification failed. The link may be expired or invalid.';
    statusDiv.classList.add('error');
  }
}

// 监听 hCaptcha 返回 token（必须在 open 之前绑定）
window.addEventListener("message", async function handleCaptcha(event) {
  if (event.origin !== "https://aigeniedev.github.io") return;

  const captchaToken = event.data["hcaptcha-token"];
  console.log("🔐 Captcha token received:", captchaToken);

  if (!captchaToken) {
    statusDiv.textContent = "❌ Captcha verification failed.";
    statusDiv.className = 'message error';
    return;
  }

  const newPassword = newPasswordInput?.value?.trim();
  if (!newPassword || newPassword.length < 6) {
    statusDiv.textContent = '❗ Password must be at least 6 characters.';
    statusDiv.className = 'message error';
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { captchaToken }
    );

    if (error) {
      console.error("❌ Failed to update password:", error);
      statusDiv.textContent = '❌ Failed to update password. Please try again.';
      statusDiv.className = 'message error';
    } else {
      statusDiv.textContent = '✅ Password updated successfully! You can now close this page and re-login from the extension.';
      statusDiv.className = 'message success';
      resetBtn.disabled = true;
      newPasswordInput.disabled = true;
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    statusDiv.textContent = '❌ Unknown error. Please try again.';
    statusDiv.className = 'message error';
  }

  window.removeEventListener("message", handleCaptcha);
}, { once: true });

// 点击“更新密码”按钮 → 打开 hCaptcha 页面
resetBtn?.addEventListener('click', () => {
  const newPassword = newPasswordInput?.value?.trim();
  if (!newPassword || newPassword.length < 6) {
    statusDiv.textContent = '❗ Password must be at least 6 characters.';
    statusDiv.className = 'message error';
    return;
  }

  window.open(
    "https://aigeniedev.github.io/etsy-ai-genie/captcha.html",
    "hcaptcha",
    "width=500,height=600"
  );
});
