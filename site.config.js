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
     ATENÇÃO: nada aqui é inventado. Os valores estão como "—" de propósito.
     Preencha SOMENTE com números que você consiga comprovar.
     Ex.: { value: '2.400', suffix: '+', label: 'pessoas na comunidade' }
     Deixe `value` como null para o card aparecer marcado como pendente.
     ---------------------------------------------------------------------- */
  stats: [
    { value: null, suffix: '',  label: 'pessoas na comunidade' },
    { value: null, suffix: '',  label: 'ofertas compartilhadas' },
    { value: null, suffix: '',  label: 'anos conectando gente ao esporte' },
    { value: null, suffix: '',  label: 'modalidades atendidas' }
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
