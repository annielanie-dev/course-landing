// ============ smooth scroll ============
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const id = link.getAttribute('href').slice(1);
  if (!id) return;

  link.addEventListener('click', (e) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


// ============ formularz ============
const form = document.getElementById('signupForm');
const formMsg = document.getElementById('formMsg');

if (form) {
  // helpers
  const $ = (sel) => form.querySelector(sel);
  const setError = (name, msg = '') => {
    const holder = form.querySelector(`[data-error-for="${name}"]`);
    if (holder) holder.textContent = msg;
    const field = form.elements[name];
    if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const encode = (fd) => new URLSearchParams([...fd.entries()]).toString();

  // ---- przywracm wersję roboczą
  try {
    const draft = JSON.parse(localStorage.getItem('signup-draft') || '{}');
    ['name', 'email', 'level'].forEach((k) => {
      if (draft[k] && form.elements[k]) form.elements[k].value = draft[k];
    });
  } catch {}

  // ---- zapisuje szkic
  form.addEventListener('input', () => {
    const data = {
      name: form.elements.name?.value || '',
      email: form.elements.email?.value || '',
      level: form.elements.level?.value || '',
    };
    localStorage.setItem('signup-draft', JSON.stringify(data));
  });

  // ---- walidacja + submit do Netlify
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // honeypot (anty-bot)
    const honey = $('input[name="bot-field"]');
    if (honey && honey.value) return;

    // prosta walidacja
    let ok = true;

    const nameVal = form.elements.name?.value.trim();
    if (!nameVal) {
      ok = false; setError('name', 'Podaj imię i nazwisko');
    } else setError('name');

    const emailVal = form.elements.email?.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) {
      ok = false; setError('email', 'Podaj poprawny email');
    } else setError('email');

    const levelVal = form.elements.level?.value;
    if (!levelVal) {
      ok = false; setError('level', 'Wybierz poziom');
    } else setError('level');

    const consentOk = !!form.elements.consent?.checked;
    if (!consentOk) {
      ok = false; setError('consent', 'Wymagana zgoda');
    } else setError('consent');

    if (!ok) {
      if (formMsg) formMsg.textContent = 'Popraw zaznaczone pola.';
      return;
    }

    // wysyłka
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn?.setAttribute('disabled', 'true');
    if (formMsg) formMsg.textContent = 'Wysyłam zgłoszenie...';

    try {
      const fd = new FormData(form);
      if (!fd.get('form-name')) fd.set('form-name', form.getAttribute('name') || 'zapis-kurs');

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(fd),
      });

      // czyszczę szkic i przekierowuję
      localStorage.removeItem('signup-draft');
      window.location.href = form.getAttribute('action') || '/thank-you.html';
    } catch (err) {
      console.error(err);
      if (formMsg) formMsg.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie.';
      submitBtn?.removeAttribute('disabled');
    }
  });
}
// === Off-canvas menu (mobile) ===
const toggleBtn  = document.querySelector('.menu-toggle');
const menuPanel  = document.querySelector('.nav-menu');
const closeBtn   = document.querySelector('.close-btn');
const backdrop   = document.querySelector('.backdrop');

function openMenu() {
  menuPanel.classList.add('open');
  document.documentElement.classList.add('no-scroll');
  if (backdrop) backdrop.hidden = false;
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  menuPanel.classList.remove('open');
  document.documentElement.classList.remove('no-scroll');
  if (backdrop) backdrop.hidden = true;
  if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
}

toggleBtn?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);
backdrop?.addEventListener('click', closeMenu);

// zamykaj po kliknięciu linku
menuPanel?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// zamykaj Esc
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
