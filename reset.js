// === reset.js ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  'https://gvfjlzmnyfmtqdyquawp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4'
);

// 等待 DOM 加载完成再绑定事件
window.addEventListener('DOMContentLoaded', () => {
  const statusDiv = document.getElementById('status');
  const resetBtn = document.getElementById('reset-btn');
  const newPasswordInput = document.getElementById('new-password');
  const togglePasswordBtn = document.getElementById('toggle-password');

  // 密码可见性切换功能
  if (togglePasswordBtn && newPasswordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isHidden = newPasswordInput.type === 'password';
      newPasswordInput.type = isHidden ? 'text' : 'password';
      togglePasswordBtn.src = isHidden ? 'eye-open.png' : 'eye-closed.png';
    });
  }

  // 处理 token
  const url = new URL(window.location.href);
  const hashToken = url.hash.match(/access_token=([^&]*)/)?.[1];
  const queryToken = url.searchParams.get('token');
  const accessToken = hashToken || queryToken;

  if (!accessToken) {
    statusDiv.textContent = '❌ Invalid or expired link.';
    statusDiv.classList.add('error');
  } else {
    verifyToken(accessToken);
  }

  async function verifyToken(token) {
    try {
      await supabase.auth.verifyOtp({ type: 'recovery', token });
      console.log("✅ Token verified");
    } catch (err) {
      console.error("❌ Verification failed:", err);
      statusDiv.textContent = err?.message?.includes('was issued in the future')
        ? '⚠️ Please correct your device time and refresh.'
        : '❌ Verification failed. The link may be expired or invalid.';
      statusDiv.classList.add('error');
    }
  }

  resetBtn?.addEventListener('click', async () => {
    const newPassword = newPasswordInput?.value?.trim();
    if (!newPassword || newPassword.length < 6) {
      statusDiv.textContent = '❗ Password must be at least 6 characters.';
      statusDiv.className = 'message error';
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      statusDiv.textContent = '❌ Failed to update password. Please try again.';
      statusDiv.className = 'message error';
    } else {
      statusDiv.textContent = '✅ Password updated successfully! You can now close this page and re-login from the extension.';
      statusDiv.className = 'message success';
      resetBtn.disabled = true;
      newPasswordInput.disabled = true;
      togglePasswordBtn.style.pointerEvents = 'none';
      togglePasswordBtn.style.opacity = 0.4;
    }
  });
});
