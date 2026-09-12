-- Conteúdo inicial (catálogos globais). Espelha os arquivos em
-- src/lib/seed/*.ts — se ajustar o conteúdo lá, replique aqui (ou, no futuro,
-- gere este arquivo a partir da área administrativa).

insert into public.checklist_tasks (id, title, description, category, start_week, end_week, priority) values
  ('t01', 'Escolher o profissional de saúde que vai te acompanhar', 'Defina com quem você fará o pré-natal e agende a primeira consulta.', 'organizacao', 1, 8, 'alta'),
  ('t02', 'Reunir seus documentos pessoais', 'Separe RG, CPF, comprovante de residência e carteirinha do convênio, se tiver.', 'documentos', 1, 12, 'media'),
  ('t03', 'Contar a novidade e organizar sua rotina', 'Planeje como ajustar trabalho e compromissos nos próximos meses.', 'organizacao', 4, 12, 'media'),
  ('t04', 'Pesquisar sobre licença-maternidade', 'Entenda prazos e documentos necessários no seu país/empresa.', 'documentos', 8, 20, 'media'),
  ('t05', 'Começar a pensar no orçamento do bebê', 'Tenha uma ideia inicial de quanto você pretende investir na preparação.', 'financeiro', 10, 16, 'media'),
  ('t06', 'Revisar a lista do enxoval', 'Dê uma primeira olhada nas categorias de itens que vai precisar.', 'enxoval', 14, 20, 'alta'),
  ('t07', 'Pesquisar os principais itens necessários', 'Compare tipos de berço, carrinho e itens de maior investimento.', 'enxoval', 14, 24, 'media'),
  ('t08', 'Conversar sobre o orçamento do enxoval', 'Alinhe com quem for te ajudar o quanto pretendem gastar por categoria.', 'financeiro', 15, 22, 'media'),
  ('t09', 'Definir onde o bebê vai dormir', 'Escolha o cômodo/espaço e comece a planejar a organização do quarto.', 'casa', 16, 24, 'media'),
  ('t10', 'Pesquisar maternidades ou hospitais', 'Levante opções e informações práticas (documentos, visitas, convênio).', 'organizacao', 18, 28, 'media'),
  ('t11', 'Fazer o chá de bebê (se for o caso)', 'Planeje data, lista de convidados e lista de presentes com antecedência.', 'organizacao', 20, 30, 'baixa'),
  ('t12', 'Iniciar as compras do enxoval básico', 'Comece pelos itens de maior prioridade: roupas de recém-nascido e itens de higiene.', 'enxoval', 20, 28, 'alta'),
  ('t13', 'Montar o quarto do bebê', 'Organize móveis, decoração e o espaço de troca de fraldas.', 'casa', 28, 34, 'alta'),
  ('t14', 'Pesquisar cadeirinha para o carro', 'Verifique a exigência legal do seu país e compare modelos.', 'enxoval', 28, 34, 'alta'),
  ('t15', 'Organizar os documentos para a maternidade', 'Separe uma pasta com documentos, exames e cartão do convênio.', 'documentos', 30, 37, 'media'),
  ('t16', 'Planejar quem vai te ajudar nas primeiras semanas', 'Combine com família/rede de apoio a rotina do pós-parto.', 'organizacao', 30, 37, 'media'),
  ('t17', 'Revisar o progresso do enxoval', 'Confira o que já foi comprado e o que ainda falta adquirir.', 'enxoval', 32, 37, 'media'),
  ('t18', 'Registrar o bebê na maternidade e no plano de saúde', 'Levante com antecedência os documentos exigidos para isso.', 'documentos', 32, 40, 'baixa'),
  ('t19', 'Montar a mala da maternidade', 'Separe itens para você, acompanhante e bebê com antecedência.', 'maternidade', 34, 39, 'alta'),
  ('t20', 'Deixar a cadeirinha instalada no carro', 'Garanta que o item esteja pronto antes da data prevista.', 'enxoval', 36, 39, 'alta'),
  ('t21', 'Definir a rota até a maternidade', 'Combine transporte e um plano B com quem for te acompanhar.', 'organizacao', 36, 40, 'media'),
  ('t22', 'Conferir o checklist final', 'Revise tudo o que precisa estar pronto antes da chegada do bebê.', 'maternidade', 38, 42, 'alta'),
  ('t23', 'Deixar a casa organizada para o pós-parto', 'Adiante tarefas domésticas e refeições para as primeiras semanas.', 'casa', 36, 41, 'media')
on conflict (id) do nothing;

insert into public.layette_categories (id, label, icon, sort_order) values
  ('roupas', 'Roupas', '👕', 1),
  ('banho_higiene', 'Banho e higiene', '🛁', 2),
  ('quarto', 'Quarto', '🛏️', 3),
  ('alimentacao', 'Alimentação', '🍼', 4),
  ('passeios', 'Passeios', '🚗', 5),
  ('maternidade', 'Maternidade', '🏥', 6)
on conflict (id) do nothing;

insert into public.layette_items (id, category_id, name, recommended_qty, notes) values
  ('l01', 'roupas', 'Body de manga curta', 6, null),
  ('l02', 'roupas', 'Body de manga longa', 6, null),
  ('l03', 'roupas', 'Macacão/pijama', 6, null),
  ('l04', 'roupas', 'Meias', 6, null),
  ('l05', 'roupas', 'Luvas de proteção', 3, null),
  ('l06', 'roupas', 'Touca', 2, null),
  ('l07', 'roupas', 'Casaco/manta', 2, null),
  ('l08', 'banho_higiene', 'Banheira para bebê', 1, null),
  ('l09', 'banho_higiene', 'Toalha com capuz', 3, null),
  ('l10', 'banho_higiene', 'Fraldas descartáveis RN', 1, 'Pacote inicial'),
  ('l11', 'banho_higiene', 'Lenços umedecidos', 2, null),
  ('l12', 'banho_higiene', 'Kit de higiene (escova, tesoura, cortador de unha)', 1, null),
  ('l13', 'banho_higiene', 'Pomada para assadura', 1, null),
  ('l14', 'quarto', 'Berço', 1, null),
  ('l15', 'quarto', 'Colchão para berço', 1, null),
  ('l16', 'quarto', 'Jogo de lençol para berço', 2, null),
  ('l17', 'quarto', 'Cômoda ou trocador', 1, null),
  ('l18', 'quarto', 'Termômetro de ambiente', 1, null),
  ('l19', 'alimentacao', 'Mamadeiras', 3, null),
  ('l20', 'alimentacao', 'Escova para mamadeira', 1, null),
  ('l21', 'alimentacao', 'Babadores', 4, null),
  ('l22', 'passeios', 'Cadeirinha para o carro (bebê conforto)', 1, null),
  ('l23', 'passeios', 'Carrinho de bebê', 1, null),
  ('l24', 'passeios', 'Bolsa maternidade', 1, null),
  ('l25', 'maternidade', 'Saída de maternidade', 1, null),
  ('l26', 'maternidade', 'Roupas para a mãe (mala hospital)', 3, null),
  ('l27', 'maternidade', 'Absorvente pós-parto', 1, null)
on conflict (id) do nothing;

-- Produtos de exemplo — fictícios, claramente identificados como placeholder
-- (store_name "Loja Exemplo", URLs em exemplo.com). Substitua
-- regular_product_url/affiliate_url por parceiros reais antes de produção.
-- Requer a migration 0002 (colunas product_name, country_code, etc.).
insert into public.product_recommendations
  (id, layette_item_id, product_name, product_description, category, country_code, store_name, regular_product_url, affiliate_url, currency, price, priority, is_active, is_placeholder) values
  ('p01', 'l01', 'Kit body manga curta (exemplo)', 'Kit com 5 bodies de algodão, tamanho RN — exemplo de produto.', 'roupas', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/kit-body-manga-curta', null, 'BRL', 129.90, 'media', true, true),
  ('p07', 'l01', 'Body de bebê (exemplo)', 'Body unitário 100% algodão — exemplo de produto (opção alternativa).', 'roupas', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/body-bebe', null, 'BRL', 79.90, 'baixa', true, true),
  ('p02', 'l14', 'Berço padrão americano (exemplo)', 'Berço em MDF com grades reguláveis — exemplo de produto.', 'quarto', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/berco-padrao-americano', null, 'BRL', 1450.00, 'alta', true, true),
  ('p03', 'l22', 'Bebê conforto grupo 0+ (exemplo)', 'Cadeirinha para recém-nascidos, compatível com a maioria dos carros — exemplo.', 'passeios', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/bebe-conforto', null, 'BRL', 799.90, 'alta', true, true),
  ('p03us', 'l22', 'Infant car seat (example)', 'Rear-facing infant car seat, group 0+ — example product.', 'passeios', 'US', 'Example Store', 'https://www.example.com/products/infant-car-seat', null, 'USD', 129.99, 'alta', true, true),
  ('p04', 'l08', 'Banheira com apoio anatômico (exemplo)', 'Banheira com apoio para recém-nascidos — exemplo de produto.', 'banho_higiene', '*', 'Loja Exemplo', 'https://www.exemplo.com/produtos/banheira-anatomica', null, 'BRL', 179.90, 'media', true, true),
  ('p05', 'l23', 'Carrinho de bebê (exemplo)', 'Carrinho dobrável, leve para o dia a dia — exemplo de produto.', 'passeios', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/carrinho-leve', null, 'BRL', 1299.00, 'media', true, true),
  ('p05b', 'l23', 'Carrinho de passeio compacto (exemplo)', 'Modelo compacto, ideal para viagens — exemplo de produto (opção alternativa).', 'passeios', 'BR', 'Loja Exemplo 2', 'https://www.exemplo.com/produtos/carrinho-compacto', null, 'BRL', 1899.00, 'baixa', true, true),
  ('p06', 'l19', 'Kit mamadeiras anticólica (exemplo)', 'Kit com 3 mamadeiras de tamanhos variados — exemplo de produto.', 'alimentacao', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/kit-mamadeiras', null, 'BRL', 149.90, 'baixa', true, true),
  ('p08', null, 'Travesseiro para gestante (exemplo)', 'Travesseiro de corpo inteiro para apoio durante a gestação — exemplo de produto.', 'geral', 'BR', 'Loja Exemplo', 'https://www.exemplo.com/produtos/travesseiro-gestante', null, 'BRL', 199.90, 'baixa', true, true)
on conflict (id) do nothing;

insert into public.budget_categories (id, name, icon) values
  ('b01', 'Enxoval e roupas', '👕'),
  ('b02', 'Quarto e móveis', '🛏️'),
  ('b03', 'Passeio e transporte', '🚗'),
  ('b04', 'Maternidade', '🏥'),
  ('b05', 'Documentos e taxas', '📄'),
  ('b06', 'Outros', '💡')
on conflict (id) do nothing;
