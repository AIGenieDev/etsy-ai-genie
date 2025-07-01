// === popup.js ===
const supabaseUrl = 'https://gvfjlzmnyfmtqdyquawp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Zmpsem1ueWZtdHFkeXF1YXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjQ3MjgsImV4cCI6MjA2NTk0MDcyOH0.PENbBzU2LHJz883VFVW5OfLTXhFNrRz0gE356M843S4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const createAccountLink = document.getElementById('create-account');
const registerPage = document.getElementById('register-page');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const statusText = document.getElementById('statusText');
const welcomeText = document.getElementById('welcome');
const upgradeBtn = document.getElementById('upgrade');
const upgradePlusBtn = document.getElementById('upgrade-plus');
const currentPlanDisplay = document.getElementById('current-plan');
const remainingText = document.getElementById('remaining-count');
const startFreeText = document.getElementById('start-free-text');
const changePasswordBtn = document.getElementById('change-password');
const forgotPasswordBtn = document.getElementById('forgot-password');
const planCards = {
  Free: document.getElementById('card-free'),
  Plus: document.getElementById('card-plus'),
  Pro: document.getElementById('card-pro')
};
const USAGE_LIMITS = { Free: 10, Plus: 50, Pro: 500 };

// === 页面初始化 ===
window.addEventListener('DOMContentLoaded', async () => {
  const isResetPage = window.location.pathname.includes('reset.html');

  // ===== 密码重设页面逻辑 =====
  if (isResetPage) {
    const url = new URL(window.location.href);
    const accessToken = url.hash.match(/access_token=([^&]*)/)?.[1];
    const statusDiv = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');

    if (accessToken) {
      try {
        await supabase.auth.verifyOtp({ type: 'recovery', token: accessToken });
        console.log("✅ Supabase verified recovery token");
      } catch (err) {
        console.error("❌ Recovery token verification failed:", err);
        if (err?.message?.includes('was issued in the future')) {
          statusDiv.textContent = '⚠️ Please correct your device time and refresh.';
        } else {
          statusDiv.textContent = '⚠️ Verification failed. The link may be expired or invalid.';
        }
        return;
      }
    } else {
      statusDiv.textContent = '❌ Invalid or expired link';
      return;
    }

    resetBtn?.addEventListener('click', async () => {
      const newPassword = document.getElementById('new-password')?.value;
      if (!newPassword || newPassword.length < 6) {
        statusDiv.textContent = 'Password must be at least 6 characters.';
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      statusDiv.textContent = error
        ? '❌ Failed to update password. Please try again.'
        : '✅ Password updated successfully. Please re-login via the extension.';
    });

    return; // 停止执行插件主功能
  }

  // ===== 插件主功能逻辑（popup.html） =====

  // token 登录（来自 reset 链接）
  const hash = window.location.hash;
  if (hash.includes('access_token=')) {
    const token = hash.split('access_token=')[1].split('&')[0];
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    if (!error) {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (email) {
        await supabase
          .from('users')
          .upsert([{ email, plan: 'Free', usage_count: 0, last_used: null }], { onConflict: 'email' });
      }
      history.replaceState({}, document.title, window.location.pathname);
    }
  }

  await updateUI();
  document.querySelector('.nav-item[data-target="home"]')?.click();
  
  document.getElementById('upgrade')?.addEventListener('click', goToPlans);
  
  
  // Free Plan 的“Change Plan”按钮点击后跳转到 FAQ 页面并展开取消订阅
document.getElementById('card-free')?.querySelector('button')?.addEventListener('click', () => {
  // 切换导航栏高亮
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector('.nav-item[data-target="faq"]')?.classList.add('active');

  // 切换内容区域显示
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById('faq')?.classList.add('active');

  // 展开“取消订阅”FAQ项
  const cancelFaq = Array.from(document.querySelectorAll('.faq-entry'))
    .find(entry => entry.textContent.toLowerCase().includes('cancel'));
  if (cancelFaq) {
    cancelFaq.classList.add('open');
    cancelFaq.scrollIntoView({ behavior: 'smooth' });
  }
});
  
  
  

  loginBtn?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.value,
      password: passwordInput.value
    });

    if (error) {
      let msg = error.message;
      if (msg.includes('missing email or phone')) msg = 'missing email';
      else if (msg.includes('Invalid login credentials')) msg = 'Invalid Email or password';
      statusText.textContent = `❌ Login failed: ${msg}`;
    } else {
      statusText.textContent = '';
      await updateUI();
      chrome.tabs.query({ url: 'https://www.etsy.com/messages*' }, (tabs) => {
        for (const tab of tabs) chrome.tabs.reload(tab.id);
      });
    }
  });

  forgotPasswordBtn?.addEventListener('click', async () => {
    const email = emailInput.value;
    if (!email) return alert("⚠️ Please enter your email above first.");
    
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://aigeniedev.github.io/etsy-ai-genie/reset.html'
});

	
	
    alert(error ? "❌ Failed: " + error.message : "📧 Password reset link sent!");
  });

  document.getElementById('register-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await registerUser();
  });

  createAccountLink?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    registerPage?.classList.add('active');
  });

  document.getElementById('back-to-login')?.addEventListener('click', () => {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById('home')?.classList.add('active');
  });

  logoutBtn?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    chrome.storage.local.clear();
    statusText.textContent = '';
    updateUI();
  });

  // Pro Plan 的“Change Plan”按钮
  planCards['Pro']?.querySelector('button')?.addEventListener('click', () => {
    openLemonSqueezyCheckout('Pro');
  });

  // Plus Plan 的“Change Plan”按钮（供未来从 Pro 降级回来）
  planCards['Plus']?.querySelector('button')?.addEventListener('click', () => {
    openLemonSqueezyCheckout('Plus');
  });



  });

  changePasswordBtn?.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return alert("⚠️ You must be logged in to change your password.");
    
	const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
  redirectTo: 'https://aigeniedev.github.io/etsy-ai-genie/reset.html'
});

	
	
    alert(error ? "❌ Failed: " + error.message : "📧 Reset link sent!");
  });

  document.querySelectorAll('.faq-entry').forEach(entry => {
    entry.addEventListener('click', () => {
      entry.classList.toggle('open');
    });
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');
      const target = item.dataset.target;
      document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === target) section.classList.add('active');
      });
    });
  });

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

