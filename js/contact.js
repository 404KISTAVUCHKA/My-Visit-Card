/**
 * Форма обратной связи — перехват submit и визуальная обратная связь.
 *
 * Чтобы подключить реальную отправку (fetch, EmailJS и т.д.),
 * добавьте запрос внутри обработчика submit перед сменой текста кнопки.
 */
(function () {
  const form = $(".contact-form");
  if (!form) return;

  const messageField = form.querySelector(".textarea-box textarea");
  if (messageField) {
    const syncMessageHeight = () => {
      messageField.style.height = "auto";
      messageField.style.height = `${messageField.scrollHeight}px`;
    };

    messageField.addEventListener("input", syncMessageHeight);
    window.addEventListener("load", syncMessageHeight);
    syncMessageHeight();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const btn = $(".send-btn");
    if (!btn) return;

    btn.classList.add("sent");
    btn.innerHTML = "<span>Сообщение отправлено ✓</span>";
  });
})();
