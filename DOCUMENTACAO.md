# Documentação do Projeto — G-Captcha

> Data da análise: 14/11/2026
> Escopo: análise técnica e mapeamento das páginas, do funil e do conceito de "presell" (pré-sell).

---

## 1. Visão Geral

O projeto é um **funil de vendas estático em HTML** (sem back-end próprio), com tema "G Captcha".
A fluidez do funil é: **página de verificação falsa (captcha) → página de vendas (presell) → checkout externo (PerfectPay)**.

| Item | Valor |
|---|---|
| Tecnologia | HTML + Tailwind CSS (CDN) + JavaScript puro |
| Idioma | pt-BR |
| Rastreamento | UTMify Pixel (`pixelId = 68c3ce2f85d279d913865e26`) + Cloudflare Insights |
| Checkout externo | `https://go.perfectpay.com.br/PPU38CQ10RK?upsell=true` (PerfectPay) |
| Hospedagem sugerida | Netlify Drop (há um aviso embutido que orienta publicar a pasta) |

---

## 2. Mapa de Arquivos

| Arquivo | Papel | Observação |
|---|---|---|
| `index.html` | **Página principal (entrada do funil)** | Tela de "Verificação de Segurança" (falso captcha com visual Google). Botão "CONTINUAR" leva à presell. |
| `index-front-60.html` | **A PRESSELL (página de vendas)** | Página longa de conversão "Liberação de Saque" que cobra R$ 60 e redireciona ao checkout. |
| `index-front-60` | Cópia da presell sem extensão | Praticamente idêntica ao `.html`; só difere por uma tag do Cloudflare Insights. |
| `assistir/index.html` | Cópia idêntica de `index.html` | Mesmo conteúdo byte a byte (hash MD5 igual). Serve como entrada alternativa (ex.: link `/assistir`). |
| `template.html/index.html` | Página 404 do LiteSpeed | Não faz parte do funil; parece ser artefato de espelhamento/hospedagem. |
| `_external/` | Cache de recursos externos | Cópias locais de Tailwind, fontes Google, scripts da UTMify, pixel do Facebook e avatares (pravatar.cc). |
| `depoimento1.mp4`, `depoimento2.mp4` | Vídeos de depoimento (~18 MB cada) | Exibidos na seção de "prova social" da presell. |
| `*.jpg.jpeg` (6 imagens) | Galeria de "conquistas" | Dívidas pagas, moto, geladeira, mercado, roupas, investimento. |
| `README.md` | Vazio | — |

---

## 3. O que é a "Presell" (Pré-sell)?

**Presell** (do inglês *pre-sell page*, "página de pré-venda") é uma página de vendas que
aparece **antes do checkout**, com o objetivo de "esquentar" o visitante — criar urgência,
apresentar benefícios, quebrar objeções e gerar desejo — para que, ao chegar ao checkout,
a pessoa já esteja decidida a comprar.

Características clássicas de uma presell, todas presentes em `index-front-60.html`:

1. **Promessa forte no topo** — "Seu saque de R$ 17.658,00…" com contador animado.
2. **Urgência** — cronômetro regressivo (14:59) no topo e repetido no rodapé.
3. **Justificativa lógica** — bloco "De onde vem este valor de R$ 17.658?".
4. **Passo a passo** — 4 etapas mostrando como "liberar o saque".
5. **Prova social** — 2 vídeos de depoimento + galeria de fotos de "conquistas" + 15 depoimentos em texto.
6. **Quebra de objeções** — FAQ ("Dúvidas Frequentes") e garantia de reembolso em 3 minutos.
7. **CTA único e repetido** — botões "PAGAR R$ 60 E SACAR R$ 17.658 AGORA".
8. **Captura de dado antes do checkout** — modal que pede a chave PIX do usuário.

### Neste projeto, a presell é o arquivo `index-front-60.html`
(o nome "front-60" remete ao valor cobrado: R$ 60).

---

## 4. Qual é a Página Principal?

**`index.html` é a página principal / entrada do funil.**

Ela se disfarça de tela de verificação anti-robô ("G Captcha — Verificação de Segurança"),
imitando deliberadamente a identidade visual do Google (faixa azul/vermelho/amarelo/verde,
azul `#1a73e8`, ícones de escudo/cadeado). Todo o conteúdo real de vendas fica escondido
na segunda página. O único caminho possível é o botão **CONTINUAR → `index-front-60.html`**.

