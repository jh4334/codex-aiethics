# 원격 개발 방법

이 문서는 PC를 끈 뒤에도 `jh4334/codex-aiethics` 저장소를 원격에서 이어 개발하는 방법을 정리한다.

## 1. OpenAI Codex Web 사용

1. 브라우저에서 <https://chatgpt.com/codex> 를 연다.
2. 같은 ChatGPT 계정으로 로그인한다.
3. GitHub 계정을 연결한다.
4. 저장소 `jh4334/codex-aiethics`를 선택한다.
5. 새 작업을 만들고 아래 프롬프트를 붙여 넣는다.

```text
GitHub issue #1을 기준으로 AI 윤리 방탈출형 5스테이지 리디자인을 구현해줘.

먼저 AGENTS.md와 docs/superpowers/specs/2026-06-26-ai-ethics-stage-redesign-design.md를 읽어.
Stage 1 데이터 발자국 숲부터 작게 구현하고, 필요한 테스트를 추가해.
검증은 npm run validate, npm test, npm run test:browser, npm run test:pack 순서로 진행해.
작업이 끝나면 PR을 만들어줘.
```

Codex Web의 클라우드 환경 설정에서 setup script가 필요하면 다음을 사용한다.

```bash
npm install
npm install --no-save playwright
npx playwright install --with-deps chromium
```

## 2. GitHub Codespaces 사용

1. <https://github.com/jh4334/codex-aiethics> 를 연다.
2. 초록색 **Code** 버튼을 누른다.
3. **Codespaces** 탭을 선택한다.
4. **Create codespace on main**을 누른다.
5. 브라우저 VS Code가 열리면 터미널에서 검증한다.

```bash
npm run validate
npm test
npm run test:browser
npm run test:pack
```

이 repo에는 `.devcontainer/devcontainer.json`이 있어서 Codespaces가 Node 20과 Playwright Chromium을 준비하도록 설정되어 있다.

## 3. 로컬 GitHub CLI로 Codespace 만들기

현재 로컬 GitHub CLI는 `codespace` 권한이 없을 수 있다. 권한을 추가하려면:

```bash
gh auth refresh -h github.com -s codespace
```

그 다음:

```bash
gh codespace create --repo jh4334/codex-aiethics --branch main
gh codespace code
```

## 4. 주의

- 이 Windows PC를 끄면 현재 로컬 Codex 앱, 로컬 터미널, `localhost` 브라우저 시각자료 서버는 멈춘다.
- GitHub에 push된 커밋, issue, docs는 남아 있으므로 다른 기기에서 계속 확인할 수 있다.
- 진짜로 PC를 꺼도 개발이 계속되려면 Codex Web, Codespaces, SSH 서버, 또는 항상 켜진 원격 머신에서 작업을 시작해야 한다.
