# 출시 전 품질 개선 루프

이 문서는 `codex-aiethics` 브랜치에서 실제 서비스 출시를 가정하고 진행한 품질 개선 루프 기록이다. 같은 문제를 반복 등록하지 않고, 각 사이클에서 새로 발견한 사용자 리스크와 검증 증거를 남긴다.

## 0. 프로젝트 기준선

1. 프로젝트 목적과 핵심 기능: 한국 초등학생이 AI 윤리 주제를 RPG 탐험, 퀴즈 배틀, 복습, 수집, 교사용 리포트로 학습하는 순수 HTML5 Canvas 게임.
2. 주요 사용자 유형: 초등학생, 수업 운영 교사, 학부모 또는 보호자, 교재/콘텐츠를 관리하는 개발자.
3. 핵심 사용자 플로우: 타이틀 슬롯 선택 -> 이름 입력 -> 탐험 -> 몬스터 대화/퀴즈 -> 저장 -> 일지/리포트/대시보드 확인 -> 백업 또는 내보내기.
4. 주요 화면 목록: 타이틀, 월드, 대화, 배틀, 회피 미니게임, 메뉴, 도감, 일지, 챌린지, 도전과제, 백업/복원, 대시보드, 진단 리포트, 수업 모드, 커스텀 퀴즈, 수료증, 명예의 전당.
5. 현재 폴더/파일 구조: `index.html` 진입점, `src/game.js` 게임 엔진, `src/data.js` 콘텐츠, `src/audio.js` 오디오, `src/sprites.js` 스프라이트, `tools/` 검증/스크린샷/편집 도구, `docs/` 교사용 문서, `shots/` 자동 생성 화면, `.github/workflows/` Pages/Release 자동화.
6. 주요 기술 스택: HTML, CSS, JavaScript, Canvas 2D, Web Audio API, localStorage, PWA service worker, Node.js 검증 스크립트, Playwright 브라우저 스모크 테스트.
7. 상태 관리 방식: `src/game.js`의 단일 런타임 `game` 객체와 슬롯별 localStorage 키를 중심으로 관리한다.
8. API/DB/인증/외부 서비스 연동 구조: 서버 API, DB, 로그인, 외부 API 없음. 학생 기록은 브라우저 localStorage에 저장된다.
9. 현재 빌드/테스트/린트/타입체크 상태: 별도 빌드/타입체크 없음. 현재 검증 명령은 `npm run validate`, `npm test`, `npm run test:browser`, `node --check tools/browser-smoketest.js`.
10. 현재 콘솔 에러 또는 런타임 에러: Cycle 1 브라우저 스모크 테스트와 Cycle 2 재검증에서 console/page error 없음.
11. 현재 모바일/데스크톱 레이아웃 상태: 데스크톱 1440px 대시보드와 모바일 844x390 가로 타이틀 캡처 정상. 모바일 세로는 회전 안내, 가로는 가상 스틱/버튼 UI 제공.
12. 출시를 막을 수 있는 가장 큰 리스크: 서버 계정 없이 localStorage에 수업 기록을 저장하므로 기기/브라우저 데이터 삭제 시 기록 유실 가능성이 있다. 백업/내보내기 안내와 운영 체크리스트가 중요하다.

기준선 캡처:

- Desktop 1440px 대시보드 Before: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-before-dashboard.png`
- Mobile 844x390 타이틀 Before: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-before-mobile-touch.png`

## Cycle 1

### 1. 개발자 관점 검토

Canvas 중심 UI라 게임 화면 자체는 빠르지만, 스크린리더가 현재 모드와 교사용 화면을 이해하기 어렵고 실제 브라우저에서 핵심 흐름을 검증하는 CI가 부족했다.

### 2. 코드리뷰 결과

새로 발견한 문제: 캔버스 단독 UI가 DOM 접근성 상태를 거의 제공하지 않았고, 기존 Node 기반 테스트는 실제 브라우저 렌더링/모바일 회전 안내/교사용 화면 진입을 잡지 못했다.

### 3. 사용자 관점 검토

시나리오: 교사가 태블릿/PC에서 수업 전 게임을 열고 학생 기록 화면을 확인한다. 화면을 볼 수 없는 사용자나 보조기술 사용자는 현재 화면이 타이틀인지, 대시보드인지, 백업 화면인지 파악하기 어려웠다.

### 4. 이번 회차 우선순위

