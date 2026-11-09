# Componentes de interface — Prisma

O [programa](index.html), o [catálogo interativo](ui-components.html) e o [mockup](liquid-glass-mockup.html) usam o mesmo sistema visual. O visual é flat, com Arimo local, transparência discreta e sombras apenas em superfícies flutuantes. A integração mapeia os controles existentes para os tokens de cor, tipografia, espaçamento, botões, campos e gráficos, preservando os módulos e eventos da aplicação. Não há etapa de build. As funções principais do app ficam numa faixa horizontal sem barra visível; roda do mouse, touch e teclado navegam entre elas, com fades nas extremidades e som de catraca discreto durante a rolagem.

## Arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `assets/ui/ui.css` | Entrada CSS pública; importa a biblioteca e define utilitários de fundo/padding |
| `assets/ui/tokens.css` | Fonte, cores, backgrounds, padding, raios e gráficos |
| `assets/ui/base.css` | Base e acessibilidade |
| `assets/ui/components.css` | Aparência dos componentes e estados |
| `assets/ui/components.js` | Menus próprios para os seletores do app, seleção segmentada, slider, switch, diálogo e toast |
| `assets/ui/charts.js` | Cores ordenadas, estilos por série e adaptador Plotly |
| `assets/ui/app-integration.css` | Integração dos tokens e componentes com o layout existente do programa |
| `assets/ui/icons.svg` | Sprite de ícones SVG |
| `assets/ui/catalog.css`, `catalog.js` | Composição e exemplos do catálogo |
| `assets/mockup/mockup.css`, `mockup.js` | Layout e estado específicos da tela de análise |

```html
<link rel="stylesheet" href="assets/ui/ui.css">
<script src="assets/ui/components.js" defer></script>
<script src="assets/ui/charts.js" defer></script>
```

Todas as classes públicas usam `sc-`; modificadores usam `--`, partes internas usam `__`, e comportamentos declarativos usam `data-sc-*`. Evite definir cores ou padding por elemento. Inclua `ui.css` antes do CSS específico da página. Para HTML inserido depois do carregamento, execute `SCUI.init(container)`; a inicialização é idempotente.

## Botões

| Código | Uso |
| --- | --- |
| `.sc-button.sc-button--primary` | Ação principal: aplicar, analisar, confirmar |
| `.sc-button.sc-button--secondary` | Alternativa: restaurar, exportar, cancelar |
| `.sc-button.sc-button--tertiary` | Ação discreta: detalhes, ajuda |
| `sc-button--icon` | Botão de ícone; combinar com um dos níveis e fornecer `aria-label` |
| `sc-button--danger` | Ação destrutiva; combinar com secundário ou terciário |

```html
<button class="sc-button sc-button--primary" type="submit">Aplicar</button>
<button class="sc-button sc-button--secondary" type="button">Restaurar</button>
<button class="sc-button sc-button--tertiary" type="button">Ver detalhes</button>
```

Use `disabled` para indisponibilidade nativa e `aria-busy="true"` durante processamento. Botões de ação dentro de um formulário precisam de `type="button"` para não enviar o formulário. A altura é 36 px no desktop e 44 px no celular. Ações principais usam o token `--sc-accent`; a cor da série de um gráfico tem um token independente.

Botões, campos de texto e superfícies de dropdown compartilham `--sc-radius-field` (8 px). Painéis e diálogos usam o raio maior `--sc-radius-panel`.

## Fundos e padding

| Nível | Classe | Uso |
| --- | --- | --- |
| Primário | `sc-bg-primary` | Conteúdo principal, tabelas e área dos gráficos |
| Secundário | `sc-bg-secondary` | Inspetores, configurações e painéis |
| Terciário | `sc-bg-tertiary` | Agrupamentos internos e áreas de apoio |
| Translúcido | `sc-surface--translucent` | Navegação ou barra de comandos; sem blur |

Escala única: `--sc-space-0` a `--sc-space-9` correspondem a **0, 4, 8, 12, 16, 20, 24, 32, 40, 48 px**. Os utilitários `.sc-p-0` a `.sc-p-9` seguem a mesma sequência. Não confundir o índice com o valor em pixels.

| Padrão | Classe | Desktop | Até 700 px |
| --- | --- | --- | --- |
| Controle | `sc-pad-control` | 8 px vertical / 12 px horizontal | Mesmo padding, altura mínima de 44 px |
| Painel | `sc-pad-panel` | 24 px | 16 px |
| Seção | `sc-pad-section` | 32 px | 20 px |

