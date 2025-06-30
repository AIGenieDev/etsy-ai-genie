// reset.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  https://gvfjlzmnyfmtqdyquawp.supabase.co',          // 替换成你的 Supabase 项目 URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4'                          // 替换成你的 Supabase 公共 anon key
)

window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get("access_token");

  if (!accessToken) {
    document.getElementById("status").textContent = "❌ Missing access_token";
    return;
  }

  // 设置 session
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: ''  // 可省略
  });

  if (sessionError) {
    document.getElementById("status").textContent = "❌ Failed to set session: " + sessionError.message;
    return;
  }

  // 监听按钮
  document.getElementById("reset-btn").addEventListener("click", async () => {
    const newPassword = document.getElementById("new-password").value;

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      document.getElementById("status").textContent = "❌ " + error.message;
    } else {
      document.getElementById("status").textContent = "✅ Password updated successfully!";
    }
  });
});