- ID: C1-A11Y-STATUS
- 우선순위: P1
- 문제: Canvas 화면 상태가 보조기술에 전달되지 않음.
- 사용자 영향: 스크린리더 사용자와 접근성 검수자가 핵심 흐름을 이해하기 어렵다.
- 개발/운영 영향: 출시 전 접근성 리스크와 수동 검수 비용 증가.
- 해결 방향: 숨은 live region으로 현재 모드와 교사용 데이터 안내를 요약한다.
- 관련 파일: `index.html`
- 회귀 위험: 상태 문구가 너무 자주 바뀌면 소음이 될 수 있음.
- 검증 방법: 브라우저 테스트에서 주요 모드별 live text 확인.

- ID: C1-BROWSER-SMOKE
- 우선순위: P1
- 문제: 실제 브라우저 렌더링과 모바일 회전/터치 UI를 CI에서 확인하지 않음.
- 사용자 영향: 배포 후 빈 캔버스, 회전 안내, 교사용 화면 진입 오류를 늦게 발견할 수 있다.
- 개발/운영 영향: Pages 배포 품질 게이트 약함.
- 해결 방향: Playwright 기반 브라우저 스모크 테스트 추가 및 GitHub Actions 연결.
- 관련 파일: `tools/browser-smoketest.js`, `.github/workflows/pages.yml`, `package.json`
- 회귀 위험: CI 시간이 늘어남.
- 검증 방법: `npm run test:browser`

### 5. 실제 코드 변경

수정한 파일: `index.html`, `src/game.js`, `tools/browser-smoketest.js`, `package.json`, `.github/workflows/pages.yml`, `sw.js`, `DESIGN.md`

변경 이유: 실제 사용자 접근성과 배포 전 브라우저 회귀 검증을 강화하기 위해서다.

핵심 변경: 접근성 live region, 교사용 로컬 데이터 안내, 디자인 시스템 문서, Playwright 브라우저 스모크 테스트, CI 브라우저 테스트 준비 단계, 서비스워커 캐시 버전 갱신.

추가/수정 테스트: `test:browser` 스크립트와 GitHub Actions 브라우저 테스트 단계 추가.

### 6. 검증 결과

- 실행한 명령: `npm run validate`
- 결과: 통과
- 실행한 명령: `npm test`
- 결과: 통과, 스모크 320개 + 슬롯 24개 검사
- 실행한 명령: `npm run test:browser`
- 결과: 통과
- 실행한 명령: `node --check tools\browser-smoketest.js`
- 결과: 통과

미실행 항목: 별도 `lint`, `typecheck`, `build` 스크립트는 프로젝트에 없음.

### 7. Before/After

Before: 타이틀 하단 단축키 문구가 세 줄로 촘촘했고, 보조기술 상태 안내와 브라우저 스모크 테스트가 없었다.

After: 타이틀 하단 안내가 두 줄로 정리됐고, 보조기술용 현재 화면 설명이 생겼으며, 브라우저에서 타이틀/월드/메뉴/대시보드/리포트/모바일 회전 안내를 검증한다.

스크린샷:

- Desktop title After: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-vqa2-Cc3N0g\desktop-title.png`
- Mobile landscape After: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-vqa2-Cc3N0g\mobile-landscape.png`

### 8. 회차 요약

해결한 문제: Canvas 접근성 상태 안내 부재와 브라우저 기반 배포 회귀 검증 부재.

사용자에게 좋아진 점: 보조기술 사용자가 현재 화면과 교사용 데이터 성격을 이해하기 쉬워졌다.

개발/운영 측면에서 좋아진 점: 실제 브라우저 흐름이 CI에서 깨지는지 볼 수 있다.

새로 생긴 리스크: Playwright 설치 단계로 CI 시간이 늘 수 있다.

다음 후보: 모바일 터치 버튼의 네이티브 버튼화, 교사용 로컬 저장 안내 가시화.

### 9. Issue Ledger 업데이트

- Issue ID: C1-A11Y-STATUS
- 발견 회차: 1
- 심각도: P1
- 상태: fixed
- 유형: accessibility
- 관련 파일: `index.html`
- 사용자 영향: 보조기술 사용자의 화면 이해 어려움
- 해결 회차: 1
- 비고: live region으로 모드별 상태 제공

- Issue ID: C1-BROWSER-SMOKE
- 발견 회차: 1
- 심각도: P1
- 상태: fixed
- 유형: test / deploy
- 관련 파일: `tools/browser-smoketest.js`, `.github/workflows/pages.yml`, `package.json`
- 사용자 영향: 배포 후 핵심 화면 회귀 발견 지연
- 해결 회차: 1
- 비고: Playwright 스모크 테스트 추가

