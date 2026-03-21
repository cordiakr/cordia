import './style.css'

document.querySelector('#app').innerHTML = `
<header>
  <div class="logo">Cordia.</div>
  <nav>
    <ul>
      <li><a href="#about">회사 소개</a></li>
      <li><a href="#apps">제품</a></li>
      <li><a href="#support">고객 지원</a></li>
    </ul>
  </nav>
</header>

<main>
  <section id="hero" class="hero">
    <h1>Mac 환경의 새로운 기준</h1>
    <p>Cordia는 macOS에서 가장 강력하고 직관적인 유틸리티 앱을 개발합니다. <br/>생산성을 혁신하고 일상을 단순하게 만드세요.</p>
    <a href="#apps" class="cta-button">제품 모아보기</a>
  </section>

  <section id="about">
    <h2 class="section-title">회사 소개</h2>
    <p class="section-subtitle">Cordia는 완벽한 사용자 경험(UX)과 타협 없는 성능을 바탕으로,
    Mac 사용자에게 꼭 필요한 도구들을 만듭니다.</p>
  </section>

  <section id="apps">
    <h2 class="section-title">우리의 앱</h2>
    <p class="section-subtitle">하나의 Pro Pass로 Cordia의 모든 앱을 경험할 수 있습니다.</p>
    <div class="app-grid">
      <!-- VIDA -->
      <div class="app-card">
        <div class="app-card-icon" style="color: #60a5fa;">▶️</div>
        <h3>VIDA</h3>
        <p>현대적이고 빠른 macOS 전용 미디어 플레이어. 자막 완벽 지원과 강력한 재생 성능을 경험하세요.</p>
        <a href="#" class="download-link" onclick="alert('다운로드 링크 준비 중입니다.')">다운로드</a>
      </div>

      <!-- KeyMap -->
      <div class="app-card">
        <div class="app-card-icon" style="color: #fbbf24;">⌨️</div>
        <h3>KeyMap</h3>
        <p>당신의 워크플로우를 가속화하는 단축키 및 키 매핑 도구. 10개 이상의 다국어 환경까지 지원합니다.</p>
        <a href="#" class="download-link" onclick="alert('다운로드 링크 준비 중입니다.')">다운로드</a>
      </div>

      <!-- QuickFolder -->
      <div class="app-card">
        <div class="app-card-icon" style="color: #34d399;">📁</div>
        <h3>QuickFolder</h3>
        <p>스마트하고 신속한 폴더 관리. 직관적인 드래그 앤 드롭으로 파일을 원하는 위치에 빠르게 이동하세요.</p>
        <a href="#" class="download-link" onclick="alert('다운로드 링크 준비 중입니다.')">다운로드</a>
      </div>

      <!-- CordiaFE -->
      <div class="app-card">
        <div class="app-card-icon" style="color: #a78bfa;">🗂️</div>
        <h3>CordiaFE</h3>
        <p>프로들을 위한 네이티브 macOS 파일 매니저. iOS 기기 내부 파일 탐색 및 향상된 뷰어를 제공합니다.</p>
        <a href="#" class="download-link" onclick="alert('다운로드 링크 준비 중입니다.')">다운로드</a>
      </div>
    </div>
  </section>

  <section id="support">
    <h2 class="section-title">고객 지원</h2>
    <div class="support-container">
      <h3>무엇을 도와드릴까요?</h3>
      <p>앱 사용 중 궁금한 점이 있거나 문제가 발생했다면 언제든 연락해 주세요.</p>
      <div class="contact-links">
        <a href="mailto:support@cordia.kr" class="contact-link">
          이메일 지원
        </a>
        <a href="#" class="contact-link" onclick="alert('준비 중입니다.')">
          자주 묻는 질문
        </a>
      </div>
    </div>
  </section>
</main>

<footer>
  <p>&copy; ${new Date().getFullYear()} Cordia. All rights reserved.</p>
</footer>
`

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
