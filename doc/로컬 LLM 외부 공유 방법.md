# 로컬 LLM 외부 공유 방법

LM Studio에서 실행 중인 로컬 LLM(예: Gemma 4 12B)을 인터넷을 통해 동료들과 공유하는 방법을 정리합니다.

> **핵심 전제**: 어떤 방법이든 내 PC가 켜져있고 LM Studio가 실행 중이어야 합니다. PC가 꺼지면 서비스도 중단됩니다.

---

## 1. ngrok / Cloudflare Tunnel — 가장 간단

로컬 LM Studio 포트(1234)를 인터넷에 터널링하는 방식입니다.

```bash
# ngrok (https://ngrok.com)
ngrok http 1234
# → https://abc123.ngrok-free.app 같은 공개 URL 생성

# Cloudflare Tunnel (무료, https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
cloudflared tunnel --url http://localhost:1234
```

- 동료에게 `https://abc123.ngrok-free.app/v1/chat/completions` URL을 공유
- 동료가 자신의 앱에서 `LM_STUDIO_BASE_URL=https://abc123.ngrok-free.app`으로 설정하면 바로 사용
- **주의**: 인증 없이 노출되므로, ngrok의 Basic Auth나 별도 API 키 검증 필요

---

## 2. OpenAI 호환 API로 공유

LM Studio는 OpenAI 호환 API를 제공하므로, 터널만 열면 동료들이 **어떤 OpenAI 호환 클라이언트**에서든 사용 가능합니다.

```python
# 동료의 Python 코드
from openai import OpenAI

client = OpenAI(
    base_url="https://abc123.ngrok-free.app/v1",
    api_key="not-needed"  # LM Studio는 키 불필요
)

response = client.chat.completions.create(
    model="gemma-4-12b-qat",
    messages=[{"role": "user", "content": "안녕!"}]
)
```

Cursor, Continue, VS Code Copilot 등에서도 `base_url`만 바꾸면 연결됩니다.

---

## 3. MCP (Model Context Protocol) 서버

MCP 서버를 만들어 Cursor나 Claude Desktop에서 도구로 사용하게 할 수 있습니다.

```jsonc
// 동료의 .cursor/mcp.json
{
  "mcpServers": {
    "local-llm": {
      "url": "https://abc123.ngrok-free.app/mcp"
    }
  }
}
```

단, 이 방식은 별도의 MCP 서버 래퍼를 구현해야 합니다 (LM Studio 자체는 MCP를 직접 지원하지 않음).

---

## 4. Multi LLM Playground 앱 자체를 공유

현재 앱을 Vercel에 배포하고, `LM_STUDIO_BASE_URL`을 터널 URL로 설정하면:

- 동료들이 **브라우저에서 웹 UI**로 로컬 Gemma 4를 사용 가능
- 기존 GPT / Claude / Gemini / Perplexity와 비교 기능도 함께 제공
- 바우처 인증이 포함되어 있어 보안도 확보

---

## 방법별 비교

| 방법 | 난이도 | 동료 사용 편의성 | 보안 |
|------|--------|-----------------|------|
| **ngrok + URL 공유** | 쉬움 | URL만 알면 OK | 인증 별도 필요 |
| **OpenAI 호환 API** | 쉬움 | 개발자 친화적 | 인증 별도 필요 |
| **MCP 서버** | 중간 | Cursor에서 도구로 사용 | 래퍼 구현 필요 |
| **앱 배포 (Vercel + 터널)** | 중간 | 비개발자도 웹 UI 사용 | 바우처 인증 포함 |

---

## 빠른 시작 (ngrok)

```bash
# 1. ngrok 설치
winget install ngrok

# 2. LM Studio 실행 확인 (localhost:1234)

# 3. 터널 시작
ngrok http 1234

# 4. 생성된 URL을 동료에게 공유
#    https://xxxx.ngrok-free.app/v1/chat/completions
```

---

*작성일: 2026-07-29*
