// =============================================
//  CATÁLOGO — adicione, remova ou edite produtos aqui
//  (os itens abaixo são EXEMPLOS — troque pelos seus)
//  marca:    aparece acima do nome (ex.: "Chronic")
//  imagem:   caminho da foto (ex.: "img/camiseta-preta.jpg"). Vazio = imagem provisória.
//  tamanhos: lista de tamanhos disponíveis (roupas: só "M" e "G"; bonés e acessórios: "Único").
//  selo:     texto opcional no adesivo do card (ex.: "Novo", "Últimas", "Drop")
//  tom:      cor da imagem provisória (só usado sem foto)
// =============================================
const PRODUTOS = [
  { id: 1, marca: "Chronic", nome: "Camiseta Graffiti Black", categoria: "Camisetas", preco: 129.9, tamanhos: ["M", "G"], imagem: "", tom: "#161616", selo: "Drop" },
  { id: 2, marca: "Chronic", nome: "Camiseta Tag Off-White", categoria: "Camisetas", preco: 119.9, tamanhos: ["M", "G"], imagem: "", tom: "#e9e4d6" },
  { id: 3, marca: "Chronic", nome: "Camiseta Skate Session", categoria: "Camisetas", preco: 129.9, tamanhos: ["M", "G"], imagem: "", tom: "#1f4fa8", selo: "Novo" },
  { id: 4, marca: "Chronic", nome: "Moletom Canguru Street", categoria: "Moletons", preco: 299.9, tamanhos: ["M", "G"], imagem: "", tom: "#262626", selo: "Novo" },
  { id: 5, marca: "Chronic", nome: "Moletom Spray Verde", categoria: "Moletons", preco: 289.9, tamanhos: ["M", "G"], imagem: "", tom: "#2f6b33" },
  { id: 6, marca: "Chronic", nome: "Bermuda Moletom Classic", categoria: "Bermudas", preco: 159.9, tamanhos: ["M", "G"], imagem: "", tom: "#3a3a3a" },
  { id: 7, marca: "Chronic", nome: "Bermuda Cargo Rua", categoria: "Bermudas", preco: 179.9, tamanhos: ["M", "G"], imagem: "", tom: "#5b5640", selo: "Últimas" },
  { id: 8, marca: "Chronic", nome: "Boné Aba Curva Tag", categoria: "Bonés", preco: 119.9, tamanhos: ["Único"], imagem: "", tom: "#141414" },
  { id: 9, marca: "Chronic", nome: "Boné Trucker Neon", categoria: "Bonés", preco: 109.9, tamanhos: ["Único"], imagem: "", tom: "#c8e632" },
  { id: 10, marca: "Ravyn", nome: "Meia Cano Alto Ravyn", categoria: "Acessórios", preco: 39.9, tamanhos: ["Único"], imagem: "", tom: "#efefef" },
  { id: 11, marca: "Chronic", nome: "Shoulder Bag Street", categoria: "Acessórios", preco: 149.9, tamanhos: ["Único"], imagem: "", tom: "#202226" },
  { id: 12, marca: "Chronic", nome: "Regata Basquete Night", categoria: "Camisetas", preco: 109.9, tamanhos: ["M", "G"], imagem: "", tom: "#7a1f2b" },
];
