/* ================================================================
   PROJECTS PAGE — FILTER JS
================================================================ */

(function() {
  const filterBtns  = document.querySelectorAll('.proj-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all' || card.classList.contains(filter)) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
})();


/* ================================================================
   PROJECT CARD SLIDER
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".slider").forEach(slider => {

    const slidesContainer = slider.querySelector(".slides");
    const slides = slider.querySelectorAll(".slide");
    const nextBtn = slider.querySelector(".next");
    const prevBtn = slider.querySelector(".prev");

    if (!slidesContainer || slides.length <= 1) return;

    let current = 0;
    const totalSlides = slides.length;

    function updateSlide() {
      slidesContainer.style.transform = `translateX(-${current * 100}%)`;
    }

    nextBtn.addEventListener("click", () => {
      current = (current + 1) % totalSlides;
      updateSlide();
    });

    prevBtn.addEventListener("click", () => {
      current = (current - 1 + totalSlides) % totalSlides;
      updateSlide();
    });

    // Auto slide
    setInterval(() => {
      current = (current + 1) % totalSlides;
      updateSlide();
    }, 4500);

  });

});

document.querySelectorAll(".video-card").forEach(card => {
  const video = card.querySelector("video");
  const btn = card.querySelector(".play-btn");

  btn.addEventListener("click", () => {
    video.play();
    btn.style.display = "none";
  });
});