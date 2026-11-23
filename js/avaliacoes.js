// =============================================
//  AVALIAÇÕES DE CLIENTES (só de quem comprou)
//
//  Como funciona:
//  1. Todo pedido feito no site recebe um código (ex.: RVN-7K2QX) que chega no seu WhatsApp.
//  2. Depois da entrega, o cliente clica em "Avaliar minha compra" e informa esse código.
//     A avaliação chega no seu WhatsApp.
//  3. Você confere se o código existe na conversa com esse cliente. Se a compra for real,
//     adicione a avaliação abaixo (ou peça para o Claude adicionar) e ela aparece no site.
//
//  Formato de cada avaliação:
//  { pedido: "RVN-7K2QX", produto: 1, nota: 5, nome: "Maria S.", cidade: "Campinas/SP",
//    texto: "Camiseta top, tecido grosso!", data: "2026-12-05" },
//
//  produto = id da peça em js/products.js  |  nota = 1 a 5
// =============================================
const AVALIACOES = [
];
