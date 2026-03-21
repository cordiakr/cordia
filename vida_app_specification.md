# VIDA (macOS Media Player) - 애플리케이션 명세서

## 1. 개요 (Overview)
* **앱 이름**: VIDA (Cordia VIDA)
* **플랫폼**: macOS (Native System App)
* **프레임워크**: SwiftUI, AppKit, AVFoundation
* **목표**: 가볍고 빠르며 키보드 중심의 직관적인 조작이 가능한 하이엔드 네이티브 미디어 플레이어
* **비즈니스 모델**: Cordia Pro Pass (Hard Paywall) – 1회 결제로 모든 Cordia 패밀리 앱 잠금 해제

---

## 2. 주요 기능 및 스펙 (Core Features)

### 2.1 미디어 재생 (Media Playback)
* **기반 기술**: Apple AVFoundation (`AVPlayer`, `AVPlayerItem`)
* **지원 포맷 (로컬)**: MP4, MOV, AVI, MKV, MP3, M4A, FLAC, WAV, AAC, OGG 등 주요 미디어
* **지원 포맷 (스트리밍)**: HTTP Live Streaming (HLS, `.m3u8`), 원격 URL 미디어 포맷
* **정밀 제어**: 
    * 1프레임 단위 전/후 탐색 (`<`, `>` 키)
    * 사용자 설정된 커스텀 시크(Seek) 간격 지원 (1초, 3초, 5초, 10초)
    * 배속 제어 (0.5x ~ 2.0x 지원, 단축키로 2배속 일시 유지)
    * `Space` (재생/일시정지), `J/K/L` 기반 프레임 이동

### 2.2 구간 제어 (A-B Loop & Export)
* 시작점(A)과 끝점(B)을 지정하여 해당 구간 무한 반복 재생
* **구간 내보내기 (Segment Export)**: 선택한 A-B 구간만 원본 퀄리티를 유지한 채 독립된 파일로 자르기(Trim) 및 저장 기능 제공 (App Sandbox 준수, 사용자 저장 폴더 선택 다이얼로그 `NSSavePanel` 연동)

### 2.3 이퀄라이저 & 오디오 (EQ & Audio)
* **10-밴드 그래픽 이퀄라이저 (10-Band EQ)**: 32Hz ~ 16kHz까지 세밀한 주파수 조정 기능 지원 (`AVAudioUnitEQ`)
* **프리셋 (Presets)**: 기본, 팝, 록, 클래식, 댄스, 영화 등 내장 프리셋 지원
* **오디오 싱크**: 영상과 오디오의 싱크가 맞지 않을 때 ±5.0초 범위 내에서 오디오 딜레이 미세 조절
* **출력 디바이스**: 시스템의 다중 오디오 출력 디바이스 중 사용자가 원하는 디바이스를 직접 선택하는 스위칭 기능
* **다중 오디오 트랙**: MKV 등의 다국어 오디오 트랙 스위칭 지원 (`AVMediaSelectionGroup`)

### 2.4 스마트 플레이리스트 (Smart Playlist)
* 여러 개의 미디어 파일을 추가하여 순차 전/후 재생 목록 관리
* 파일 관리 로직:
    * Drag & Drop을 통한 파일/폴더 통째로 추가 지원
    * 파일을 한 개만 열었을 경우, 해당 파일과 같은 디렉토리에 있는 미디어 파일들을 스마트하게 스캔하여 자동 로드
* 반복 모드 3종 지원: `안 함(Off)` / `한 곡 반복(One)` / `전체 반복(All)`
* 보안 스코프 북마크(Security-Scoped Bookmark) 연동을 통한 Sandbox 환경 내 영구 파일 엑세스 권한 보장

### 2.5 자막 (Subtitles)
* 기본적으로 AVFoundation이 지원하는 내부 자막 포맷(VTT, CC) 지원
* 외부 `.srt` 자막 파일 파싱 모듈 구현 (`SubtitleParser.swift`)
* 화면에 ZStack 오버레이로 자막 표시 및 설정 창을 통한 오프셋(싱크 ±5.0초 단위) 조절

### 2.6 고급 창 제어 (Window Management)
* **비율 제어**: 동영상 원본 비율(Aspect Ratio) 강제 유지 사이즈업/다운
* **항상 위에 (Always on Top)** 연동 구현 (`NSWindow.Level.floating`)
* **단축키 기반 해상도 크기 조정**: 원본 50%(숫자 1), 75%(2), 100%(3), 150%(4), 200%(5) 크기 단축키 윈도우 리사이징