const name = contactForm.querySelector("#contact-name")?.value || '';
const email = contactForm.querySelector("#contact-email")?.value || '';
const message = contactForm.querySelector("#contact-message")?.value || '';

if (!name.trim() || !email.trim() || !message.trim()) {
  alert('❗ Please fill out all fields.');
  return;
}

    try {
		 const ticketId = generateTicketNumber();  // 添加这一行
      // 模拟成功发送（你可以替换为真实 API 调用）
      alert(`📩 Your message has been sent!\nTicket ID: ${ticketId}\nWe typically respond within one business day via email.`);
      contactForm.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("❌ Failed to send your message. Please try again.");
    }
  });
}

// 注册函数（保留原样）
async function registerUser() {
  const email = document.getElementById('register-email')?.value;
  const password = document.getElementById('register-password')?.value;
  const name = document.getElementById('register-name')?.value;
  const errorDisplay = document.getElementById("register-error-msg");
  errorDisplay.textContent = "";
  if (!email || !password || !name) {
    errorDisplay.textContent = "Please fill in all fields.";
    return;
  }
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    });
    if (signUpError) {
      errorDisplay.textContent = signUpError.message.includes("already registered")
        ? "This email is already registered."
        : signUpError.message;
      return;
    }
    await supabase.auth.updateUser({ data: { display_name: name } });
    await supabase
      .from('users')
      .upsert([{ email, plan: 'Free', usage_count: 0, last_used: null }], { onConflict: 'email' });
    alert("🎉 Registered! Welcome aboard — start using Etsy AI Genie!");
    window.location.reload();
  } catch (err) {
    errorDisplay.textContent = "Something went wrong. Please try again.";
  }
}

