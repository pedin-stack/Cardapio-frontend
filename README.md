# Cardápio — Front

Cardápio que se navega como rede social. Next.js 15 (Pages Router) · React 19 · TypeScript strict · Tailwind v4 ·
React Query · framer-motion · hls.js. Mobile-first, dark, vidro fosco. Padrões: `conecta-frontend-blueprint.md`.

## Rodar

```bash
cp .env.example .env.local   # API, URL + anon key do Supabase, bucket
npm install
npm run dev                  # http://localhost:3000 (a API em http://localhost:8080)
npm run check && npm run lint && npm test && npm run build
```

## Deploy (Vercel)

Variáveis do projeto na Vercel: `API_ORIGEM` (ex.: `https://cardapio-api.169-58-57-18.sslip.io`),
`API_SEGREDO_FRONT` (o mesmo `FRONT_SEGREDO` da API), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY` (anon)
e `NEXT_PUBLIC_SUPABASE_BUCKET`.
O navegador chama `/api/*` no próprio domínio da Vercel e o `src/middleware.ts` repassa à API com o segredo
`X-Cardapio-Front` — sem ele a API responde 403. O cookie de sessão fica no domínio do front. Na API,
`CORS_ALLOWED_ORIGINS` deve conter a URL da Vercel (o middleware repassa o `Origin`).

## Instâncias

| Rota | Quem | O quê |
|---|---|---|
| `/{slug}` | cliente (sem login) | hero → feed vertical um-prato-por-tela, curtir (toque no coração ou dois toques na foto), aba Curtidos (o "carrinho") |
| `/login` | gestor / super admin | entra e vai para a área do perfil |
| `/painel` · `/painel/categorias` · `/painel/metricas` | gestor | itens (até 8 fotos + 1 vídeo), categorias, métricas |
| `/plataforma` | super admin | restaurantes: cadastrar (com o gestor), ativar/desativar, editar |
| restaurante desativado ou rota inexistente | — | tela 404 "Serviço indisponível" |

## Vídeo em chunks (estilo TikTok)

- **Servidor:** o original vira HLS (segmentos `.ts` de 2 s, 480p e 720p, keyframe a cada 2 s).
- **Cliente** (`src/components/video/janelaVideos.ts` + `HlsVideo.tsx`): no máximo **3 players vivos**. O card ativo
  toca (buffer ~10 s, ABR sobe para 720p); o **próximo vídeo pré-carrega só o 1º chunk** em 480p (o play ao rolar é
  instantâneo); o anterior fica pausado com o buffer; o resto é destruído (zero rede/memória). O hls.js é importado
  sob demanda — o cardápio pinta sem esperar o player. Sem MSE (iOS antigo), HLS nativo do Safari.

## Métricas coletadas

- **Tempo por item:** o item em foco (card ≥ 60 % visível ou detalhe aberto) acumula tempo com a aba visível;
  lote enviado a cada 15 s e ao sair (`fetch` com `keepalive`).
- **Curtidas = pedidos**; curtir e depois remover = **quase pedido**; dia da semana × hora vêm das curtidas.
- O cliente é anônimo: `X-Device-ID` (UUID no `localStorage`).
