// =============================================
//  CONFIGURAÇÕES DA LOJA — edite aqui
// =============================================
const LOJA = {
  nome: "Ravyn Company",
  // Número do WhatsApp com código do país + DDD, só números.
  // Ex.: 55 (Brasil) + 11 (DDD) + 999999999  ->  "5511999999999"
  whatsapp: "5519999404625",
  // Caminho do logo. Deixe "" para usar o logo em texto.
  logo: "img/logo-transparente.png",
  // Formas de pagamento e taxas da maquininha (em %).
  // A taxa é somada ao total para você receber o valor cheio da peça.
  // Para não cobrar taxa numa forma, coloque 0.
  // No crédito, cada número de parcelas tem a sua taxa. Apague linhas para limitar as parcelas.
  pagamento: {
    pix: 0,
    debito: 1.99,
    credito: {
      1: 4.99,
      2: 6.09,
      3: 7.09,
    },
  },
  instagram: "https://www.instagram.com/ravyncompany/",
  // true = esconde o catálogo e mostra "Drop chegando em breve" (use enquanto não tiver as peças)
  emBreve: false,
  // Slogan grafite da página inicial: "rua-veste" (A RUA VESTE RAVYN) ou "seu-corre" (SEU CORRE SEU ESTILO)
  tituloGrafite: "seu-corre",
  // Contador de visitas (opcional). Deixe "" para desligar.
  // googleAnalytics: o código da tag do Google (começa com GTM- ou G-, ex.: "GTM-542C4GV4")
  // metaPixel: o número do Pixel da Meta (Facebook/Instagram), ex.: "1234567890123456"
  analytics: {
    googleAnalytics: "GTM-542C4GV4",
    metaPixel: "",
  },
  // Frases da faixa rolante no topo
  faixa: ["Pronta entrega", "Entrega em Americana e região", "Peças originais", "Pedido pelo WhatsApp"],
};