// UI更新函数（保留原样）
async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const email = session.user.email;
    const displayName = (session.user.user_metadata?.display_name || email).toUpperCase();
    const { data, error } = await supabase
      .from('users')
      .select('plan, usage_count, last_used')
      .eq('email', email).single();
    let plan = data?.plan?.toString().trim();
    if (!['Free', 'Plus', 'Pro'].includes(plan)) plan = 'Free';
    chrome.storage.local.set({ user_email: email, user_plan: plan });
    authSection.style.display = 'none';
    userSection.style.display = 'block';
    if (startFreeText) startFreeText.style.display = 'none';
    welcomeText.innerHTML = `
      <div style="text-align: center;">
        <div style="font-weight: bold; font-size: 25px;margin-top: 30px;">WELCOME</div>
        <img src="images/user.png" alt="User Icon" style="width: 60px;height: 60px;border-radius: 50%;margin: 12px auto 8px;display: block;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);" />
        <div style="font-weight: bold; font-size: 20px;margin-top: 15px;">${displayName}</div>
        <div style="margin-top: 8px;">
          <span style="background: linear-gradient(to right, #f8a4d8, #6c63ff);color: white;padding: 4px 14px;border-radius: 20px;display: inline-block;font-size: 14px;font-weight: 500;">
            Plan: ${plan}
          </span>
        </div>
      </div>
    `;
    currentPlanDisplay.textContent = `Your Plan: ${plan}`;
    if (upgradePlusBtn) {
  upgradePlusBtn.style.display = (plan === 'Free') ? 'inline-block' : 'none';
}
    upgradeBtn.style.display = (plan !== 'Pro') ? 'inline-block' : 'none';
    setCardAsCurrent(`card-${plan.toLowerCase()}`);
    const today = new Date().toISOString().split("T")[0];
    const count = data?.last_used === today ? data.usage_count || 0 : 0;
    const max = USAGE_LIMITS[plan];
    remainingText.innerHTML = max === Infinity
      ? `<div style="font-size: 22px; color: #6c63ff; margin-top: 10px;">UNLIMITED</div>`
      : `<div style="margin-top: 10px; font-size: 26px; color: #6c63ff;">${Math.max(0, max - count)} / ${max}</div>`;
  } else {
    authSection.style.display = 'block';
    userSection.style.display = 'none';
    welcomeText.textContent = '';
    remainingText.textContent = '';
    if (startFreeText) startFreeText.style.display = 'block';
  }
}



function setCardAsCurrent(cardId) {
  const allCardIds = ['card-free', 'card-plus', 'card-pro'];
  allCardIds.forEach(id => {
    const card = document.getElementById(id);
    const btn = card?.querySelector('button');
    if (!card || !btn) return;
    if (id === cardId) {
      btn.disabled = true;
      btn.textContent = 'Current';
      btn.style.background = 'rgba(255,255,255,0.3)';
      btn.style.color = 'white';
    } else {
      btn.disabled = false;
      btn.textContent = 'Change Plan';
      btn.style.background = 'white';
      btn.style.color = 'black';
    }
  });
}





function goToPlans() {
  // 切换页面显示
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById('plans')?.classList.add('active');

  // 切换导航栏高亮
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector('.nav-item[data-target="plans"]')?.classList.add('active');

  // 平滑滚动到顶部
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  

}



function generateTicketNumber() {
  const date = new Date();
  const yyyyMMdd = date.toISOString().slice(0,10).replace(/-/g, ''); // 20250630
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase(); // ABCD12
  return `TKT-${yyyyMMdd}-${randomPart}`;
}

function openLemonSqueezyCheckout(plan) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    const email = session?.user?.email;
    if (!email) return alert("❗ Please log in to upgrade your plan.");
    
    let url = '';
    if (plan === 'Plus') {
      url = `https://etsyaigenie.lemonsqueezy.com/buy/c527b814-22e9-47d1-a68b-132effe701dc?email=${encodeURIComponent(email)}`;
    } else if (plan === 'Pro') {
      url = `https://etsyaigenie.lemonsqueezy.com/buy/f2f577a0-4b14-4c3a-beac-75610175781a?email=${encodeURIComponent(email)}`;
    }

    window.open(url, '_blank');
  });
}
