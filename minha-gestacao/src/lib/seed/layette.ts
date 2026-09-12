import type { LayetteItemTemplate } from "../types";

export const LAYETTE_ITEMS: LayetteItemTemplate[] = [
  // Roupas
  { id: "l01", name: "Body de manga curta", category: "roupas", recommendedQty: 6 },
  { id: "l02", name: "Body de manga longa", category: "roupas", recommendedQty: 6 },
  { id: "l03", name: "Macacão/pijama", category: "roupas", recommendedQty: 6 },
  { id: "l04", name: "Meias", category: "roupas", recommendedQty: 6 },
  { id: "l05", name: "Luvas de proteção", category: "roupas", recommendedQty: 3 },
  { id: "l06", name: "Touca", category: "roupas", recommendedQty: 2 },
  { id: "l07", name: "Casaco/manta", category: "roupas", recommendedQty: 2 },

  // Banho e higiene
  { id: "l08", name: "Banheira para bebê", category: "banho_higiene", recommendedQty: 1 },
  { id: "l09", name: "Toalha com capuz", category: "banho_higiene", recommendedQty: 3 },
  { id: "l10", name: "Fraldas descartáveis RN", category: "banho_higiene", recommendedQty: 1, notes: "Pacote inicial" },
  { id: "l11", name: "Lenços umedecidos", category: "banho_higiene", recommendedQty: 2 },
  { id: "l12", name: "Kit de higiene (escova, tesoura, cortador de unha)", category: "banho_higiene", recommendedQty: 1 },
  { id: "l13", name: "Pomada para assadura", category: "banho_higiene", recommendedQty: 1 },

  // Quarto
  { id: "l14", name: "Berço", category: "quarto", recommendedQty: 1 },
  { id: "l15", name: "Colchão para berço", category: "quarto", recommendedQty: 1 },
  { id: "l16", name: "Jogo de lençol para berço", category: "quarto", recommendedQty: 2 },
  { id: "l17", name: "Cômoda ou trocador", category: "quarto", recommendedQty: 1 },
  { id: "l18", name: "Termômetro de ambiente", category: "quarto", recommendedQty: 1 },

  // Alimentação
  { id: "l19", name: "Mamadeiras", category: "alimentacao", recommendedQty: 3 },
  { id: "l20", name: "Escova para mamadeira", category: "alimentacao", recommendedQty: 1 },
  { id: "l21", name: "Babadores", category: "alimentacao", recommendedQty: 4 },

  // Passeios
  { id: "l22", name: "Cadeirinha para o carro (bebê conforto)", category: "passeios", recommendedQty: 1 },
  { id: "l23", name: "Carrinho de bebê", category: "passeios", recommendedQty: 1 },
  { id: "l24", name: "Bolsa maternidade", category: "passeios", recommendedQty: 1 },

  // Maternidade (mala do hospital)
  { id: "l25", name: "Saída de maternidade", category: "maternidade", recommendedQty: 1 },
  { id: "l26", name: "Roupas para a mãe (mala hospital)", category: "maternidade", recommendedQty: 3 },
  { id: "l27", name: "Absorvente pós-parto", category: "maternidade", recommendedQty: 1 },
];
