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
  const $ = (sel) => form.querySelector(sel);
  const setError = (name, msg = '') => {
    const holder = form.querySelector(`[data-error-for="${name}"]`);
    if (holder) holder.textContent = msg;
    const field = form.elements[name];
    if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const encode = (fd) => new URLSearchParams([...fd.entries()]).toString();

  try {
    const draft = JSON.parse(localStorage.getItem('signup-draft') || '{}');
    ['name', 'email', 'level'].forEach((k) => {
      if (draft[k] && form.elements[k]) form.elements[k].value = draft[k];
    });
  } catch {}

  form.addEventListener('input', () => {
    const data = {
      name: form.elements.name?.value || '',
      email: form.elements.email?.value || '',
      level: form.elements.level?.value || '',
    };
    localStorage.setItem('signup-draft', JSON.stringify(data));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honey = $('input[name="bot-field"]');
    if (honey && honey.value) return;

    let ok = true;

    const nameVal = form.elements.name?.value.trim();
    if (!nameVal) { ok = false; setError('name', 'Podaj imię i nazwisko'); } else setError('name');

    const emailVal = form.elements.email?.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) { ok = false; setError('email', 'Podaj poprawny email'); } else setError('email');

    const levelVal = form.elements.level?.value;
    if (!levelVal) { ok = false; setError('level', 'Wybierz poziom'); } else setError('level');

    const consentOk = !!form.elements.consent?.checked;
    if (!consentOk) { ok = false; setError('consent', 'Wymagana zgoda'); } else setError('consent');

    if (!ok) { if (formMsg) formMsg.textContent = 'Popraw zaznaczone pola.'; return; }

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

      localStorage.removeItem('signup-draft');
      window.location.href = form.getAttribute('action') || '/thank-you.html';
    } catch (err) {
      console.error(err);
      if (formMsg) formMsg.textContent = 'Nie udało się wysłać formularza. Spróbuj ponownie.';
      submitBtn?.removeAttribute('disabled');
    }
  });
}

// === mobile ===
(() => {
  const toggleBtn  = document.querySelector('.menu-toggle');
  const menuPanel  = document.querySelector('.nav-menu');
  const closeBtn   = document.querySelector('.close-btn');
  const backdrop   = document.querySelector('.backdrop');
  if (!menuPanel) return;

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
  function setClosedState() {
    menuPanel.classList.remove('open');
    document.documentElement.classList.remove('no-scroll');
    if (backdrop) backdrop.hidden = true;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // zamknij od razu po starcie
  setClosedState();

  // toggle
  toggleBtn?.addEventListener('click', () =>
    menuPanel.classList.contains('open') ? closeMenu() : openMenu()
  );
  closeBtn?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  // zamykaj po kliknięciu linku w panelu
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // zamykaj Esc
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // zamknij przy zmianie szerokości
  const mq = window.matchMedia('(max-width: 820px)');
  const onChange = () => setClosedState();
  mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange);
})();

// płynne przewijanie z uwzględnieniem wysokości sticky headera
(() => {
  const header = document.querySelector('.topbar');
  const headerOffset = header ? header.offsetHeight : 80;

  document.querySelectorAll('.nav-menu a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      // zamknij panel, jeśli otwarty
      const maybeClose = document.querySelector('.nav-menu.open');
      if (maybeClose) {
        setTimeout(() => { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerOffset, behavior:'smooth' }); }, 10);
      } else {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerOffset, behavior:'smooth' });
      }
    });
  });
})();
