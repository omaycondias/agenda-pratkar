/* =============================================================================
   JOGAMOS SHOP — CONFIGURAÇÃO CENTRAL
   -----------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para trocar links, textos de
   contato, números de prova social e imagens.

   Como funciona: os valores abaixo são aplicados no carregamento da página.
   Os links de WhatsApp e Instagram TAMBÉM estão escritos direto no index.html,
   para que a página continue funcionando mesmo sem JavaScript. Se você mudar
   algo aqui, o valor daqui vence.
   ========================================================================== */

window.siteConfig = {

  /* --- IDENTIDADE ------------------------------------------------------- */
  brandName: 'Jogamos Shop',
  brandParent: 'Jogamos',
  city: 'Belo Horizonte',
  state: 'MG',

  /* --- LINKS PRINCIPAIS -------------------------------------------------
     whatsappGroupUrl -> destino do CTA principal (convite do grupo)
     whatsappDirectUrl -> atendimento 1:1 (usado só no rodapé)
     ---------------------------------------------------------------------- */
  whatsappGroupUrl: 'https://chat.whatsapp.com/IylWMlh44Us2kKs3klrIwn',
  whatsappDirectUrl: 'https://wa.me/5531991557232',
  instagramUrl: 'https://www.instagram.com/jogamosshop/',
  instagramCommunityUrl: 'https://www.instagram.com/jogamos.oficial/',
  shopUrl: 'https://appjogamos.com.br/jogamosshop',
  email: 'appjogamos@gmail.com',

  /* --- DOMÍNIO ----------------------------------------------------------
     TROCAR pelo domínio final. Usado em canonical, Open Graph e sitemap.xml.
     Lembre de atualizar também: index.html (<link rel=canonical> e og:url),
     sitemap.xml e robots.txt.
     ---------------------------------------------------------------------- */
  siteUrl: 'https://jogamos-shop.vercel.app',

  /* --- PROVA SOCIAL -----------------------------------------------------
     Números informados pela equipe da Jogamos. Edite aqui quando mudarem.
     `prefix` e `suffix` são opcionais e ficam colados no número.
     Um `value` que não seja numérico (uma lista, por exemplo) é renderizado
     em corpo menor automaticamente, para caber no card.
     Deixe `value: null` para o card voltar a aparecer marcado como pendente.
     ---------------------------------------------------------------------- */
  stats: [
    { value: '70',    prefix: '+', label: 'pessoas na comunidade' },
    { value: '1.000', prefix: '+', label: 'ofertas enviadas por mês' },
    { value: '2',                  label: 'anos conectando gente ao esporte' },
    { value: 'Futebol, corrida, muay thai e outros', label: 'modalidades atendidas' }
  ],

  /* --- IMAGENS ----------------------------------------------------------
     Troque o caminho pelo arquivo real (.webp ou .avif de preferência).
     A chave corresponde ao atributo data-img="..." no index.html.
     Ex.: 'produto-01': 'assets/img/chuteira.webp'
     ---------------------------------------------------------------------- */
  images: {
    // 'produto-01': 'assets/img/produto-01.webp',
    // 'produto-02': 'assets/img/produto-02.webp',
    // 'campanha-01': 'assets/img/campanha-01.webp',
  }
};
