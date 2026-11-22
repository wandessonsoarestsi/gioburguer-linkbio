/* ==========================================================================
   GIO BURGER · CONFIGURAÇÃO ÚNICA DA PÁGINA
   Edite SOMENTE este arquivo para trocar links, horários, cardápio e IDs.
   Links e endereço abaixo foram copiados da página de links atual (nov/2026).
   ========================================================================== */
window.GB_CONFIG = {
  links: {
    site:      "https://www.gioburger.com.br/gioburgerhamburgueriaartesanal",
    ifood:     "https://www.ifood.com.br/delivery/joao-pessoa-pb/gioburguer-estados/f29395aa-a7fc-43f7-9ff1-c90bc110c8f5",
    maps:      "https://www.google.com/maps/search/?api=1&query=-7.1102761%2C-34.8547226",
    waze:      "https://waze.com/ul?ll=-7.1102761%2C-34.8547226&navigate=yes",
    uber:      "https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=-7.1102761&dropoff%5Blongitude%5D=-34.8547226&dropoff%5Bnickname%5D=Gio%20Burger&dropoff%5Bformatted_address%5D=Av.%20Acre%2C%20109%20-%20Estados%2C%20Jo%C3%A3o%20Pessoa%20-%20PB",
    whatsapp:  "https://wa.me/5583981268951?text=Ol%C3%A1%2C%20Gio%20Burger!",
    review:    "https://www.google.com/search?q=GioBurger+Hamburgeria+Artesanal+Coment%C3%A1rios#lrd=0x7acdd46a2a5c34f:0xdf9b49189195db5c,3,,,,", // dica: troque pelo link curto "Pedir avaliações" do Perfil da Empresa
    instagram: "https://instagram.com/ogioburger",
    gioparma:  "https://instagram.com/ogioparma",
  },
  /* Links que recebem os parâmetros UTM de entrada. */
  passUtmTo: ["site", "ifood"],

  hours: { timezone: "America/Fortaleza", open: 17, close: 23, days: [0, 1, 2, 3, 4, 5, 6] },
  address: "Av. Acre, 109 • Estados, João Pessoa – PB",

  hero: {
    poster: "assets/hero.webp", // Gb Sertanejo (foto do site de pedidos). TODO: trocar pela foto do Burger Parmegiana
    video: "",                  // opcional: "assets/hero.mp4" (mudo, até 3 MB)
    videoWebm: "",
  },
  logo: "assets/logo.webp",

  /* ---------------- CENA DE ROLAGEM ----------------
     Foto do burger que dá zoom com o scroll; no final entra o combo. */
  stack: {
    /* Uma foto quadrada para cada cena (a 4ª cena é o combo, abaixo). */
    scenes: ["assets/scene-1.webp", "assets/scene-2.webp", "assets/scene-3.webp"],
    combo: "assets/combo.webp", // imagem final (combo)
  },

  /* ---------------- CARDÁPIO ----------------
     price vazio = não mostra preço (os do site mudam entre almoço e jantar). */
  menu: [
    { name: "Burger Parmegiana", tag: "O que viralizou", desc: "Empanado crocante, molho de tomate e queijo gratinado no pão brioche.", price: "", image: "assets/menu/parmegiana.webp" },
    { name: "GB Clássico",   desc: "180g de blend bovino, cheddar, cebola caramelizada e bacon em cubos.", price: "", image: "assets/menu/classico.webp" },
    { name: "GB Sertanejo",  desc: "180g de blend de carne de sol, queijo coalho com mel de engenho e palha de batata-doce.", price: "", image: "assets/menu/sertanejo.webp" },
    { name: "GB Salada",     desc: "Blend bovino, cheddar, alface, tomate, cebola roxa, bacon em cubos e maionese verde.", price: "", image: "assets/menu/salada.webp" },
    { name: "GB Ultrasmash", desc: "Dois discos esmagados na chapa, queijo prato duplo, alface, tomate e cebola roxa.", price: "", image: "assets/menu/ultrasmash.webp" },
  ],

  /* ---------------- AVALIAÇÕES DO GOOGLE ----------------
     Copiadas do perfil no Google Maps em 22/11/2026 (trechos de avaliações 5 estrelas).
     Atualize a nota e o total de vez em quando. */
  reviews: {
    rating: "4,9",
    count: "2.571",
    items: [
      { name: "Fernanda T.", text: "Experiência maravilhosa do começo ao fim! Tudo estava impecável: o lanche delicioso, a sobremesa simplesmente maravilhosa e o atendimento nota mil!" },
      { name: "Ziraldo G.", text: "Hambúrguer de excelente qualidade (excelente mesmo!), batata muito boa. Lugar para transformar em rotina." },
      { name: "Luane M.", text: "O hambúrguer é um dos melhores de João Pessoa, tem opções diferentes do comum, os acompanhamentos são gostosos, bebidas também." },
      { name: "Anabelly R.", text: "O hambúrguer estava MUUITOOO saboroso, com ingredientes de qualidade e uma boa combinação de sabores, amamos demais!" },
      { name: "Thais P.", text: "Comida excelente e muito farta. Fomos atendidos por Luana, que nos proporcionou uma ótima experiência do local!" },
    ],
  },

  tracking: {
    ga4Id: "",       // ex.: "G-XXXXXXXXXX"
    metaPixelId: "", // o site de pedidos já usa um Pixel; se quiser o mesmo aqui, cole o ID
  },
};
