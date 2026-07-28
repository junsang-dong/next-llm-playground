import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

// Override stale/injected shell env so the project .env always wins in local dev.
loadEnv({ path: resolve(process.cwd(), '.env'), override: true })

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function localApiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (!url?.startsWith('/api/') || req.method === 'OPTIONS') {
          if (req.method === 'OPTIONS' && url?.startsWith('/api/')) {
            res.statusCode = 204
            res.end()
            return
          }
          return next()
        }

        try {
          const raw = req.method === 'POST' ? await readBody(req) : '{}'
          const body = raw ? JSON.parse(raw) : {}

          const { routeChat, isProviderId } = await server.ssrLoadModule(
            '/api/_lib/router.ts',
          )
          const { runOrchestration } = await server.ssrLoadModule(
            '/api/_lib/orchestrator.ts',
          )
          const {
            PROVIDERS,
            DEFAULT_MODELS,
          } = await server.ssrLoadModule('/api/_lib/types.ts')
          const { voucherError } = await server.ssrLoadModule(
            '/api/_lib/voucher.ts',
          )

          if (url === '/api/chat' && req.method === 'POST') {
            const provider = body?.provider
            const prompt =
              typeof body?.prompt === 'string' ? body.prompt.trim() : ''
            const model =
              typeof body?.model === 'string' ? body.model : undefined
            const voucherIssue = voucherError(body?.voucher)

            if (voucherIssue) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: voucherIssue }))
              return
            }

            if (!isProviderId(provider)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error:
                    'provider must be one of: gpt, gemini, claude, perplexity',
                }),
              )
              return
            }
            if (!prompt) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'prompt is required' }))
              return
            }

            try {
              const result = await routeChat(provider, prompt, model)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Unknown error'
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ provider, model: model ?? null, error: message }))
            }
            return
          }

          if (url === '/api/compare' && req.method === 'POST') {
            const prompt =
              typeof body?.prompt === 'string' ? body.prompt.trim() : ''
            const voucherIssue = voucherError(body?.voucher)

            if (voucherIssue) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: voucherIssue }))
              return
            }

            if (!prompt) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'prompt is required' }))
              return
            }

            const results = await Promise.all(
              PROVIDERS.map(async (provider: string) => {
                const started = Date.now()
                try {
                  return await routeChat(provider, prompt)
                } catch (error) {
                  return {
                    provider,
                    model: DEFAULT_MODELS[provider],
                    error:
                      error instanceof Error ? error.message : 'Unknown error',
                    elapsed:
                      Math.round(((Date.now() - started) / 1000) * 100) / 100,
                  }
                }
              }),
            )

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(results))
            return
          }

          if (url === '/api/auto' && req.method === 'POST') {
            const prompt =
              typeof body?.prompt === 'string' ? body.prompt.trim() : ''
            const voucherIssue = voucherError(body?.voucher)

            if (voucherIssue) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: voucherIssue }))
              return
            }

            if (!prompt) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'prompt is required' }))
              return
            }

            try {
              const result = await runOrchestration(prompt)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Unknown error'
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: message }))
            }
            return
          }

          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Not found' }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Server error',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin()],
  server: {
    port: 5181,
    strictPort: true,
  },
})
