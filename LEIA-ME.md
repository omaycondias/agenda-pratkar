# Jogamos Shop — Landing Page

Landing page de captação para o grupo de ofertas no WhatsApp.
HTML, CSS e JavaScript puros. **Sem build, sem `npm install`.**
Abra o `index.html` no navegador e já funciona.

---

## Antes de publicar — checklist

### 1. Trocar o domínio (4 lugares)
Hoje está o provisório `https://www.jogamosshop.com.br`. Substitua em:

| Arquivo | O que trocar |
|---|---|
| `index.html` | `canonical`, `og:url`, `og:image`, `twitter:image` e os `@id`/`url` do JSON-LD |
| `politica-de-privacidade.html` | `canonical` |
| `termos-de-uso.html` | `canonical` |
| `robots.txt` e `sitemap.xml` | as URLs |

Atalho: `grep -rl "www.jogamosshop.com.br" .` mostra todos.

### 2. Conferir o link do grupo
`site.config.js → whatsappGroupUrl` já está com o link que estava público no
site de vocês (`chat.whatsapp.com/IylWMlh44Us2kKs3klrIwn`). **Confirme se ainda
é o convite ativo** — links de convite do WhatsApp podem ser revogados.

### 3. Preencher ou remover os números
Os 4 números da seção "comunidade" estão **vazios de propósito** — nada foi
inventado. Preencha em `site.config.js → stats` só com dados comprováveis:

```js
stats: [
  { value: '2.400', suffix: '+', label: 'pessoas na comunidade' },
  ...
]
```

Quando todos os 4 tiverem valor, a caixa azul de "Nota para edição" some
sozinha. Se você não tem números, apague o `<ul class="stats">`, o `<p class="note">`
e o item 5 do `sitemap`… ou simplesmente deixe como está: os cards ficam
marcados com borda tracejada, o que sinaliza pendência sem mentir para o visitante.

### 4. Completar os documentos legais
`politica-de-privacidade.html` e `termos-de-uso.html` têm trechos marcados
com fundo azul tracejado (`PREENCHER` / `CONFERIR`): razão social, CNPJ e
quais ferramentas de análise estão realmente instaladas. São modelos de
partida — peça revisão de um advogado.

---

## Trocar as imagens

As 5 fotos atuais são do **Unsplash**, livres para uso comercial. Detalhes de
licença e origem em `CREDITOS-IMAGENS.md`. Elas resolvem o lançamento — mas
assim que vocês tiverem fotos próprias dos treinos, troquem pelo menos a da
comunidade. Gente real converte mais que banco de imagens.

**Jeito rápido** — em `site.config.js`, sem tocar no HTML:
```js
images: {
  'comunidade-01': 'assets/img/treino-real.webp',
  'produto-01': 'assets/img/chuteira.webp',
}
```

**Jeito ideal** — troque direto no `index.html`, porque o navegador descobre a
imagem sem esperar o JavaScript (melhor para LCP e SEO):
```html
<img class="shot shot--sq" data-img="produto-01" src="assets/img/chuteira.webp"
     width="1000" height="1000" loading="lazy" decoding="async"
     alt="Chuteira de campo Nike branca e rosa">
```

**Ao exportar:**
- WebP ou AVIF, **1000px** para produtos (quadrado) e **900×1125** para a
  comunidade (4:5). É ~2× o tamanho de exibição — nítido em Retina sem peso.
- Sempre informe `width` e `height`. É o que impede o layout de pular (CLS).
- Escreva um `alt` que descreva a foto. Serve para leitor de tela e para o
  Google Imagens.
- Fotos com fundo desfocado comprimem muito melhor que fundos texturizados.
  A bola em foco na grama pesava 342 KB; com fundo desfocado, 97 KB.

Slots: `produto-01` a `produto-04`, `comunidade-01`.

**Tratamento fotográfico.** Todas as fotos passam por um filtro em CSS
(`.shot { filter: contrast(1.07) saturate(.86) brightness(.95) }`) que dá
unidade visual — é o que faz fotos de origens diferentes parecerem uma campanha
só. Vale automaticamente para as fotos que vocês trocarem. Para desligar,
apague a linha `filter` no `style.css`.

---

## Arquivos

```
index.html                    página principal (11 blocos)
site.config.js                ← links, números e imagens ficam AQUI
politica-de-privacidade.html
termos-de-uso.html
robots.txt / sitemap.xml
assets/css/style.css          tokens da marca + todas as seções
assets/js/main.js             scroll, revelações, accordion, menu, medição
assets/js/hero-canvas.js      partículas do hero (~2 KB, sem biblioteca)
assets/js/anel-3d.js          NÃO É USADO — ver abaixo
assets/img/produto-01..04.webp   fotos dos produtos (WebP, ~90 KB cada)
assets/img/comunidade-01.webp
assets/img/alta-resolucao/       as mesmas fotos em 3840px — NÃO usadas pela
                                 página, só para reuso (posts, impressos)
assets/img/favicon.svg
assets/img/og-jogamos-shop.png   card de compartilhamento 1200x630
assets/img/jogamos-mark.png      símbolo em alta
CREDITOS-IMAGENS.md              licença e origem das fotos
```

### Sobre o `anel-3d.js`
É o anel de partículas do exemplo original. **Deixei o arquivo, mas não carrego
ele** — são ~600 KB de three.js vindos de CDN, o que atrapalha exatamente as
metas de performance mobile. No lugar, o hero usa `hero-canvas.js`: canvas 2D
puro que desenha o arco do sorriso do logotipo em partículas, com pausa
automática quando sai da tela.

Se quiser o anel de volta, adicione antes do `</body>` do `index.html`:
```html
<script type="module" src="assets/js/anel-3d.js"></script>
```
(ele espera um elemento `.hero__visual`, que precisaria ser recriado).

---

## Medir conversão

Todo botão que leva ao grupo tem `data-track` com a origem (`hero`, `urgencia`,
`final`, `flutuante`…). Se você instalar Google Tag Manager ou gtag, o clique
dispara sozinho o evento **`clique_grupo_whatsapp`** com a propriedade `origem`.
Assim dá para ver qual seção converte mais. Sem GTM instalado, não faz nada e
não quebra nada.

---

## Publicar

É um site estático. Sobe em qualquer lugar — Vercel, Netlify, Cloudflare Pages,
GitHub Pages ou hospedagem comum. Basta enviar a pasta inteira.

Depois de publicar:
1. Cadastre o domínio no Google Search Console e envie o `sitemap.xml`.
2. Teste o `index.html` no [Rich Results Test](https://search.google.com/test/rich-results) —
   o FAQ deve ser reconhecido como `FAQPage`.
3. Rode um PageSpeed Insights na versão mobile.

---

## Decisões que valem saber

- **Verde só onde se clica.** O verde do WhatsApp não aparece em nenhum outro
  lugar da página. Isso treina o olho: verde = ação. Não use verde em
  decoração ou o CTA perde força.
- **O azul da marca (`#0000FF`) nunca é texto pequeno sobre preto** — dá 2,4:1
  de contraste e reprova em acessibilidade. Ele é usado como preenchimento
  (blocos, etiquetas, arcos). Para texto existem duas variáveis já calibradas:
  `--glow` (#8C8CFF, 7,3:1) para texto miúdo e `--glow-hi` (#6E6EFF, 5,3:1)
  para display grande.
- **`prefers-reduced-motion` desliga tudo** e mostra a página inteira estática
  e funcional. Vale a pena testar (macOS: Ajustes → Acessibilidade → Tela →
  Reduzir movimento).
