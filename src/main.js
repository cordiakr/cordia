import './style.css';

// 공통 헤더 및 풋터 주입
const headerHtml = `
<header>
  <div class="logo">
    <a href="/">
      <img src="/logo.png" alt="Cordia" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
      <span class="logo-text" style="display: none;">Cordia.</span>
    </a>
  </div>
  <nav>
    <ul>
      <li><a href="/about/">회사소개</a></li>
      <li><a href="/products/">제품 소개</a></li>
      <li><a href="/support/">고객지원</a></li>
    </ul>
  </nav>
</header>
`;

const footerHtml = `
<footer>
  <p>&copy; ${new Date().getFullYear()} Cordia. All rights reserved.</p>
</footer>
`;

document.body.insertAdjacentHTML('afterbegin', headerHtml);
document.body.insertAdjacentHTML('beforeend', footerHtml);

// 부드러운 스크롤 (Smooth Scrolling)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 영웅 영역 슬라이더 (Hero Slider)
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let slideInterval;

  const showSlide = (index) => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  };

  const startAutoPlay = () => {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoPlay(); // 클릭 시 타이머 초기화
    });
  });

  if (slides.length > 0) {
    startAutoPlay();
  }
});
