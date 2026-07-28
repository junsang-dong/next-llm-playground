# Multi LLM Playground

![Goorm AI Gateway · Multi LLM Playground — 접이식 사이드바 UI](doc/app-preview.png)

**Goorm AI Gateway** — 하나의 UI에서 GPT, Gemini, Claude, Perplexity를 선택·비교하거나, AUTO 모드로 멀티 LLM이 협의해 최적 모델에 응답을 맡기는 AI Gateway 학습용 앱입니다.

## 기술 스택

- Frontend: React + Vite + TypeScript + Tailwind CSS + Lucide + react-markdown
- Backend: Vercel Serverless Functions (`/api/chat`, `/api/compare`, `/api/auto`)
- Provider Adapter: 공통 인터페이스로 4개 LLM 추상화
- Local Dev: Vite 미들웨어로 `/api`를 동일 포트에서 처리
- Client Storage: `sessionStorage`(바우처), `localStorage`(히스토리·사이드바 상태)

## 시작하기

```bash
npm install
cp .env.example .env
# .env에 API 키·바우처 코드 입력
```

### 로컬 실행 (권장)

```bash
npm run dev
# 또는 특정 포트
npm run dev -- --port 5191
```

기본 주소: **http://localhost:5181/** (`vite.config.ts`의 `strictPort`)

Vite가 UI와 `/api/chat`, `/api/compare`, `/api/auto`를 함께 제공합니다.

### Vercel CLI로 API 실행 (선택)

```bash
npm run dev:full
# 또는
npx vercel dev --listen 3000
```

## 환경 변수

서버 전용 (브라우저에 노출되지 않음):

```
OPENAI_API_KEY=
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=
VOUCHER_CODE=
```

클라이언트 인증 UI용 (Vite `VITE_` prefix):

```
VITE_VOUCHER_CODE=
```

키가 없는 provider는 해당 요청만 에러를 반환하고, Compare·AUTO 모드에서는 나머지 모델로 계속 진행합니다.

## 바우처 인증

프롬프트 실행 전 바우처 코드 인증이 필요합니다.

- UI: Voucher 입력란에서 코드 인증 → 잠금 해제 후 Chat/Compare/AUTO 실행
- API: `voucher` 필드가 없거나 `VOUCHER_CODE`와 불일치하면 `401` 반환
- 세션: 인증 상태는 `sessionStorage`에 유지, 「잠금」으로 해제

## 주요 기능

### Chat / Compare / AUTO

- **Chat**: provider + 모델 Select 후 단일 호출
- **Compare**: 4 provider 병렬, 속도·토큰·비용·품질 비교
- **AUTO**: 멀티 LLM 협의 라우팅 후 최적 모델이 최종 응답

### GPT 스타일 접이식 사이드바

- 좌측 **Chat · Compare · Auto · Settings · About** + **History**
- **패널 토글 버튼**(둥근 사각형 + 세로 구분선): 사이드바 열림 시 패널 우측 상단, 닫힘 시 본문 상단에서 열기
- 데스크톱: 너비 애니메이션으로 본문과 함께 레이아웃 / 모바일: 오버레이 드로어
- 열림 상태: `localStorage` 키 `multi-llm-sidebar-open`

### 질문·답변 히스토리

- 성공한 요청을 `multi-llm-playground-history`에 저장 (최대 50건)
- History 클릭 → 프롬프트·모델·답변 **재호출 없이** 복원
- Settings에서 전체 삭제

### Provider별 모델 Select

Chat에서 provider별 드롭다운 (GPT `gpt-4o`/`gpt-5`, Claude Haiku/Sonnet/Opus, Gemini Flash/Pro, Sonar/Sonar Pro). `/api/chat` body의 `model`로 전달. Compare·AUTO는 기본 모델.

### Prompt 예시 뱃지 · 응답 보기

- 5종 예시 뱃지 (기본: **모델의 자기인식**)
- **마크다운 보기** / **웹뷰 보기** (`react-markdown` GFM)

## API

### `POST /api/chat`

```json
{
  "provider": "gpt",
  "model": "gpt-4o",
  "prompt": "Explain MCP",
  "voucher": "<VOUCHER_CODE>"
}
```

### `POST /api/compare` · `POST /api/auto`

Compare는 4 provider 병렬. AUTO는 Council 표결 + 최종 응답 및 `orchestration` 메타데이터.

## 기본 모델 (Compare / AUTO)

| Provider   | Model              |
| ---------- | ------------------ |
| GPT        | `gpt-4o-mini`      |
| Gemini     | `gemini-2.5-flash` |
| Claude     | `claude-haiku-4-5` |
| Perplexity | `sonar`            |

![Compare 모드 결과 화면](doc/compare-preview.png)

## 변경 이력 (최근)

### 주요 내용

- **접이식 사이드바 UI**: ChatGPT 유사 레이아웃, 패널 토글 아이콘, `AppShell` 전체 높이 레이아웃
- **REQ Features** ([doc/REQ Features.md](doc/REQ%20Features.md)): 히스토리, provider별 모델 Select, Slide Menu(Settings/About)
- **AUTO 오케스트레이션**: `/api/auto`, 협의 요약 UI
- **응답 보기**: 마크다운 / 웹뷰 전환
- **Prompt 예시 뱃지** 5종, **Goorm AI Gateway** / **Multi LLM Playground** 브랜딩
- **바우처 게이트** 및 서버 `/api/*` 검증

### 오류·UX 보완

- API 직접 호출 우회 방지를 위한 서버 바우처 검증 (`401`)
- 미인증 시 입력·모델 UI 비활성화
- AUTO Council: provider별 실패 격리, 무효 표·최종 호출 실패 시 `502`와 명확한 메시지
- 히스토리 복원 시 Chat/Compare/AUTO 모드·모델 id 일치 검증 후 Select 상태 반영
- 모바일 첫 진입 시 사이드바 닫힘, 데스크톱은 열림 기본값 (localStorage로 유지)
- 미지원 API 모델 id 호출 시 provider API 에러를 기존 Chat 에러 UI로 표시

## 배포

Vercel에 연결 후 Environment Variables에 API 키와 `VOUCHER_CODE`를 등록합니다.

- Private: [junsang-dong/next-llm-playground](https://github.com/junsang-dong/next-llm-playground)
- Public (교육용): [junsang-dong/goorm-260727-multi-llm](https://github.com/junsang-dong/goorm-260727-multi-llm)
