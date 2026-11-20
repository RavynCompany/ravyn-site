# Site Ravyn Company (streetwear)

Abra `index.html` no navegador para ver o site.

## O que editar
- **js/config.js**: número do WhatsApp (só números, com 55 + DDD), logo, Instagram,
  taxas da maquininha (Pix, débito e crédito por parcela), modo "Em breve" e frases da faixa rolante.
- **js/products.js**: catálogo (marca, nome, categoria, preço, tamanhos, foto, adesivo).
  As categorias do menu e dos filtros são criadas automaticamente a partir dos produtos.
- **img/**: logo e fotos das peças (ex.: `img/camiseta-preta.jpg`).
  - `logo.png` é o original; `logo-transparente.png` é a versão sem fundo usada no site.

## Como funciona
O cliente escolhe o tamanho e adiciona à sacola. Na sacola informa nome, endereço de entrega
(o CEP preenche rua, bairro e cidade sozinho) e a forma de pagamento: Pix, débito ou crédito.
No cartão, a taxa da maquininha é somada ao total, para você receber o valor cheio das peças.
Ao clicar em "Fechar pedido no WhatsApp", abre-se uma conversa com o seu número já com
peças, total, forma de pagamento e endereço. Sacola e dados ficam salvos no navegador do cliente.
