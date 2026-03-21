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
