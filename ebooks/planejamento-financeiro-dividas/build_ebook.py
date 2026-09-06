# -*- coding: utf-8 -*-
"""Gerador do ebook 'Fora das Dívidas' em PDF (reportlab)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, NextPageTemplate, PageBreak,
    Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas as canvas_mod
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fora-das-dividas.pdf")

# ── Paleta ──
NAVY = colors.HexColor("#122A3A")
NAVY_DARK = colors.HexColor("#0B1D28")
TEAL = colors.HexColor("#2A9D8F")
GOLD = colors.HexColor("#E9B44C")
INK = colors.HexColor("#232323")
GRAY = colors.HexColor("#5B6670")
LIGHT_BG = colors.HexColor("#F4F7F6")
RED_SOFT = colors.HexColor("#C1443A")

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

styles = getSampleStyleSheet()

def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.5, leading=15, textColor=INK, spaceAfter=8, alignment=TA_JUSTIFY)
    base.update(kw)
    return ParagraphStyle(name, **base)

S_BODY = style("body")
S_BODY_JUST = style("bodyj", alignment=TA_JUSTIFY)
S_H1 = style("h1", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=NAVY, spaceBefore=0, spaceAfter=14, alignment=TA_LEFT)
S_H1_NUM = style("h1num", fontName="Helvetica-Bold", fontSize=11, leading=13, textColor=TEAL, spaceAfter=2, alignment=TA_LEFT)
S_H2 = style("h2", fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=NAVY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT)
S_LEAD = style("lead", fontName="Helvetica-Oblique", fontSize=11.5, leading=16, textColor=GRAY, spaceAfter=14, alignment=TA_LEFT)
S_BULLET = style("bullet", fontSize=10.5, leading=15, textColor=INK, spaceAfter=4, alignment=TA_JUSTIFY)
S_QUOTE = style("quote", fontName="Helvetica-Oblique", fontSize=11, leading=16, textColor=NAVY_DARK, alignment=TA_LEFT, spaceAfter=8)
S_CAPTION = style("caption", fontSize=8.5, leading=11, textColor=GRAY, alignment=TA_LEFT)
S_TOC_ITEM = style("toc", fontName="Helvetica", fontSize=11.5, leading=22, textColor=NAVY_DARK)
S_TOC_NUM = style("tocnum", fontName="Helvetica-Bold", fontSize=11.5, leading=22, textColor=TEAL)
S_TAB_HEAD = style("tabhead", fontName="Helvetica-Bold", fontSize=9.5, leading=12, textColor=colors.white, alignment=TA_LEFT)
S_TAB_CELL = style("tabcell", fontSize=9.5, leading=12.5, textColor=INK, alignment=TA_LEFT)
S_TAB_CELL_B = style("tabcellb", fontName="Helvetica-Bold", fontSize=9.5, leading=12.5, textColor=NAVY, alignment=TA_LEFT)

# ── Elementos utilitários ──

def bullets(items, bullet_char="•", color_hex="#2A9D8F"):
    flow = []
    for it in items:
        flow.append(Paragraph(f'<font color="{color_hex}">{bullet_char}</font>&nbsp;&nbsp;{it}', S_BULLET))
    return flow

def box(title, body_items, fill=LIGHT_BG, border=TEAL, title_color=None):
    title_color = title_color or NAVY
    inner = [Paragraph(f'<b>{title}</b>', style("boxtitle", fontName="Helvetica-Bold", fontSize=11, textColor=title_color, spaceAfter=6))]
    for it in body_items:
        inner.append(Paragraph(it, style("boxbody", fontSize=9.8, leading=14, textColor=INK, spaceAfter=4)))
    t = Table([[inner]], colWidths=[PAGE_W - 2*MARGIN])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), fill),
        ("BOX", (0,0), (-1,-1), 1, border),
        ("LEFTPADDING", (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    return t

def data_table(headers, rows, col_widths=None):
    data = [[Paragraph(h, S_TAB_HEAD) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(c), S_TAB_CELL) for c in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#D8DEDC")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    return t

def checklist(items):
    data = []
    for it in items:
        box_cell = Table([[""]], colWidths=[9], rowHeights=[9])
        box_cell.setStyle(TableStyle([
            ("BOX", (0,0), (-1,-1), 1.1, TEAL),
        ]))
        data.append([box_cell, Paragraph(it, S_BODY)])
    t = Table(data, colWidths=[18, PAGE_W - 2*MARGIN - 18])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
    ]))
    return t

def chapter_header(num, title, lead):
    flow = []
    flow.append(Paragraph(f"CAPÍTULO {num}" if num else "", S_H1_NUM))
    flow.append(Paragraph(title, S_H1))
    flow.append(HRFlowable(width="100%", thickness=1.3, color=GOLD, spaceAfter=10))
    if lead:
        flow.append(Paragraph(lead, S_LEAD))
    return flow

# ── Page templates ──

def cover_page(c, doc):
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # faixa dourada
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H*0.62, PAGE_W, 4, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, PAGE_H*0.62 - 4, PAGE_W, 2, fill=1, stroke=0)
    # kicker
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(GOLD)
    c.drawCentredString(PAGE_W/2, PAGE_H*0.74, "GUIA PRÁTICO DE PLANEJAMENTO FINANCEIRO")
    # título
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(colors.white)
    c.drawCentredString(PAGE_W/2, PAGE_H*0.67, "FORA DAS")
    c.drawCentredString(PAGE_W/2, PAGE_H*0.67 - 46, "DÍVIDAS")
    # subtítulo
    c.setFont("Helvetica", 13)
    c.setFillColor(colors.HexColor("#CBD8D4"))
    c.drawCentredString(PAGE_W/2, PAGE_H*0.55, "O passo a passo para organizar suas finanças,")
    c.drawCentredString(PAGE_W/2, PAGE_H*0.55 - 16, "negociar dívidas e recuperar sua liberdade")
    # rodapé
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#8FA3AE"))
    c.drawCentredString(PAGE_W/2, MARGIN + 6, "ebook · edição digital")
    c.restoreState()

def toc_bg(c, doc):
    c.saveState()
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 26*mm, PAGE_W, 26*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, PAGE_H - 17*mm, "Sumário")
    c.restoreState()

def chapter_bg(c, doc):
    c.saveState()
    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # barra lateral fina
    c.setFillColor(TEAL)
    c.rect(0, 0, 4, PAGE_H, fill=1, stroke=0)
    # rodapé
    c.setFont("Helvetica", 8.5)
    c.setFillColor(GRAY)
    c.drawString(MARGIN, 10*mm, "Fora das Dívidas — Guia Prático de Planejamento Financeiro")
    c.drawRightString(PAGE_W - MARGIN, 10*mm, f"{doc.page}")
    c.restoreState()

def make_doc():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                           leftMargin=MARGIN, rightMargin=MARGIN,
                           topMargin=MARGIN, bottomMargin=MARGIN)
    full_frame = Frame(0, 0, PAGE_W, PAGE_H, id="full", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    toc_frame = Frame(MARGIN, MARGIN, PAGE_W - 2*MARGIN, PAGE_H - 26*mm - MARGIN - 10*mm, id="toc")
    chap_frame = Frame(MARGIN, MARGIN + 6*mm, PAGE_W - 2*MARGIN, PAGE_H - 2*MARGIN - 6*mm, id="chap")

    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[full_frame], onPage=cover_page),
        PageTemplate(id="TOC", frames=[toc_frame], onPage=toc_bg),
        PageTemplate(id="Chapter", frames=[chap_frame], onPage=chapter_bg),
    ])
    return doc

def toc_row(num, title, page):
    return Table([[Paragraph(num, S_TOC_NUM), Paragraph(title, S_TOC_ITEM), Paragraph(str(page), S_TOC_NUM)]],
                 colWidths=[16*mm, PAGE_W - 2*MARGIN - 16*mm - 12*mm, 12*mm])

story = []

# ══ CAPA ══
story.append(Spacer(1, 1))  # placeholder content for cover frame (onPage draws everything)
story.append(NextPageTemplate("TOC"))
story.append(PageBreak())

# ══ SUMÁRIO ══
toc_items = [
    ("01", "Por que caímos na armadilha das dívidas"),
    ("02", "Diagnóstico: o raio-x da sua vida financeira"),
    ("03", "O método dos três baldes para organizar o orçamento"),
    ("04", "Bola de neve ou avalanche: qual estratégia usar"),
    ("05", "Como negociar suas dívidas (com scripts prontos)"),
    ("06", "As armadilhas que prendem você no endividamento"),
    ("07", "Cortando gastos e gerando renda extra em 30 dias"),
    ("08", "Fundo de emergência: o escudo contra novas dívidas"),
    ("09", "Hábitos financeiros que sustentam a liberdade"),
    ("10", "Seu plano de ação: 30-60-90 dias"),
]
tbl = []
for num, title in toc_items:
    tbl.append([Paragraph(num, S_TOC_NUM), Paragraph(title, S_TOC_ITEM)])
sum_table = Table(tbl, colWidths=[16*mm, PAGE_W - 2*MARGIN - 16*mm])
sum_table.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("LINEBELOW", (0,0), (-1,-2), 0.4, colors.HexColor("#E2E8E6")),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
]))
story.append(Spacer(1, 10*mm))
story.append(sum_table)
story.append(Spacer(1, 14*mm))
story.append(Paragraph(
    'Este material tem caráter educativo e não substitui a orientação de um profissional de '
    'educação financeira ou advogado especializado em direito do consumidor para casos específicos.',
    style("disclaimer", fontSize=9, leading=13, textColor=GRAY, alignment=TA_LEFT)
))

story.append(NextPageTemplate("Chapter"))
story.append(PageBreak())

# ══ CAPÍTULO 1 ══
story += chapter_header("01", "Por que caímos na armadilha das dívidas",
    "Antes de qualquer planilha ou negociação, entenda o que te trouxe até aqui — sem culpa, com clareza.")
story.append(Paragraph(
    "Se você está lendo este ebook, provavelmente já sentiu aquele aperto no peito ao ver a fatura do cartão "
    "chegando, ou já perdeu uma noite de sono tentando decidir qual conta pagar primeiro. Você não está sozinho: "
    "o endividamento é hoje uma das maiores fontes de ansiedade financeira das famílias brasileiras, atingindo "
    "pessoas de todas as rendas e idades.", S_BODY_JUST))
story.append(Paragraph(
    "A primeira coisa que precisa ficar clara é: dívida não é um problema de caráter, é um problema de "
    "planejamento, informação e, muitas vezes, de emergências que pegaram você sem reserva financeira. "
    "Culpar-se não paga nenhuma conta — organizar-se, sim.", S_BODY_JUST))
story.append(Paragraph("As três causas mais comuns", S_H2))
story += bullets([
    "<b>Gastos maiores que a renda</b> — o padrão de vida cresce junto com pequenos aumentos de salário, mas os compromissos financeiros crescem mais rápido ainda.",
    "<b>Emergências sem reserva</b> — um problema de saúde, o conserto do carro ou a perda de renda obrigam a recorrer ao cartão ou ao cheque especial.",
    "<b>Falta de visão do todo</b> — muitas pessoas endividadas nunca somaram todas as dívidas em um único lugar; cada conta é vista isoladamente, o que impede enxergar o tamanho real do problema.",
])
story.append(Spacer(1, 4))
story.append(box("Reflexão rápida", [
    "Pegue um papel agora e responda, sem se julgar: qual foi o gatilho da sua primeira dívida que saiu do controle? "
    "Entender a origem ajuda a evitar repetir o padrão depois que você sair dela.",
]))
story.append(PageBreak())

# ══ CAPÍTULO 2 ══
story += chapter_header("02", "Diagnóstico: o raio-x da sua vida financeira",
    "Você não consegue resolver o que não consegue ver. O primeiro passo é colocar tudo na mesa.")
story.append(Paragraph(
    "Muita gente evita olhar para as dívidas porque tem medo do que vai encontrar. Mas o alívio real só vem depois "
    "do diagnóstico — é quando o problema deixa de ser um monstro indefinido e vira uma lista de números que podem "
    "ser trabalhados um a um.", S_BODY_JUST))
story.append(Paragraph("Monte sua planilha de dívidas", S_H2))
story.append(Paragraph(
    "Liste absolutamente todas as suas dívidas — cartão de crédito, cheque especial, empréstimo pessoal, "
    "financiamentos, parcelamentos de loja, dívidas com familiares. Para cada uma, anote:", S_BODY_JUST))
story += bullets([
    "Nome do credor",
    "Valor total devido hoje",
    "Taxa de juros mensal (ou o valor da parcela, se não souber a taxa)",
    "Valor da parcela mensal mínima",
    "Data de vencimento",
])
story.append(Spacer(1,6))
story.append(data_table(
    ["Credor", "Valor devido", "Juros a.m.", "Parcela mín.", "Vencimento"],
    [
        ["Cartão de crédito", "R$ 3.200", "12,5%", "R$ 320", "Dia 10"],
        ["Cheque especial", "R$ 1.100", "9,8%", "—", "Renovação mensal"],
        ["Empréstimo pessoal", "R$ 4.500", "3,2%", "R$ 380", "Dia 5"],
    ],
    col_widths=[42*mm, 30*mm, 25*mm, 28*mm, 30*mm]
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Depois de listar tudo, some o total devido e o total de parcelas mensais mínimas. Compare esse número com "
    "sua renda líquida mensal. Esse é o seu ponto de partida real — e a partir de agora ele só vai melhorar.",
    S_BODY_JUST))
story.append(box("Sinal de alerta", [
    "Se a soma das parcelas mínimas de dívidas ultrapassa 30% da sua renda líquida, o comprometimento já está em "
    "nível crítico e a prioridade número um é buscar renegociação antes de qualquer outro passo deste guia."
], fill=colors.HexColor("#FBEDEA"), border=RED_SOFT, title_color=RED_SOFT))
story.append(PageBreak())

# ══ CAPÍTULO 3 ══
story += chapter_header("03", "O método dos três baldes para organizar o orçamento",
    "Um orçamento simples de manter é mais poderoso que uma planilha perfeita que você abandona na segunda semana.")
story.append(Paragraph(
    "Divida toda a sua renda líquida mensal em três grandes baldes. A proporção exata varia conforme sua situação, "
    "mas comece pela referência abaixo e ajuste à sua realidade:", S_BODY_JUST))
story.append(data_table(
    ["Balde", "O que inclui", "Referência"],
    [
        ["Essencial", "Moradia, alimentação, contas de casa, transporte, saúde", "50-60%"],
        ["Dívidas", "Todas as parcelas e negociações em andamento", "20-30%"],
        ["Estilo de vida e reserva", "Lazer, poupança, fundo de emergência, metas", "10-20%"],
    ],
    col_widths=[35*mm, 85*mm, 35*mm]
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Se o balde de dívidas está maior que 30%, isso confirma que negociação (capítulo 5) precisa vir antes de "
    "qualquer corte de gastos — não adianta cortar o cafezinho se a parcela do empréstimo já consome metade do "
    "salário.", S_BODY_JUST))
story.append(Paragraph("Regras simples para não sair do trilho", S_H2))
story += bullets([
    "Separe a renda em contas ou &quot;potes&quot; diferentes (mesmo que seja o mesmo banco, com etiquetas) assim que ela entra.",
    "Registre todo gasto por 30 dias, mesmo os pequenos — é aí que mora o vazamento que ninguém percebe.",
    "Revise o orçamento toda semana, não só no fim do mês: pequenos ajustes semanais evitam o rombo mensal.",
])
story.append(PageBreak())

# ══ CAPÍTULO 4 ══
story += chapter_header("04", "Bola de neve ou avalanche: qual estratégia usar",
    "Duas táticas comprovadas para pagar múltiplas dívidas — escolha a que combina com seu perfil.")
story.append(data_table(
    ["Método", "Como funciona", "Melhor para"],
    [
        ["Bola de neve", "Pague o mínimo em todas as dívidas e concentre o dinheiro extra na menor dívida primeiro. Ao quitá-la, use o valor liberado na próxima menor.", "Quem precisa de vitórias rápidas para manter a motivação"],
        ["Avalanche", "Pague o mínimo em todas e concentre o extra na dívida de maior taxa de juros primeiro.", "Quem quer economizar o máximo possível em juros no total"],
    ],
    col_widths=[28*mm, 92*mm, 35*mm]
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Na prática, a bola de neve costuma vencer no campo emocional: ver uma dívida sumir da lista gera uma sensação "
    "de progresso que sustenta a disciplina nos meses seguintes. Já a avalanche é matematicamente mais eficiente. "
    "Se você tem uma dívida com juros muito acima das demais (cartão rotativo, por exemplo), considere um híbrido: "
    "ataque primeiro a de juros mais alto usando a lógica da avalanche, e depois siga pela ordem de menor valor.",
    S_BODY_JUST))
story.append(box("Exemplo prático", [
    "Dívidas: Cartão R$ 3.200 (12,5% a.m.), Empréstimo R$ 4.500 (3,2% a.m.), Loja R$ 600 (5% a.m.).<br/>"
    "<b>Avalanche:</b> Cartão → Loja → Empréstimo.<br/>"
    "<b>Bola de neve:</b> Loja → Cartão → Empréstimo.<br/>"
    "Neste caso as duas coincidem em atacar o cartão logo no início — ele reúne maior juro e não é o maior valor."
]))
story.append(PageBreak())

# ══ CAPÍTULO 5 ══
story += chapter_header("05", "Como negociar suas dívidas (com scripts prontos)",
    "A maioria das pessoas paga mais do que precisaria simplesmente por não negociar. Negociar é normal — bancos e lojas esperam por isso.")
story.append(Paragraph("Antes de ligar", S_H2))
story += bullets([
    "Tenha em mãos o valor total da dívida, quanto você pode pagar à vista e quanto consegue pagar por mês.",
    "Pesquise se existe mutirão de renegociação (ex.: campanhas de órgãos de defesa do consumidor ou do próprio credor).",
    "Decida seu limite antes de ligar — é mais fácil negociar com a cabeça fria do que no meio da conversa.",
])
story.append(Paragraph("Script para negociar por telefone ou chat", S_H2))
story.append(box("O que dizer", [
    "&quot;Olá, eu quero regularizar minha dívida, mas hoje não consigo pagar o valor total. "
    "Consigo pagar R$ [valor] à vista com desconto, ou parcelar em até [nº] vezes de R$ [valor]. "
    "Qual a melhor condição que vocês têm disponível para isso?&quot;",
]))
story += bullets([
    "Peça sempre o desconto para pagamento à vista — em muitos casos passa de 50%.",
    "Se recusarem, pergunte educadamente: &quot;existe alguma condição especial ou campanha ativa no momento?&quot;",
    "Peça o acordo por escrito (e-mail, aplicativo ou carta) antes de pagar qualquer valor.",
    "Guarde o comprovante de pagamento e o comprovante da baixa da dívida depois de quitada.",
])
story.append(Paragraph("Seus direitos como consumidor", S_H2))
story.append(Paragraph(
    "Você tem direito a receber informações claras sobre o valor total da dívida, juros aplicados e condições de "
    "quitação. Cobranças vexatórias, ameaças ou contato em horários e locais inadequados são proibidos pelo Código "
    "de Defesa do Consumidor — você pode e deve denunciar esse tipo de abordagem aos órgãos competentes.",
    S_BODY_JUST))
story.append(PageBreak())

# ══ CAPÍTULO 6 ══
story += chapter_header("06", "As armadilhas que prendem você no endividamento",
    "Algumas &quot;soluções&quot; parecem alívio imediato, mas aprofundam o buraco.")
story.append(data_table(
    ["Armadilha", "Por que é perigosa"],
    [
        ["Pagar só o mínimo do cartão", "Os juros do rotativo estão entre os mais altos do mercado; o saldo devedor pode dobrar em poucos meses."],
        ["Cheque especial como &quot;reserva&quot;", "Foi feito para emergências pontuais, não para uso contínuo — os juros diários se acumulam rapidamente."],
        ["Pegar um empréstimo para pagar outro sem comparar", "Pode trocar uma dívida cara por outra ainda mais cara se as taxas e prazos não forem comparados com atenção."],
        ["Cartões consignados e &quot;dinheiro fácil&quot; por telefone/SMS", "Alvo comum de golpes e taxas abusivas embutidas em contratos pouco claros."],
        ["Ignorar boletos e cartas de cobrança", "O valor só cresce com juros e multa, e pode evoluir para negativação e ações judiciais."],
    ],
    col_widths=[55*mm, 100*mm]
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Regra de ouro: todo novo crédito só deve ser considerado se a taxa de juros for menor que a da dívida que ele "
    "substitui, e se você já tiver um plano de pagamento fechado — nunca &quot;para respirar mais um mês&quot;.",
    S_BODY_JUST))
story.append(PageBreak())

# ══ CAPÍTULO 7 ══
story += chapter_header("07", "Cortando gastos e gerando renda extra em 30 dias",
    "Duas alavancas que, juntas, aceleram qualquer plano de quitação de dívidas.")
story.append(Paragraph("Corte primeiro o que dói menos", S_H2))
story += bullets([
    "Assinaturas e serviços que você esqueceu de cancelar (streamings, aplicativos, academias não usadas).",
    "Renegociação de planos fixos: internet, celular e seguros — ligue e peça um plano mais barato, a maioria das operadoras cede.",
    "Compras por impulso: crie a regra das 48 horas — espere dois dias antes de qualquer compra não essencial.",
    "Delivery e alimentação fora de casa: reduzir de 5x para 2x por semana já libera um valor relevante no fim do mês.",
])
story.append(Paragraph("Fontes rápidas de renda extra", S_H2))
story += bullets([
    "Venda de itens parados em casa (roupas, eletrônicos, móveis) em aplicativos de venda local.",
    "Freelas na sua área de trabalho, mesmo que poucas horas por semana.",
    "Serviços pontuais: aulas particulares, artesanato, entregas, cuidados com pets.",
    "Uso de saldo acumulado em programas de pontos/milhas ou de cashback esquecido.",
])
story.append(box("Meta do mês", [
    "Escolha 3 cortes de gastos e 1 fonte de renda extra desta lista. Direcione 100% do valor liberado para a "
    "dívida prioritária definida no capítulo 4. Pequenas ações somadas criam o primeiro grande resultado visível."
]))
story.append(PageBreak())

# ══ CAPÍTULO 8 ══
story += chapter_header("08", "Fundo de emergência: o escudo contra novas dívidas",
    "Sem reserva, qualquer imprevisto te empurra de volta para o cartão ou o cheque especial.")
story.append(Paragraph(
    "Um fundo de emergência é o dinheiro guardado, de fácil acesso, destinado exclusivamente a imprevistos: "
    "problemas de saúde, conserto urgente, perda de renda. Ele não é investimento de rendimento alto — é "
    "proteção. Por isso deve ficar em uma aplicação de liquidez diária (poupança ou fundo/CDB com resgate imediato).",
    S_BODY_JUST))
story.append(Paragraph("Construindo em etapas", S_H2))
story.append(data_table(
    ["Etapa", "Meta", "Enquanto ainda há dívidas caras"],
    [
        ["1", "R$ 500 - R$ 1.000", "Comece com um valor pequeno, mesmo pagando dívidas — evita recorrer a novo crédito em imprevistos simples."],
        ["2", "1 mês de despesas essenciais", "Reforce depois que as dívidas de juros altos (cartão, cheque especial) estiverem quitadas."],
        ["3", "3 a 6 meses de despesas essenciais", "Meta final, construída already livre de dívidas caras, com aportes mensais automáticos."],
    ],
    col_widths=[15*mm, 45*mm, 95*mm]
))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Automatize um valor fixo, por menor que seja, para essa reserva assim que a renda entrar — antes mesmo de "
    "pensar no restante do orçamento. O hábito importa mais que o valor no início.",
    S_BODY_JUST))
story.append(PageBreak())

# ══ CAPÍTULO 9 ══
story += chapter_header("09", "Hábitos financeiros que sustentam a liberdade",
    "Sair da dívida é uma conquista; não voltar para ela é uma questão de hábito.")
story += bullets([
    "<b>Revise seu orçamento semanalmente</b> — 10 minutos toda semana evitam o rombo do fim do mês.",
    "<b>Separe necessidade de desejo</b> — antes de comprar, pergunte: isso resolve um problema real ou é impulso do momento?",
    "<b>Use o cartão de crédito com uma regra clara</b> — só gaste o que já está disponível à vista, e pague a fatura integral todo mês.",
    "<b>Celebre marcos</b> — cada dívida quitada merece ser reconhecida, isso reforça o comportamento novo.",
    "<b>Eduque-se continuamente</b> — livros, podcasts e cursos gratuitos sobre finanças pessoais mantêm você atualizado e motivado.",
    "<b>Revise metas a cada trimestre</b> — sua vida muda, seu plano financeiro também deve se ajustar.",
])
story.append(box("Mentalidade", [
    "Liberdade financeira não é nunca mais sentir vontade de comprar algo — é ter escolha. "
    "É poder dizer não a uma dívida nova porque você já tem um plano que está funcionando."
]))
story.append(PageBreak())

# ══ CAPÍTULO 10 ══
story += chapter_header("10", "Seu plano de ação: 30-60-90 dias",
    "Tudo que você leu até aqui, transformado em ações concretas com prazo.")
story.append(Paragraph("Primeiros 30 dias — Diagnóstico e organização", S_H2))
story.append(checklist([
    "Listar todas as dívidas em uma planilha (capítulo 2)",
    "Calcular o total devido e o comprometimento mensal da renda",
    "Montar o orçamento nos três baldes (capítulo 3)",
    "Escolher a estratégia: bola de neve, avalanche ou híbrida (capítulo 4)",
    "Abrir uma conta separada (ou etiqueta) para o fundo de emergência",
]))
story.append(Paragraph("Dias 31 a 60 — Negociação e corte de gastos", S_H2))
story.append(checklist([
    "Negociar as 2 dívidas mais caras usando os scripts do capítulo 5",
    "Cortar ao menos 3 gastos supérfluos identificados no capítulo 7",
    "Iniciar 1 fonte de renda extra",
    "Depositar o primeiro valor no fundo de emergência",
]))
story.append(Paragraph("Dias 61 a 90 — Consolidação e novos hábitos", S_H2))
story.append(checklist([
    "Renegociar as dívidas restantes",
    "Automatizar a revisão semanal do orçamento",
    "Definir a meta de fundo de emergência (1 mês de despesas)",
    "Revisar o progresso total e ajustar o plano para os próximos 90 dias",
]))
story.append(Spacer(1, 10))
story.append(Paragraph(
    "Guarde este ebook e volte a ele sempre que precisar recalcular a rota. Sair das dívidas não é um evento único, "
    "é um processo — e agora você tem o mapa para percorrê-lo.", S_LEAD))

doc = make_doc()
doc.build(story)
print("PDF gerado em:", OUT)