## Cycle 2

### 1. 개발자 관점 검토

모바일 컨트롤은 고정 DOM으로 분리되어 있어 Canvas 게임 입력과 연결하기 쉽지만, 버튼이 `div role="button"`이라 네이티브 포커스와 키보드 활성화가 빠져 있었다. 교사용 대시보드는 기록이 로컬 저장이라는 운영상 중요한 정보를 화면 첫 안내에서 충분히 강조하지 않았다.

### 2. 코드리뷰 결과

새로 발견한 문제:

- 터치 버튼이 네이티브 `<button>`이 아니어서 키보드 접근성과 브라우저 기본 버튼 의미론이 부족했다.
- 교사용 대시보드 상단 안내가 “비교 화면” 설명에 머물러, 수업 후 CSV/백업이 필요하다는 운영 리스크를 즉시 드러내지 못했다.

### 3. 사용자 관점 검토

시나리오: 교사가 태블릿을 외부 키보드나 접근성 스위치와 함께 사용하고, 수업 후 대시보드에서 학생 기록을 확인한다. 기존에는 터치 버튼이 시각적으로는 버튼이지만 포커스 가능한 실제 버튼이 아니어서 보조 입력 장치로 시작하기 어렵고, 대시보드에서 기록 유실 방지 행동도 덜 명확했다.

### 4. 이번 회차 우선순위

- ID: C2-TOUCH-BUTTONS
- 우선순위: P1
- 문제: 모바일 터치 컨트롤이 실제 버튼이 아니고 키보드 활성화 fallback이 부족하다.
- 사용자 영향: 보조기술, 외부 키보드, 스위치 입력 사용자가 핵심 시작/메뉴 조작에서 막힐 수 있다.
- 개발/운영 영향: 접근성 검수에서 역할과 동작 불일치로 지적될 가능성이 높다.
- 해결 방향: 터치 컨트롤을 네이티브 button으로 바꾸고 Space/Enter/click을 기존 입력 큐에 연결한다.
- 관련 파일: `index.html`, `src/game.js`, `tools/browser-smoketest.js`
- 회귀 위험: 터치 이벤트 뒤 합성 click이 중복 입력을 만들 수 있다.
- 검증 방법: Playwright에서 모바일 버튼 태그/label/focus와 Space activation 확인.

- ID: C2-TEACHER-DATA-NOTE
- 우선순위: P1
- 문제: 교사용 대시보드가 로컬 저장과 백업 권장을 충분히 가시화하지 않는다.
- 사용자 영향: 수업 후 CSV/백업을 놓치면 브라우저 데이터 삭제 때 학습 기록을 잃을 수 있다.
- 개발/운영 영향: 출시 후 지원 문의와 데이터 복구 불가 이슈가 늘 수 있다.
- 해결 방향: 대시보드 상단 안내와 접근성 상태 문구에 로컬 저장/내보내기/백업 안내를 넣는다.
- 관련 파일: `src/game.js`, `index.html`
- 회귀 위험: 상단 문구가 길어 대시보드 카드와 겹칠 수 있다.
- 검증 방법: 1440px 대시보드 After 캡처와 브라우저 스모크 테스트.

### 5. 실제 코드 변경

수정한 파일: `index.html`, `src/game.js`, `tools/browser-smoketest.js`

변경 이유: 모바일 버튼의 실제 접근성과 교사용 기록 유실 예방 안내를 강화하기 위해서다.

핵심 코드 변경:

- `.tbtn`을 네이티브 `<button type="button">`으로 변경.
- 버튼 포커스 상태에 `:focus-visible` outline 추가.
- 터치 입력 바인딩에 Space/Enter/click fallback 추가.
- 터치 후 합성 click 중복 입력을 막기 위해 최근 직접 활성화 시간을 확인.
- 버튼 내부 Enter/Space/click/touch 이벤트가 전역 키보드 입력으로 번지지 않도록 전파를 차단.
- 힌트 버튼에도 touch/click/keyboard 활성화를 통합.
- 대시보드 상단 안내를 로컬 저장/CSV/백업 중심 문구로 변경.
- 접근성 live status의 대시보드 설명에도 로컬 저장 안내 추가.
- 브라우저 스모크 테스트에서 모바일 버튼의 태그, type, aria-label, tabIndex, 도감 버튼 Space activation 전파 방지, A 버튼 Space activation 확인 추가.

새 예외 처리: 별도 예외 처리 추가 없음.

데이터 구조/환경변수 변경: 없음.