---

## 3. UI 및 사용성 (UX/UI)

### 3.1 컨트롤 바 (Control Bar)
* 마우스 포인터의 움직임에 반응(Hover)하거나, 창이 리사이즈될 때 일정 시간(2~3초) 후 컨트롤 패널 자동 숨김 (Fade out). 
* 전체 윈도우 내부 레이아웃을 해치지 않는 투명 오버레이 Material Design 적용

### 3.2 macOS 시스템 연동 
* **Media Keys 연동**: Apple 키보드 및 블루투스 이어폰의 하드웨어 재생/일시정지/앞/뒤 이동 버튼에 맞춰 백그라운드 이벤트 반응 (`MPRemoteCommandCenter`)
* **터치바 연동 / 메뉴바 (Responder Chain)** 연동

### 3.3 다국어 지원 (Localization)
* 앱 전반의 텍스트와 도움말 메뉴 16개국 언어 지원.
* **지원 언어**: 한국어(기본설정), 영어, 일본어, 중국어(간체/번체), 독일어, 프랑스어, 포르투갈어, 스페인어, 스페인어(라틴 아메리카), 이탈리아어, 네덜란드어, 스웨덴어, 폴란드어, 덴마크어, 힌디어

---

## 4. 아키텍처 및 정책 (App Policies & Architecture)

### 4.1 앱 보안 환경 (App Sandbox & Hardened Runtime)
* Apple Mac App Store 제출을 위한 100% 샌드박스 정책 적용
* 적용된 Entitlements:
  * `com.apple.security.app-sandbox`
  * `com.apple.security.files.user-selected.read-write` (파일 내보내기용 사용자 권한)
  * `com.apple.security.files.bookmarks.app-scope` (재생 목록 및 최근 파일 북마크 기록 유지)
  * `com.apple.security.network.client` (HLS 스트리밍을 위한 네트워크)

### 4.2 스토어 판매 전략 (StoreKit 2 / App Group)
* **비소모성 인앱 결제 (Non-Consumable IAP)** 적용
* 제품 모델 **Cordia Pro Pass**: 가격  9.99 달러 (출시 기념 2.99 달러 설정)
* **공유 Keychain 동기화 (Shared Keychain by App Group)**: 
  * App Group: `group.com.cordia.shared`
  * VIDA 결제 시 `KeyMap`, `QuickFolder` 등 다른 코르디아 계열사 앱의 제한도 즉시 해제됨.
* **하드 페이월 패턴 (Hard Paywall)**:
  * 앱 실행 시 최상위 WindowGroup 에서 결제 유무 판별
  * 미결제(Free) 상태 시, 모든 기능을 블락(Block)하고 앱 종료(`exit(0)`) 혹은 인앱결제 프로세스로만 한정하여 제한된 뷰 표시.

---

## 5. 프로젝트 구조 요약

| 파일 단위 | 역할 (Description) |
| --- | --- |
| `VIDAApp.swift` | 앱 엔트리 포인트 (진입점), App Group 결제 상태 판독을 통한 Paywall 뷰 분기 및 App Delegate / Commands 핸들링 |
| `CordiaProPass.swift` | StoreKit 2 기반의 공유 결제 관리 매니저, 공유 키체인 로직 담당 |
| `PurchaseView.swift` | Pro Pass 유료 구독 안내 및 이탈/앱 종료 UI 구현부 |
| `PlayerViewModel.swift` | AVFoundation의 각종 상태 변화, 퍼포먼스 제어, URL 로딩 등을 관장하는 메인 컨트롤 비즈니스 로직 뷰모델 |
| `PlayerViewModel+*.swift` | 뷰모델의 다중 Extension (EQ, RemoteCommand, Playlist, Subtitle 파트 분할 관리 모듈) |
| `ContentView.swift` | 플레이어 비디오 계층 구조의 최상단 뷰 세팅 |
| `PlayerView.swift` | 커스텀 AVPlayerLayer 등을 화면에 표시하는 실제 영상 출력지 (`NSViewRepresentable` 사용) |
| `EQView.swift`, `PlaylistView.swift`| 동영상 외부 스냅 오버레이로 작동하는 부가 기능 (이퀄라이저 필터 미세조정 및 재생목록) |
| `HelpView.swift` | 단축키 및 기능에 대한 설명을 담은 16개 단위의 로컬라이징 퀵 가이드 뷰 |