Fluxo completo:

```
Visitante (anúncio/link com UTMs)
        │
        ▼
index.html  ──── "Verificação de Segurança" (falso captcha, visual Google)
        │         botão CONTINUAR
        ▼
index-front-60.html  ──── PRESSELL "Liberação de Saque"
        │                  • contador de R$ 0 → R$ 17.658
        │                  • cronômetro 14:59
        │                  • captura da chave PIX (modal)
        │                  • barra de progresso fake "Chave PIX Aprovada!"
        ▼
go.perfectpay.com.br/PPU38CQ10RK  ──── CHECKOUT (cobra R$ 60)
```

---

## 5. Detalhamento Técnico

### 5.1 Página principal — `index.html`
- Faixa multicolor Google no topo e no card.
- Card central com selo "Proteção Ativa contra Robôs", botão "CONTINUAR".
- Rodapé com razão social "G Captcha Tecnologia e Processamento de Dados Ltda. • CNPJ 42.193.391/0001-92".
- **Micro-footer legal** com fonte de 7px e opacidade 15% (quase ilegível), que diz que
  os valores são "simulados/educacionais".
- Script de **repasse de UTMs**: salva `utm_*`, `src`, `sck`, `fbclid`, `gclid`, `ttclid`
  no `localStorage` e anexa aos links de saída.
- Estilo `_anim_reset` que força animações a aparecerem (anti-dependência de JS de animação).
- Aviso embutido: se aberto via `file:`, exige publicar em hospedagem (Netlify Drop).

### 5.2 Presell — `index-front-60.html` (≈1.400 linhas)
Seções, na ordem:
1. Barra "conexão segura criptografada".
2. Título "Seu saque de R$ X do G Captcha foi gerado" com valor animado até **R$ 17.658**.
3. Cronômetro de urgência (15 min, sincronizado no topo e rodapé).
4. Caixa de alerta de "punição por abandono" (medo de perder o saldo).
5. Bloco "De onde vem este valor?" + métricas.
6. Cards "ao confirmar agora, você garante".
7. Passo a passo (4 etapas).
8. Bloco de pagamento: extrato visual (R$ 17.658 − R$ 60), preço **R$ 60,00**, CTA principal.
9. Vídeos depoimento1/2.mp4 + botão CTA.
10. Galeria de 6 "conquistas" (as imagens do projeto).
11. 15 depoimentos em texto ("Quem já ativou, recomenda").
12. FAQ.
13. Chamada final + rodapé corporativo + micro-footer legal.
14. Modais: cadastro de chave PIX → barra de progresso → redirect ao checkout.

Scripts de conversão:
- **Contador animado** `R$ 0 → R$ 17.658` e cronômetros sincronizados.
- **Som sintetizado via WebAudio** (bipe de notificação) no primeiro toque/interação,
  para simular "caiu um PIX".
- **Modal de chave PIX**: grava o valor em `localStorage` (`user_pix_key`) — a chave não
  é enviada a lugar nenhum além do navegador; serve só para envolver o usuário.
- **Barra de progresso fake** (2,8 s, com passos "verificando/aprovando/gerando link")
  e título "Chave PIX Aprovada!", seguidos de redirect para o checkout da PerfectPay
  com os parâmetros de UTM anexados.
- **Back-redirect "blindado"**: empilha 3 `history.pushState` e, ao detectar `popstate`
  (botão voltar), força navegação para `back-45.html` — arquivo que **não existe** no projeto
  (o voltar leva a erro/404 em vez de sair do funil).
- `assistir/index.html` é cópia byte a byte de `index.html` (hash MD5 idêntico).

### 5.3 Recursos externos — `_external/`
Pasta com versões locais dos CDNs (Tailwind 3.4.17, fontes Google, scripts UTMify,
fbevents do Facebook e avatares do pravatar.cc). Alguns arquivos referenciam `/_external/...`
(caminho absoluto), então a estrutura de pastas deve ser preservada na publicação.

---

## 6. Observações Críticas de Segurança e Legalidade

Esta análise é técnica, mas é importante registrar o que o próprio código revela:

1. **Imitação do Google**: a página de entrada reproduz a identidade visual do Google
   (cores, tipografia, ícones) para parecer uma verificação oficial. Não há qualquer
   relação com o Google — possível violação de marca e falsa aparência de autoridade.
2. **Estrutura de "golpe da taxa" (advance-fee)**: o funil promete um saldo de
   **R$ 17.658** "reservado" e cobra uma **"taxa antifraude" de R$ 60** para "liberar"
   um dinheiro que, segundo o próprio micro-footer, **não existe**. Essa é a estrutura
   clássica de fraude de taxa antecipada.
3. **Contradição entre o texto visível e o aviso legal**: o texto de venda afirma que
   "os R$ 17.658 caíram na conta" (depoimentos) e que o valor é real, enquanto o
   micro-footer de 7px/15% de opacidade diz que tudo é "simulação educacional".
   Disclaimer praticamente invisível não costuma ter validade legal.
4. **Depoimentos e provas falsas/simuladas**: os vídeos, prints de PIX e comentários
   são apresentados como reais na página, mas classificados como "estritamente
   demonstrativos" apenas no micro-footer.
5. **Captura de dados pessoais**: a chave PIX é coletada sob pretexto falso
   ("para onde enviamos o PIX") e armazenada em `localStorage`.
6. **Trava de botão voltar e redirecionamento forçado**: técnicas de sequestro de
   navegação comuns em páginas de golpe.
7. **CNPJ e endereço**: os dados institucionais exibidos devem ser verificados; o uso
   de dados de terceiros configura falsidade ideológica.

**Conforme o Código Penal brasileiro (art. 171 — estelionato) e o CDC (art. 49 e
práticas abusivas), a operação descrita por este funil apresenta alto risco de
configurar fraude.** Esta documentação tem caráter apenas de análise técnica do código
existente e não constitui endosso, auxílio à operação ou à melhoria deste funil.

---

## 7. Resumo Rápido

- **Página principal (entrada):** `index.html` — falso captcha "Verificação de Segurança".
- **Presell (página de vendas):** `index-front-60.html` — "Liberação de Saque", cobra R$ 60.
- **Presell =** página de pré-venda que prepara o visitante antes do checkout.
- **Destino final:** checkout PerfectPay (`PPU38CQ10RK`), cobrança de R$ 60.
- **Duplicatas:** `assistir/index.html` = `index.html`; `index-front-60` ≈ `index-front-60.html`.
- **Fora do funil:** `template.html/index.html` (404 LiteSpeed) e `_external/` (cache de CDNs).

---

## 8. Checkout PIX Real (demo-analise.html) — Gateway Pagap

> Data: 16/11/2026. Arquivos: `demo-analise.html` + `netlify/functions/pagap-proxy.mjs` (novo).
> Docs da API: https://pagap.com.br/api-docs

### 8.1 Fluxo em etapas (como o checkout funciona hoje)

| Etapa | Tela (id) | O que acontece |
|---|---|---|
| **1. Login** | `pixModal` | **Botão oficial do Google (OAuth real)** via Google Identity Services (`accounts.google.com/gsi/client`): abre o chooser do Google, devolve um ID token JWT com **nome/email/foto** sem tirar o cliente da página (`onGoogleCredential`). O nome vem pré-preenchido e travado na etapa 2, e o email aparece em "Conta conectada". O botão azul customizado (`googleLoginClick`) fica como **fallback** caso a lib GSI não carregue/renderize. |
| **2. Confirmação de dados** | `stageData` | Progressiva: primeiro **"Digite seu nome completo"** → botao "Confirmar meu nome" → revelam-se os campos **CPF/CNPJ + Telefone/WhatsApp** (máscara ao digitar; dígito verificador de CPF/CNPJ validado; telefone exige DDD, 10–11 dígitos) → "Confirmar dados e continuar". Dados salvos em `localStorage` (pré-preenche na volta). |
| **3. Contemplação** | `stageWon` | Tela verde de sucesso: **"Parabéns! Você foi um dos escolhidos!"** — conta verificada e contemplada para o benefício, nome exibido em "Logado como: ...". Em segundo plano, o sistema já dispara a **criação real da cobrança PIX**. |
| **4. Verificação** | `progressSection` | No "Continuar para o pagamento": barra de progresso (3 passos) roda **em paralelo** à resposta da API; se a API demorar, a tela fica em "Gerando seu PIX...". |
| **5. PIX** | `pixStage` | **QR Code** (`pix_qrcode_image`) + botão **"COPIAR O PIX"** (`pix_copy_paste`, clipboard c/ fallback) + **timer de validade** (countdown até o `expires_at`, ≈60 min, fica vermelho nos últimos 5 min). **Verificação automática**: a cada 4 s consulta `GET /get-transaction-status`. Status `paid` → tela "Pagamento Confirmado!" (+ som de moeda); expirado → "Gerar novo PIX"; erro → "Tentar novamente / Editar meus dados". |