### 6. 검증 결과

- 실행한 명령: `node --check tools\browser-smoketest.js`
- 결과: 통과
- 실행한 명령: `npm run validate`
- 결과: 통과, 모든 검사 통과
- 실행한 명령: `npm test`
- 결과: 통과, 스모크 320개 + 슬롯 24개 검사
- 실행한 명령: `npm run test:browser`
- 결과: 통과, 브라우저 스모크 테스트 통과

미실행 항목: 별도 `lint`, `typecheck`, `build` 스크립트는 프로젝트에 없음.

### 7. Before/After

Before:

- 대시보드 상단 안내는 “한 기기를 나눠 쓰는 세 학생(슬롯)의 학습 현황을 비교합니다.”였다.
- 모바일 컨트롤은 시각적으로 버튼처럼 보였지만 DOM은 `div role="button"`이었다.

After:

- 대시보드 상단 안내가 “기록은 이 기기에만 저장됩니다. 수업 후 CSV 내보내기·백업을 권장합니다.”로 바뀌었다.
- 모바일 컨트롤은 실제 button 요소이며, Space/Enter/click도 게임 입력으로 동작한다.

스크린샷:

- Desktop dashboard Before: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-before-dashboard.png`
- Desktop dashboard After: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-after-dashboard.png`
- Mobile touch Before: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-before-mobile-touch.png`
- Mobile touch After: `C:\Users\USER\AppData\Local\Temp\codex-aiethics-cycle2\cycle2-after-mobile-touch.png`

남아 있는 UI 문제: 모바일 시각 배치는 유지됐지만, screen reader 실제 발화 품질은 기기별 수동 확인 필요.

### 8. 회차 요약

이번 회차에서 해결한 문제: 모바일 터치 컨트롤 의미론/키보드 접근성 부족, 교사용 로컬 기록 안내 부족.

사용자에게 좋아진 점: 외부 키보드/보조 입력 장치에서 터치 버튼이 더 예측 가능하게 동작하고, 교사가 수업 후 기록 보존 행동을 더 빨리 인지한다.

개발/운영 측면에서 좋아진 점: 브라우저 스모크 테스트가 모바일 버튼 의미론, Space activation, 전역 입력 누수를 자동으로 확인한다.

수정한 파일: `index.html`, `src/game.js`, `tools/browser-smoketest.js`, `docs/launch-quality-loop.md`

추가/수정한 테스트: `tools/browser-smoketest.js` 모바일 버튼 접근성 검증 추가.

검증 결과: 모든 실행 검증 통과.

새로 생긴 리스크: 네이티브 버튼 전환이 일부 모바일 브라우저의 기본 스타일 차이를 만들 수 있으나 CSS reset과 After 캡처로 현재 레이아웃은 정상 확인했다.

아직 남은 문제: localStorage 기반 기록 유실 자체는 구조적으로 남아 있으므로 백업/복원 UX와 배포 전 운영 안내를 계속 강화해야 한다.

다음 회차 후보: service worker 캐시/배포 패키지 검증 강화, 백업 실패/복원 실패의 사용자 행동 안내 보강, 문서와 README 테스트 명령 최신화.

### 9. Issue Ledger 업데이트

- Issue ID: C2-TOUCH-BUTTONS
- 발견 회차: 2
- 심각도: P1
- 상태: fixed
- 유형: accessibility / mobile
- 관련 파일: `index.html`, `src/game.js`, `tools/browser-smoketest.js`
- 사용자 영향: 보조 입력 장치 사용자의 모바일 조작 실패 가능성
- 해결 회차: 2
- 비고: button semantics, keyboard/click fallback, browser test 추가

- Issue ID: C2-TEACHER-DATA-NOTE
- 발견 회차: 2
- 심각도: P1
- 상태: fixed
- 유형: ux / data
- 관련 파일: `src/game.js`, `index.html`
- 사용자 영향: 수업 기록 로컬 저장 사실을 놓쳐 백업하지 않을 가능성
- 해결 회차: 2
- 비고: 대시보드 화면과 live status 문구 보강

## Cycle 3

### 1. 개발자 관점 검토

릴리스 workflow는 `npm run pack`으로 오프라인 ZIP을 만들지만, 기존 `pack` 스크립트는 `rm`과 `zip` 셸 명령에 의존했다. Windows 개발 환경에서는 `rm`이 인식되지 않아 로컬에서 릴리스 패키지를 재현할 수 없었다. 또한 스크립트가 `.nojekyll`을 포함하려 했지만 실제 파일은 없어 입력 목록과 저장소 상태가 맞지 않았다.

### 2. 코드리뷰 결과

새로 발견한 문제:

- `npm run pack`이 Windows `cmd`에서 실패해 오프라인 배포본을 만들 수 없다.
- README의 프로젝트 구조 목록에 새 패키징 책임을 가진 도구 파일이 없으면 운영자가 어떤 코드가 ZIP을 만드는지 추적하기 어렵다.

### 3. 사용자 관점 검토

시나리오: 교사가 인터넷이 불안정한 교실에서 오프라인 배포본 ZIP을 받아 USB로 옮겨 실행하려고 한다. 개발자나 운영자가 Windows PC에서 ZIP을 만들 수 없으면 수업 직전 배포가 막히고, 교사는 학생용 기기에 파일을 나눠 줄 수 없다.

### 4. 이번 회차 우선순위

- ID: C3-PACK-WINDOWS
- 우선순위: P1
- 문제: 오프라인 ZIP 생성 스크립트가 Windows에서 실패한다.
- 사용자 영향: 인터넷 없는 교실 배포본을 로컬에서 만들지 못해 수업 준비가 막힌다.
- 개발/운영 영향: GitHub Actions 외 환경에서 릴리스 산출물을 재현하기 어렵다.
- 해결 방향: Node 표준 라이브러리만으로 ZIP을 생성하는 `tools/pack.js`를 추가하고 `npm run pack`을 교체한다.
- 관련 파일: `tools/pack.js`, `package.json`, `README.md`
- 회귀 위험: 수동 ZIP 구현이 잘못되면 압축 해제가 실패하거나 한글 파일명이 깨질 수 있다.
- 검증 방법: `npm run pack`, `Expand-Archive`, 필수 파일 존재 확인, 압축 해제본 브라우저 로드 확인.

### 5. 실제 코드 변경

수정한 파일: `package.json`, `README.md`, `tools/pack.js`, `docs/launch-quality-loop.md`

변경 이유: 운영체제별 셸 명령 의존을 제거하고 오프라인 배포본 생성을 재현 가능하게 만들기 위해서다.

핵심 코드 변경:

- `tools/pack.js` 추가: Node `fs`, `path`, `zlib`만 사용해 ZIP local header, central directory, EOCD를 생성한다.
- 한글 파일명을 위해 ZIP UTF-8 flag를 설정한다.
- `package.json`의 `pack` 스크립트를 `node tools/pack.js`로 교체한다.
- 기존 `.gitignore`가 `node_modules/`와 `ai-ethics-adventure-offline.zip`을 제외하는 상태임을 확인했다.
- README 프로젝트 구조에 `tools/pack.js` 설명 추가.

새 예외 처리: 입력 경로가 없으면 건너뛰고, 존재하는 파일만 수집한다.

데이터 구조/환경변수 변경: 없음.

### 6. 검증 결과

- 실행한 명령: `npm run pack` (기존)
- 결과: 실패
- 실패 원인: Windows `cmd`에서 `'rm' is not recognized as an internal or external command`
- 수정 여부: Node 기반 `tools/pack.js`로 교체

- 실행한 명령: `node --check tools\pack.js`
- 결과: 통과

- 실행한 명령: `npm run pack`
- 결과: 통과, `ai-ethics-adventure-offline.zip` 생성, 21 files

- 실행한 명령: `Expand-Archive` 후 필수 파일 확인
- 결과: 통과, `index.html`, `sw.js`, `manifest.webmanifest`, `src/game.js`, `icons/icon-192.png`, `docs/교사용-안내서.md`, `README.md` 확인

- 실행한 명령: 압축 해제본 로컬 서버 + Playwright 브라우저 로드
- 결과: 통과, `window.__game.mode === 'title'`와 nonblank canvas 확인

### 7. Before/After

UI 변경 없음.

Before: `npm run pack`이 Windows에서 `rm` 명령을 찾지 못해 실패했다.

After: `npm run pack`이 Node 스크립트로 ZIP을 만들고, 압축 해제본을 브라우저에서 정상 로드했다.

스크린샷: UI 변경이 없어 생성하지 않음. 검증 증거는 명령 결과와 압축 해제본 브라우저 로드 결과로 대체했다.

### 8. 회차 요약

이번 회차에서 해결한 문제: Windows에서 오프라인 배포 ZIP을 만들 수 없는 출시 차단급 운영 문제.

사용자에게 좋아진 점: 인터넷 없는 교실 배포본을 로컬에서도 만들 수 있어 수업 준비 안정성이 올라간다.

개발/운영 측면에서 좋아진 점: GitHub Actions와 Windows 로컬에서 같은 `npm run pack` 명령을 사용할 수 있다.

수정한 파일: `package.json`, `README.md`, `tools/pack.js`, `docs/launch-quality-loop.md`

추가/수정한 테스트: 별도 테스트 파일은 없지만 ZIP 생성, 압축 해제, 필수 파일 확인, 압축 해제본 브라우저 로드를 수행했다.

검증 결과: 패키징 관련 실행 검증 통과.

새로 생긴 리스크: 자체 ZIP 작성 코드가 ZIP64를 지원하지 않는다. 현재 산출물은 4GB/65535파일 한도와 무관하므로 출시 전 필수 리스크는 아니다.

아직 남은 문제: release workflow에서 브라우저 스모크 테스트까지 포함할지 검토 필요.

다음 회차 후보: release workflow 품질 게이트 강화, 서비스워커 asset 목록과 패키지 파일 목록 동기화 검증, 백업/복원 실패 안내 개선.

### 9. Issue Ledger 업데이트

- Issue ID: C3-PACK-WINDOWS
- 발견 회차: 3
- 심각도: P1
- 상태: fixed
- 유형: deploy / maintainability
- 관련 파일: `tools/pack.js`, `package.json`, `README.md`
- 사용자 영향: Windows 환경에서 오프라인 수업 배포본 생성 실패
- 해결 회차: 3
- 비고: Node 기반 ZIP 생성, 압축 해제 및 브라우저 로드 검증 완료

## Cycle 4

### 1. 개발자 관점 검토

GitHub Pages workflow는 브라우저 스모크 테스트를 실행하지만, 오프라인 ZIP을 릴리스에 첨부하는 Release workflow는 데이터/로직 테스트만 실행했다. 릴리스 태그는 교사에게 배포할 ZIP 산출물을 직접 만들기 때문에, 실제 브라우저에서 타이틀/메뉴/대시보드/리포트/모바일 회전 안내가 깨지는 회귀를 릴리스 전에 막아야 한다.

### 2. 코드리뷰 결과

새로 발견한 문제:

- Release workflow가 `npm run test:browser`를 실행하지 않아 Canvas 렌더링, 접근성 live status, 모바일 회전 안내, 터치 버튼 semantics 회귀가 ZIP 릴리스 전에 걸러지지 않는다.

### 3. 사용자 관점 검토

시나리오: 운영자가 `v*` 태그를 올리고 GitHub Release의 오프라인 ZIP 링크를 교사에게 보낸다. ZIP 내부 파일은 만들어졌지만 실제 브라우저에서 빈 화면이 뜨거나 모바일 회전 안내가 깨지면 교사는 수업 현장에서 문제를 발견하게 된다.

### 4. 이번 회차 우선순위

- ID: C4-RELEASE-BROWSER-GATE
- 우선순위: P1
- 문제: 릴리스 산출물이 실제 브라우저 스모크 테스트 없이 첨부된다.
- 사용자 영향: 교사가 받는 오프라인 ZIP이 브라우저에서 깨질 가능성을 릴리스 전에 놓칠 수 있다.
- 개발/운영 영향: 릴리스 후 수동 롤백과 재배포 부담 증가.
- 해결 방향: Release workflow에 Playwright 설치와 `npm run test:browser` 단계를 ZIP 빌드 전에 추가한다.
- 관련 파일: `.github/workflows/release.yml`
- 회귀 위험: 릴리스 workflow 시간이 늘고, Playwright 설치 장애가 릴리스를 막을 수 있다.
- 검증 방법: 로컬 `npm run test:browser` 재실행, YAML diff 확인. GitHub Actions 실제 실행은 원격 트리거 필요.

### 5. 실제 코드 변경

수정한 파일: `.github/workflows/release.yml`, `docs/launch-quality-loop.md`

변경 이유: 오프라인 ZIP 릴리스 전에 실제 브라우저 사용자 흐름을 자동 검증하기 위해서다.

핵심 코드 변경:

- `오프라인 ZIP 빌드` 전에 `브라우저 테스트 준비` 단계 추가.
- `npm install --no-save playwright`와 `npx playwright install --with-deps chromium` 실행.
- `브라우저 스모크 테스트` 단계에서 `npm run test:browser` 실행.

새 예외 처리: 없음.

데이터 구조/환경변수 변경: 없음.

### 6. 검증 결과

- 실행한 명령: `npm run test:browser`
- 결과: 통과, 브라우저 스모크 테스트 통과

- 실행한 명령: `npm run validate`
- 결과: 통과, 모든 검사 통과

- 실행한 명령: `npm test`
- 결과: 통과, 스모크 320개 + 슬롯 24개 검사

- 실행하지 못한 항목: GitHub Actions Release workflow 원격 실행
- 이유: 태그 push 또는 workflow_dispatch가 필요한 원격 CI 실행이며, 현재 작업은 로컬 브랜치에서 수행했다.

### 7. Before/After

UI 변경 없음.

Before: Release workflow는 데이터 검증, 스모크 테스트, 슬롯 테스트 후 바로 오프라인 ZIP을 만들었다.

After: Release workflow가 브라우저 스모크 테스트를 통과한 뒤에만 오프라인 ZIP을 만든다.

스크린샷: UI 변경이 없어 생성하지 않음.

### 8. 회차 요약

이번 회차에서 해결한 문제: 실제 브라우저 회귀가 오프라인 ZIP 릴리스 전에 검출되지 않는 배포 품질 리스크.

사용자에게 좋아진 점: 교사가 받는 ZIP이 브라우저에서 기본 화면과 모바일 흐름을 열 수 있는지 자동 확인된다.

개발/운영 측면에서 좋아진 점: Pages 배포와 Release 배포의 검증 수준이 더 일관된다.

수정한 파일: `.github/workflows/release.yml`, `docs/launch-quality-loop.md`

추가/수정한 테스트: Release workflow에 `npm run test:browser` 단계 추가.

검증 결과: 로컬 브라우저 스모크와 기존 검증 통과. 원격 GitHub Actions 실행은 확인 필요.

새로 생긴 리스크: Playwright 설치 장애가 릴리스를 막을 수 있으나, 깨진 ZIP을 배포하는 것보다 안전한 실패다.

아직 남은 문제: release workflow가 생성 ZIP을 압축 해제해 브라우저로 직접 여는 검증까지는 하지 않는다.

다음 회차 후보: 패키지 파일 목록과 서비스워커 asset 목록 동기화 검증, 생성 ZIP 자체를 CI에서 압축 해제해 확인, 백업/복원 실패 안내 개선.

### 9. Issue Ledger 업데이트

- Issue ID: C4-RELEASE-BROWSER-GATE
- 발견 회차: 4
- 심각도: P1
- 상태: fixed
- 유형: deploy / test
- 관련 파일: `.github/workflows/release.yml`
- 사용자 영향: 브라우저에서 깨지는 오프라인 ZIP을 받을 가능성
- 해결 회차: 4
- 비고: 릴리스 전 Playwright 브라우저 스모크 단계 추가. 원격 workflow 실행은 확인 필요

## Cycle 5

### 1. 개발자 관점 검토

Cycle 3에서 ZIP 생성은 운영체제 독립적으로 바뀌었고, Cycle 4에서 릴리스 전 브라우저 스모크도 추가했다. 그러나 생성된 ZIP 자체의 파일 목록은 아직 자동 검증하지 않았다. 특히 `sw.js`의 `ASSETS` 목록에 들어간 파일이 ZIP에서 빠지면, 오프라인 설치 후 서비스워커 캐싱이 실패할 수 있다.

### 2. 코드리뷰 결과

새로 발견한 문제:

- Release workflow가 ZIP을 만들지만 ZIP 내부 필수 파일, 한글 파일명, 서비스워커 asset 포함 여부를 별도 검증하지 않는다.
- `tools/`, `node_modules/`, `.git/` 같은 개발 전용 경로가 ZIP에 섞이는지 확인하는 자동 테스트가 없다.

### 3. 사용자 관점 검토

시나리오: 교사가 오프라인 ZIP을 내려받아 압축을 풀고 `index.html`을 연다. 파일 하나가 빠져 있거나 서비스워커 캐시 대상이 누락되어 있으면 첫 실행은 될 수 있어도 설치형 앱/오프라인 재실행에서 깨질 수 있다.

### 4. 이번 회차 우선순위

- ID: C5-PACK-CONTENTS
- 우선순위: P1
- 문제: 생성 ZIP 내용과 서비스워커 캐시 대상의 동기화 검증이 없다.
- 사용자 영향: 오프라인 ZIP 또는 PWA 캐시가 일부 환경에서 깨질 수 있다.
- 개발/운영 영향: 릴리스 산출물의 내용 회귀를 배포 후에야 발견할 수 있다.
- 해결 방향: ZIP 중앙 디렉터리를 읽어 필수 파일, UTF-8 파일명 flag, 서비스워커 asset 포함, 개발 전용 경로 미포함을 검증하는 `tools/packtest.js`를 추가한다.
- 관련 파일: `tools/packtest.js`, `package.json`, `.github/workflows/release.yml`, `README.md`
- 회귀 위험: ZIP 검증 기준이 과하게 엄격하면 정상 릴리스를 막을 수 있다.
- 검증 방법: `npm run test:pack`, `npm run validate`, `npm test`, `npm run test:browser`.

### 5. 실제 코드 변경

수정한 파일: `.github/workflows/release.yml`, `README.md`, `package.json`, `tools/packtest.js`, `docs/launch-quality-loop.md`

변경 이유: 생성 ZIP 자체를 릴리스 전에 검증해 오프라인 배포 안정성을 높이기 위해서다.

핵심 코드 변경:

- `tools/packtest.js` 추가: ZIP EOCD와 central directory를 읽어 파일 목록을 검증한다.
- 필수 런타임 파일과 교사용 안내서, README 포함 여부를 확인한다.
- `sw.js`의 `./...` asset 목록을 읽어 ZIP에 모두 들어 있는지 확인한다.
- `.git/`, `node_modules/`, `tools/`가 ZIP에 들어가면 실패한다.
- 모든 ZIP entry가 UTF-8 파일명 flag를 갖는지 확인해 한글 문서명 회귀를 잡는다.
- `package.json`에 `test:pack` 추가.
- Release workflow의 ZIP 단계가 `npm run test:pack`을 실행하도록 변경.
- README 개발자 검사와 프로젝트 구조에 `packtest` 설명 추가.

새 예외 처리: ZIP EOCD 또는 central directory가 손상됐으면 명확한 실패 메시지로 종료한다.

데이터 구조/환경변수 변경: 없음.

### 6. 검증 결과

- 실행한 명령: `npm run test:pack`
- 결과: 통과, ZIP 생성 후 내용 검사 통과

- 실행한 명령: `npm run validate`
- 결과: 통과, 모든 검사 통과

- 실행한 명령: `npm test`
- 결과: 통과, 스모크 320개 + 슬롯 24개 검사

- 실행한 명령: `npm run test:browser`
- 결과: 통과, 브라우저 스모크 테스트 통과

### 7. Before/After

UI 변경 없음.

Before: 릴리스 ZIP 생성 후 내부 파일 목록과 서비스워커 asset 포함 여부를 별도 확인하지 않았다.

After: `npm run test:pack`이 ZIP 생성 뒤 필수 파일, 서비스워커 asset, 개발 전용 경로 미포함, UTF-8 파일명 flag를 확인한다.

스크린샷: UI 변경이 없어 생성하지 않음.

### 8. 회차 요약

이번 회차에서 해결한 문제: 오프라인 ZIP 내용 검증 부재.

사용자에게 좋아진 점: 교사용 오프라인 배포본이 필수 파일 누락 없이 만들어질 가능성이 높아진다.

개발/운영 측면에서 좋아진 점: 릴리스 workflow가 ZIP을 만들 뿐 아니라 산출물 내용을 검증한다.

수정한 파일: `.github/workflows/release.yml`, `README.md`, `package.json`, `tools/packtest.js`, `docs/launch-quality-loop.md`

추가/수정한 테스트: `npm run test:pack` 추가, release workflow에 연결.

검증 결과: 로컬 검증 명령 통과.

새로 생긴 리스크: packtest가 `sw.js`의 단순 문자열 asset 형식을 기준으로 읽으므로, 향후 asset 선언 방식을 동적으로 바꾸면 테스트도 함께 바꿔야 한다.

아직 남은 문제: 압축 해제본을 release workflow에서 실제 브라우저로 여는 검증은 아직 별도 단계가 아니다.

다음 회차 후보: 백업/복원 실패 안내 개선, 저장소 quota/비공개 모드 안내 강화, 수업 모드 위험 행동 복구성 점검.

### 9. Issue Ledger 업데이트

- Issue ID: C5-PACK-CONTENTS
- 발견 회차: 5
- 심각도: P1
- 상태: fixed
- 유형: deploy / test
- 관련 파일: `tools/packtest.js`, `package.json`, `.github/workflows/release.yml`
- 사용자 영향: 파일 누락 또는 서비스워커 캐시 누락이 있는 ZIP을 받을 가능성
- 해결 회차: 5
- 비고: `npm run test:pack`으로 ZIP 내용 검증 추가
