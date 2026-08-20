    const circles = document.querySelectorAll('.terminal-point');
    let current = 0;   // индекс активного круга

    // Начальное состояние – горит красный
    circles[current].classList.add('active');

    setInterval(() => {
      // Убираем подсветку у всех
      circles.forEach(c => c.classList.remove('active'));

      // Переключаем на следующий (0 → 1 → 2 → 0)
      current = (current + 1) % circles.length;
      circles[current].classList.add('active');
    }, 500); // переключение каждую секунду