```html
<section class="sc-bg-secondary sc-pad-panel">…</section>
```

Os componentes já aplicam seus paddings; os utilitários servem para compor superfícies e layouts. `sc-panel` tem padding e borda; use `sc-bg-*` para mudar seu papel de superfície.

## Campos, checkbox e radio

- `sc-field`, `sc-label`, `sc-help`, `sc-error`: agrupamento, rótulo, ajuda e erro.
- `sc-input` e `sc-textarea`: campos nativos; seletores visuais usam `sc-dropdown` e `sc-menu`.
- `sc-check-label`, `sc-checkbox`, `sc-radio`: seleções nativas que preservam formulário, teclado e validação.
- `sc-fieldset`: grupo sem decoração, com `legend` obrigatório quando houver várias opções relacionadas.

```html
<div class="sc-field">
  <label class="sc-label" for="diameter">Diâmetro (mm)</label>
  <input class="sc-input" id="diameter" type="number" step="0.001"
         aria-describedby="diameterHelp">
  <p class="sc-help" id="diameterHelp">Unidade: milímetro.</p>
</div>
<label class="sc-check-label">
  <input class="sc-checkbox" type="checkbox" name="showLimits" checked>
  Mostrar limites
</label>
```

Erros precisam de `aria-invalid="true"` e `aria-describedby` apontando para a mensagem. O exemplo do catálogo mostra o estado `indeterminate` de checkbox, definido pela propriedade JavaScript. Não substitua rótulos por placeholders.

## Listbox e dropdown

Listboxes, unidades e menus de escolha usam sempre controles visuais próprios. O listbox abaixo permite múltipla seleção com setas, Home/End e Espaço; dropdown simples usa botão mais popup `role="listbox"`. Assim as opções não herdam o menu nativo do sistema operacional. Se um select HTML for necessário para submissão de formulário, use-o apenas como modelo interno invisível e sincronize o seu valor com o controle visível.

```html
<button class="sc-button sc-button--secondary sc-dropdown"
        data-sc-popover="sampleMenu" data-sc-value-target="sampleValue"
        aria-haspopup="listbox" aria-label="Selecionar amostra">
  <span id="sampleValue">Lote 024</span>
</button>
<div class="sc-menu" id="sampleMenu" popover role="listbox"
     aria-label="Amostras" data-sc-select>
  <button class="sc-menu__item" type="button" role="option"
          data-value="024" aria-selected="true">Lote 024</button>
  <button class="sc-menu__item" type="button" role="option"
          data-value="025" aria-selected="false">Lote 025</button>
</div>
```

Cada popup tem um único botão de abertura e ID exclusivo. `aria-expanded` e posição são mantidos pelo controlador. Setas, Home/End, busca por texto, Enter/Espaço e Escape funcionam; Escape restaura o foco. Clique fora fecha o popup. `data-sc-select` atualiza `aria-selected`, o rótulo e emite `sc:select` no botão com `{ value, label }`. Sem esse atributo, a aplicação controla o estado da seleção — como no mockup.

Para ações, use `role="menu"` no popup e `role="menuitem"` em cada botão. `menuitemradio` e `menuitemcheckbox` exigem que a aplicação mantenha `aria-checked`. Use `disabled` em opções indisponíveis. O suporte depende de navegadores modernos com Popover API.

## Segmented, switch e slider

```html
<div class="sc-segmented" data-sc-segmented role="group" aria-label="Visualização">
  <span class="sc-selection-indicator" aria-hidden="true"></span>
  <button type="button" data-value="histogram" aria-pressed="true">Distribuição</button>
  <button type="button" data-value="sequence" aria-pressed="false">Sequência</button>
</div>
<button class="sc-switch" type="button" role="switch" aria-label="Ajuste normal"
        aria-checked="true" data-sc-switch></button>
<label class="sc-label" for="confidence">Confiança</label>
<input class="sc-slider" id="confidence" type="range" min="80" max="99.9"
       step="0.1" value="95" data-sc-slider data-sc-output="confidenceValue" data-sc-unit="%">
<output id="confidenceValue" for="confidence">95%</output>
```

O segmented emite `sc:change` com `{ value }`; o switch emite `sc:change` com `{ checked }`. O slider mantém o evento nativo `input`, atualiza preenchimento e output; para mudanças programáticas, execute `SCUI.updateSlider(element)`. Ofereça entrada numérica quando o valor exigir precisão. O catálogo sincroniza um slider e seu campo numérico. Navegação lateral usa `sc-nav`; a aplicação mantém `aria-current="page"` e chama `SCUI.refreshSelections()` após atualizar seu estado.