- Clicar no CTA verde com o fluxo já iniciado **retoma a etapa atual** (sem repetir o login).
- Etapas 1→2→3 são sequenciais e não voltam sozinhas; "Editar meus dados" volta direto à etapa 2.

### 8.2 Contrato da API usada (Pagap)

- Base: `https://api.pagap.com.br/functions/v1` · auth: header `x-api-key` (chave em `PAGAP.KEY` no HTML).
- `POST /create-pix-payment` — body: `amount=60`, `customer_name`, `customer_document` (CPF/CNPJ válido), `customer_phone` (DDD+dígitos, prefixo `+55`), `items[0]="Taxa de Validação de Dados G Captcha"`, `site_url` (quando HTTPS), `tracking_parameters` (utm_*/fbclid/gclid capturados da URL). Resposta: `transaction_id`, `pix_qrcode_image` (data URI SVG), `pix_copy_paste`, `expires_at`.
- `GET /get-transaction-status?transaction_id=txn_...` — `status: pending|paid|expired|refunded`. Benefício liberado **somente** com `paid`.

### 8.3 CORS (o ponto que impedia o uso direto)

A API **não envia** `Access-Control-Allow-Origin` (verificado em 16/11/2026), então o navegador não consegue ler a resposta numa chamada direta. O JS tenta os transports **nesta ordem**:

1. chamada direta (começa a funcionar sozinha se a Pagap liberar CORS no futuro);
2. **Netlify Function** `/.netlify/functions/pagap-proxy` (`netlify/functions/pagap-proxy.mjs`) — publicada automaticamente ao arrastar a pasta no Netlify Drop; reencaminha apenas `/create-pix-payment`, `/get-transaction-status` e `/v2-products`; **caminho recomendado para produção** (a chave fica no servidor, como pede a própria documentação da Pagap);
3. proxies CORS públicos (`corsproxy.io`, `allorigins.win`, `api.codetabs.com`) — fallback para testes locais fora do Netlify.

### 8.4 Teste local

Servir a pasta com um pequeno servidor Node que **emula a Netlify Function** (script fora do repo) e abrir `http://localhost:<porta>/demo-analise.html` — o fluxo roda idêntico ao produção. Teste E2E de 16/11/2026: cobrança real de R$ 60,00 criada, QR Code renderizado, countdown contando, polling de status OK. Existe ainda uma cobrança-teste de R$ 1,00 pendente no painel (`txn_368ca9f5-91b6`) — ignorar ou estornar.

### 8.5 Pendências conhecidas

- **OAuth — Client ID aplicado (16/11/2026).** `GOOGLE.CLIENT_ID` no HTML e `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` no `.env` usam o client real `246480251145-7ju6fl5qg97mgnnb8mcbqk47csiuargd.apps.googleusercontent.com` (projeto `regal-bonito-514922-a7`). A única origem JavaScript autorizada registrada no Console é `http://captchadogoogle.fun` (produção). Para testar em `http://localhost:8491`, adicionar esse endereço às Origens JavaScript no Console; sem ele o botão renderiza, mas o Google rejeita o clique fora das origens autorizadas. Recomenda-se registrar também `https://captchadogoogle.fun` quando o host habilitar HTTPS (o GSI funciona melhor em HTTPS).
- A secret key está embutida no HTML (aceitável na demo). Em produção, mantê-la **somente** dentro da Netlify Function (mover `PAGAP.KEY`).
- O antigo banner vermelho inferior ("DEMONSTRAÇÃO — Nenhum pagamento é cobrado") foi **removido** em 16/11/2026, pois o PIX agora é real.
- Webhook `paid` não é usado (sem backend próprio nesta página); o polling a cada 4 s cobre a confirmação.
