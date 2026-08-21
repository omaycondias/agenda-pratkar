# Créditos e licença das imagens

Todas as fotos vieram do **Unsplash**, sob a [Unsplash License](https://unsplash.com/license).

> Resumo da licença: uso gratuito, inclusive **comercial**, sem necessidade de
> pedir permissão e **sem obrigação de creditar**. O que a licença **não**
> permite é vender as fotos sem alteração nem montar um serviço concorrente do
> Unsplash com elas. Usar numa landing page comercial está plenamente coberto.

Ainda assim, creditar é boa prática. Se quiser fazer isso, cole a URL de origem
abaixo na busca do Unsplash para chegar na página do autor.

| Slot | Onde aparece | URL de origem (CDN) |
|---|---|---|
| `produto-01` | Campo · Chuteiras | `images.unsplash.com/photo-1597274707167-0c880e6c72d0` |
| `produto-02` | Corrida · Tênis | `images.unsplash.com/photo-1571008887538-b36bb32f4571` |
| `produto-03` | Basquete · Cano alto | `images.unsplash.com/photo-1552346154-21d32810aba3` |
| `produto-04` | Bolas · Campo e quadra | `images.unsplash.com/photo-1486286701208-1d58e9338013` |
| `comunidade-01` | Bloco "A ideia" | `images.unsplash.com/photo-1540539234-c14a20fb7c7b` |

---

## Uma recomendação

Essas fotos resolvem o lançamento, mas **são de banco de imagens**. A força da
Jogamos é ser uma comunidade real, com rosto, em Belo Horizonte. Assim que
vocês tiverem fotos próprias — principalmente das corridas e dos treinos —
troquem pelo menos a `comunidade-01`. Uma foto de gente que a pessoa pode
encontrar no próximo treino converte mais do que qualquer banco de imagens.

A troca é simples: veja "Trocar as imagens" no `LEIA-ME.md`.

---

## O que foi feito com cada arquivo

- Recorte no CDN: **1:1** nos produtos, **4:5** na comunidade (`crop=faces`,
  para o grupo preencher a moldura).
- Exportadas em **WebP**, 1000px nos produtos e 900px na comunidade — cerca de
  2× o tamanho de exibição, o que mantém a nitidez em tela Retina.
- Correção de tom aplicada na origem em duas fotos, para entrarem na mesma
  faixa tonal das outras: a bola (`sat=-35&bri=-10`, o verde estourava contra o
  preto) e a comunidade (`sat=-15&bri=-5`).
- Tratamento geral em CSS (`.shot { filter: ... }`), que vale também para
  qualquer foto que vocês colocarem no lugar.

**Total das 5 imagens: 519 KB**, todas com `loading="lazy"` e abaixo da dobra —
nenhuma entra no caminho crítico do carregamento.

## Versões em alta resolução

`assets/img/alta-resolucao/` tem as mesmas 5 fotos em **3840px** (JPEG q90),
para posts, impressos ou qualquer outro uso. **A página não carrega esses
arquivos** — se for publicar num servidor com espaço limitado, essa pasta pode
ficar de fora sem afetar nada.
