# Gio Burger · Landing page "link na bio"

Página estática (HTML + CSS + JS puro, sem build). GSAP ScrollTrigger é carregado sob demanda só quando a pessoa rola até a animação.

```
index.html        página (CSS crítico embutido)
config.js         ÚNICO arquivo para editar: links, horário, cardápio, camadas, GA4/Pixel
main.js           comportamento (UTM, eventos, aberto/fechado, animação)
assets/           imagens (os placeholders têm os MESMOS nomes que os arquivos finais)
netlify.toml / vercel.json   cache de 1 ano para /assets
```

Testar localmente: `python3 -m http.server` na pasta e abrir `http://localhost:8000`.

## Resultado do teste (Lighthouse mobile, com placeholders)

Performance 98 · Acessibilidade 94+ · Boas práticas 96 · SEO 100
FCP 1,0 s · LCP 1,7 s · CLS 0,003. Depois de trocar as fotos, mantenha os pesos abaixo para continuar acima de 90.

## De onde veio o conteúdo (nov/2026)

- **Links, WhatsApp e endereço** (Av. Acre, 109 – Estados): copiados da página de links atual (links.midum.com.br/gioburger).
- **Logo e fotos** (GB Clássico, Sertanejo, Salada, Ultrasmash e o banner do combo): do site de pedidos gioburger.com.br.
- **Descrições do cardápio**: do site de pedidos.
- O Instagram não deixa baixar fotos sem login e o iFood bloqueou o acesso automático, por isso o Burger Parmegiana ainda está sem foto e sem preço.

## O que ainda falta

| Item | Onde trocar |
|---|---|
| Foto do Burger Parmegiana | `assets/hero.webp` (capa) |
| Foto do Parmegiana para o card | `menu[0].image` no `config.js` |
| Preços (opcional) | `menu[].price` — vazio não mostra preço |
| Vídeo da capa (opcional) | `hero.video` |
| Link curto de avaliação do Google | `links.review` |
| IDs GA4 / Meta Pixel | `tracking` |

## Cena de rolagem

São 4 cenas: três fotos quadradas (`assets/scene-1.webp`, `scene-2.webp`, `scene-3.webp`, lista em `stack.scenes`) que trocam e aproximam com o scroll, e o combo (`assets/combo.webp`) no final. Para trocar uma foto, basta sobrescrever o arquivo.

## Como chegar

Os botões Google Maps, Waze e Uber usam as coordenadas da loja no Google Maps (-7.1102761, -34.8547226). Os links ficam em `links.maps`, `links.waze` e `links.uber` no `config.js`.

## Rastreamento

- UTMs de entrada (`utm_*`, `fbclid`, `gclid`) são guardados na sessão e repassados para `site`, `ifood` e `review` (lista em `passUtmTo`). Sem UTM, a página marca `utm_source=instagram` (ou `linkbio`), `utm_medium=bio`.
- Sugestão para a bio do Instagram: `https://SEU-DOMINIO/?utm_source=instagram&utm_medium=bio&utm_campaign=linkbio`.
- Cada clique dispara:
  - GA4: evento `click_button` com `button_name` (ex.: `pedir_site`, `ifood`, `whatsapp`, `barra_pedir_agora`, `cardapio_burger_parmegiana`).
  - Meta Pixel: `ClickButton` (custom) com `button_name`, mais `InitiateCheckout` (site/iFood) e `Contact` (WhatsApp).
  - `dataLayer` (`gb_click`) para quem usar GTM.

## Navegador do Instagram

Sem dependência de hover; feedback de toque por `:active` + classe `pressed` (+ vibração curta no Android). Links abrem na mesma aba dentro do Instagram/Facebook (o webview repassa WhatsApp, iFood e Maps para os apps); no desktop abrem em nova aba. Altura usa `svh` para não pular quando a barra do navegador some.

## Deploy

**Netlify:** arraste a pasta em app.netlify.com/drop, ou conecte um repositório (publish = raiz).
**Vercel:** `vercel` na pasta, ou importe o repositório (framework "Other", sem build).
Depois aponte um domínio (ex.: `link.ogioburger.com.br`) e troque `og:image` no `index.html` para a URL absoluta (`https://seu-dominio/assets/og-image.jpg`), que é o formato que o WhatsApp/Instagram leem melhor.