## Outros componentes

| Objeto | Código / comportamento |
| --- | --- |
| Painel | `sc-panel` |
| Separador | `<hr class="sc-divider">` |
| Badge | `sc-badge` |
| Alerta | `sc-alert` + `sc-alert--success`, `--warning` ou `--danger`; todos mantêm borda neutra, sem barra lateral colorida |
| Progresso | `<progress class="sc-progress" value="60" max="100">60%</progress>` |
| Tabela | `sc-table` dentro de `sc-table-scroll`; números alinhados à direita |
| Modal | `<dialog class="sc-dialog" aria-labelledby="…">`; abertura com `data-sc-dialog-open="id"`, fechamento com `data-sc-dialog-close` |
| Mensagem temporária | `SCUI.toast('Parâmetros salvos')`; conteúdo tratado como texto, com `role="status"` |
| Ícone | `<svg class="sc-icon" aria-hidden="true"><use href="assets/ui/icons.svg#i-export"/></svg>` |

O diálogo nativo fornece foco modal, Escape e restauração de foco. Use nomes acessíveis e IDs exclusivos. A biblioteca não injeta markup de negócio nem altera dados estatísticos.

## Gráficos: cor, geometria e ordem

A ordem é estável por **identidade da série**, nunca por posição após filtrar ou ordenar dados. Os mesmos IDs devem conservar o mesmo índice em todos os gráficos. Não reutilize a cor de sucesso/erro para uma série com esse significado implícito.

| Série | Claro | Escuro | Marcador |
| --- | --- | --- | --- |
| 1 | `#1462d7` | `#95baff` | Círculo |
| 2 | `#168575` | `#72cbbb` | Quadrado |
| 3 | `#8458b5` | `#bc9be8` | Losango |
| 4 | `#b36a20` | `#e7b16d` | Triângulo para cima |
| 5 | `#b84270` | `#ef94b6` | Cruz |
| 6 | `#237f9c` | `#76c2dc` | X |
| 7 | `#6e7830` | `#b8c47b` | Triângulo para baixo |
| 8 | `#776351` | `#c6b299` | Estrela |

Após oito séries, o adaptador repete a paleta com outro tracejado: contínuo, traço, ponto, traço e ponto. Evite exibir muitas séries juntas; use filtros ou pequenos múltiplos. Marcadores, legendas e rótulos precisam distinguir séries além da cor.

| Papel | Token | Valor |
| --- | --- | --- |
| Dados | `--sc-chart-line-data` | 2 px |
| Ajuste | `--sc-chart-line-fit` | 2,5 px |
| Referência e média | `--sc-chart-line-reference` | 1,25 px |
| Grade | `--sc-chart-line-grid` | 1 px |
| Borda da barra | `--sc-chart-line-bar` | 0,75 px |
| Ênfase | `--sc-chart-line-emphasis` | 3 px |
| Marcador | `--sc-chart-marker-size` | 5 px de diâmetro |
| Referência | `--sc-chart-dash-reference` | 5 / 4 px |
| Média | `--sc-chart-dash-mean` | 2 / 4 px |

Referências de especificação usam `--sc-warning` e tracejado, média usa texto neutro e pontilhado, grade usa borda neutra. O histograma utiliza preenchimento suave derivado da série 1. Mantenha a área de dados sólida, com fonte Arimo e unidades explícitas. Na exportação, resolva os tokens em cores e espessuras concretas, como faz o mockup.

```js
// Chamar novamente depois de mudar o tema; os valores vêm dos tokens atuais.
const layout = SCCharts.plotlyLayout({ xaxis: { title: 'Diâmetro (mm)' } });
const trace = { x, y, mode: 'lines+markers', ...SCCharts.plotlyTrace(0) };
// Adaptador não exige Plotly instalado; apenas produz os objetos de configuração.
const { color, width, dash, symbol, size } = SCCharts.series(0);
// SVG: marcador com a mesma forma, tamanho e cor da série.
svg.append(SCCharts.svgMarker(0, 120, 80));
```

SVG usa `.sc-chart` e classes `grid-line`, `bar`, `fit-line`, `spec-line`, `mean-line`, `sequence`, `point`, `spec-text`. Plotly usa `SCCharts.plotlyLayout()` e `SCCharts.plotlyTrace(index)`. A validação estatística e a geração dos dados permanecem no módulo da análise.
