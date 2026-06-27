# 출시 전 검증 게이트

`npm run release:gate`는 출시 직전에 실제 환경 증거가 모두 있는지 확인한다. 로컬 자동 테스트만으로 통과시키지 않고, 아래 파일이 있어야 통과한다.

| 항목 | 증거 파일 | 통과 기준 |
|---|---|---|
| 원격 GitHub Actions | `reports/audits/github-actions-run.txt` | `conclusion: success` 또는 통과/성공 문구 |
| 실제 배포 URL | `reports/audits/deploy-url.txt` | 예시 주소가 아닌 실제 HTTPS URL 1개 이상 |
| 학교 기기 QA | `reports/audits/device-qa.md` | `태블릿: 통과`, `노트북: 통과`, 날짜·확인자·기기/브라우저 작성 |
| 스크린리더 | `reports/audits/screen-reader-check.md` | `결과: 통과`, 도구·날짜·확인자 작성 |
| Lighthouse 모바일 | `reports/audits/lighthouse-mobile.json` | performance 80점 이상, accessibility 90점 이상, best-practices 85점 이상 |
| Lighthouse 데스크톱 | `reports/audits/lighthouse-desktop.json` | performance 80점 이상, accessibility 90점 이상, best-practices 85점 이상 |

## 권장 실행 순서

```bash
npm run validate
npm test
npm run test:browser
npm run test:pack
npm run test:release-docs
npm run test:release-gate
```

실제 Chrome/Chromium 실행 파일로 Lighthouse Node API 감사를 실행한다. `lighthouse` CLI가 아니라 프로젝트 헬퍼를 사용해 모바일/데스크톱 JSON을 함께 저장한다.

```bash
npm install --no-save lighthouse chrome-launcher
npm run audit:lighthouse
```

Chrome을 자동으로 찾지 못하면 `CHROME_PATH=/path/to/chrome npm run audit:lighthouse`처럼 실행 파일 경로를 지정한다.

GitHub CLI를 쓸 수 있으면 원격 워크플로 결과를 저장한다.

```bash
gh run list --limit 5 > reports/audits/github-actions-run.txt
```

배포 URL은 직접 접속해 게임 첫 화면과 PWA 캐시를 확인한 뒤 저장한다. 아래
명령의 주소는 형식 예시일 뿐이며, 그대로 저장하면 출시 게이트가 실패한다.

```bash
printf 'https://<actual-deploy-host>/<actual-path>/\n' > reports/audits/deploy-url.txt
```

## 수동 QA 기록 양식

`reports/audits/device-qa.md`

```md
# 학교 기기 QA

태블릿: 통과
노트북: 통과
날짜: 2026-06-27
확인자:
기기/브라우저:
확인 항목: 시작, 이동, 퍼즐, 배틀, 리포트, 오프라인 재접속
이슈:
```

`reports/audits/screen-reader-check.md`

```md
# 스크린리더 점검

도구: VoiceOver 또는 NVDA
결과: 통과
날짜: 2026-06-27
확인자:
확인 항목: 시작 버튼, 메뉴 버튼, 터치 컨트롤, 리포트 내보내기, 큰 글씨/읽어주기 설정
이슈:
```

모든 증거를 저장한 뒤 `npm run release:gate`를 실행한다. 실패하면 해당 증거를 다시 만들거나 기준 미달 항목을 고친 뒤 반복한다.
