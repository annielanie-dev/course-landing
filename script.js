// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: "smooth" });
    }
  });
});

// walidacja + lokalne zapamiętywanie formularza
const form = document.getElementById("signupForm");
const formMsg = document.getElementById("formMsg");

if (form) {
  // przywróć szkic z localStorage (opcjonalnie)
  const draft = JSON.parse(localStorage.getItem("signup-draft") || "{}");
  ["name", "email", "level"].forEach((k) => {
    if (draft[k] && form.elements[k]) form.elements[k].value = draft[k];
  });

  form.addEventListener("input", () => {
    const data = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      level: form.elements.level.value,
    };
    localStorage.setItem("signup-draft", JSON.stringify(data));
  });

  form.addEventListener("submit", (e) => {
    // prosty frontowy check (Netlify i tak jeszcze zwaliduje)
    let ok = true;

    const setError = (name, msg) => {
      const el = form.querySelector(`[data-error-for="${name}"]`);
      if (el) el.textContent = msg || "";
    };

    // czy imię
    if (!form.elements.name.value.trim()) {
      setError("name", "Podaj imię i nazwisko");
      ok = false;
    } else setError("name", "");

    // email pattern
    const email = form.elements.email.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setError("email", "Podaj poprawny email");
      ok = false;
    } else setError("email", "");

    // poziom
    if (!form.elements.level.value) {
      setError("level", "Wybierz poziom");
      ok = false;
    } else setError("level", "");

    // zgoda
    const consent = form.elements.consent.checked;
    if (!consent) {
      setError("consent", "Wymagana zgoda");
      ok = false;
    } else setError("consent", "");

    if (!ok) {
      e.preventDefault();
      formMsg.textContent = "Popraw zaznaczone pola.";
      return;
    }

    // czyścimy szkic po udanym submicie (po stronie success page też można)
    localStorage.removeItem("signup-draft");
    formMsg.textContent = "Wysyłam zgłoszenie...";
  });
}
