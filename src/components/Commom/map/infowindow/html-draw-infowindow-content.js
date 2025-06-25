/**
 * Gera o conteúdo HTML do InfoWindow para shapes desenhadas, usando DOM.
 * Permite personalizar cor da borda, preenchimento, opacidade e ativar cálculo de área.
 *
 * @param {google.maps.Polygon|google.maps.Rectangle|google.maps.Circle|google.maps.Polyline} shape - Objeto shape do Google Maps.
 * @returns {HTMLElement} Elemento HTML pronto para ser usado no InfoWindow.
 */
const HTMLDrawInfoContent = (shape) => {
  /**
   * Cor da borda do shape.
   * @type {string}
   */
  const strokeColor = shape.draw?.get("strokeColor") || "#ff0000";
  /**
   * Cor do preenchimento do shape.
   * @type {string}
   */
  const fillColor = shape.draw?.get("fillColor") || "#ffff00";
  /**
   * Opacidade do preenchimento.
   * @type {number}
   */
  const fillOpacity = shape.draw?.get("fillOpacity") ?? 0.35;
  /**
   * Indica se o cálculo de área está ativo.
   * @type {boolean}
   */
  const calculoAreaAtivo = shape.calculoAreaAtivo ?? false;

  // Cria e injeta estilos CSS para o InfoWindow
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        #draw-container {
          width: 100%;
          max-width: vw;    /* Diminuiu a largura máxima */
          min-width: vw;    /* Diminuiu a largura mínima */
          font-family: Arial, sans-serif;
          font-size: 11px;     /* Fonte menor */
          box-sizing: border-box;
        }
        @media (max-width: 400px) {
          #draw-container {
            max-width: 96vw;
            min-width: 90px;
            font-size: 10px;
          }
          #draw-title {
            font-size: 12px;
            padding: 4px;
          }
          #draw-info fieldset {
            padding: 4px;
            border-radius: 8px;
          }
        }
        #draw-title {
          font-size: 13px;
          font-weight: bold;
          padding: 6px;
          color: #222;
          border-radius: 8px 8px 0 0;
        }
        #draw-overflow {
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 180px;   /* Menor altura máxima */
        }
        #draw-info fieldset {
          border-radius: 10px;
          border: 1px solid #ccc;
          padding: 6px;
          margin-bottom: 8px;
        }
        #draw-info legend {
          font-weight: bold;
          font-size: 12px;
        }
        .color-button.selected {
          outline: none;
          box-shadow: 0 0 4px 3px rgba(51, 0, 0, 0.51); /* Box shadow suave ao redor do botão selecionado */
        }
    `;
  document.head.appendChild(styleElement);

  // Container principal do InfoWindow
  const containerDiv = document.createElement("div");
  containerDiv.id = "draw-container";

  // Título do InfoWindow
  const titleDiv = document.createElement("div");
  titleDiv.id = "draw-title";
  titleDiv.textContent = "Opções de Personalização";

  // Div para conteúdo rolável
  const overflowDiv = document.createElement("div");
  overflowDiv.id = "draw-overflow";

  // Fieldset para seleção de cor da borda
  const fieldsetBorda = document.createElement("fieldset");
  fieldsetBorda.style.display = "inline-block";
  fieldsetBorda.style.marginRight = "10px";
  const legendBorda = document.createElement("legend");
  legendBorda.textContent = "Borda";
  legendBorda.style.fontSize = "12px";
  legendBorda.style.fontWeight = "bold";
  fieldsetBorda.appendChild(legendBorda);

  // Botões de cor para borda
  const borderColorsDiv = document.createElement("div");
  borderColorsDiv.id = "borderColors";
  borderColorsDiv.style.display = "flex";
  borderColorsDiv.style.gap = "5px";
  ["#FF0000", "#FFFF00", "#0000FF", "#000000"].forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "color-button" + (strokeColor === c ? " selected" : "");
    btn.dataset.color = c;
    btn.style.backgroundColor = c;
    btn.style.width = "20px";
    btn.style.height = "20px";
    btn.style.borderRadius = "50%";
    btn.style.border = "1px solid #555";
    btn.style.cursor = "pointer";
    borderColorsDiv.appendChild(btn);
  });
  fieldsetBorda.appendChild(borderColorsDiv);

  // Fieldset para seleção de cor de preenchimento
  const fieldsetPreenchimento = document.createElement("fieldset");
  fieldsetPreenchimento.style.display = "inline-block";
  const legendPreenchimento = document.createElement("legend");
  legendPreenchimento.textContent = "Preenchimento";
  legendPreenchimento.style.fontSize = "12px";
  legendPreenchimento.style.fontWeight = "bold";
  fieldsetPreenchimento.appendChild(legendPreenchimento);

  // Botões de cor para preenchimento
  const fillColorsDiv = document.createElement("div");
  fillColorsDiv.id = "fillColors";
  fillColorsDiv.style.display = "flex";
  fillColorsDiv.style.gap = "5px";
  ["#FF0000", "#FFFF00", "#0000FF", "#000000"].forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "color-button" + (fillColor === c ? " selected" : "");
    btn.dataset.color = c;
    btn.style.backgroundColor = c;
    btn.style.width = "20px";
    btn.style.height = "20px";
    btn.style.borderRadius = "50%";
    btn.style.border = "1px solid #555";
    btn.style.cursor = "pointer";
    fillColorsDiv.appendChild(btn);
  });
  fieldsetPreenchimento.appendChild(fillColorsDiv);

  // Controle de opacidade do preenchimento
  const opacityDiv = document.createElement("div");
  opacityDiv.style.marginTop = "10px";
  const opacityLabel = document.createElement("label");
  opacityLabel.textContent = "Opacidade do preenchimento:";
  opacityLabel.style.fontWeight = "bold";
  opacityLabel.style.fontSize = "12px";
  opacityLabel.setAttribute("for", "opacitySlider");
  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.id = "opacitySlider";
  opacitySlider.min = "0";
  opacitySlider.max = "1";
  opacitySlider.step = "0.01";
  opacitySlider.value = fillOpacity;
  opacitySlider.style.width = "100%";
  opacitySlider.style.cursor = "pointer";
  opacityDiv.appendChild(opacityLabel);
  opacityDiv.appendChild(opacitySlider);

  // Fieldset de informações adicionais
  const fieldsetInfo = document.createElement("fieldset");
  const legendInfo = document.createElement("legend");
  legendInfo.textContent = "Info";
  fieldsetInfo.appendChild(legendInfo);

  // Switch para ativar/desativar cálculo de área
  const spanSwitch = document.createElement("span");
  spanSwitch.style.display = "flex";
  spanSwitch.style.alignItems = "center";
  spanSwitch.style.gap = "8px";

  const labelSwitch = document.createElement("label");
  labelSwitch.className = "switch";
  const inputSwitch = document.createElement("input");
  inputSwitch.type = "checkbox";
  inputSwitch.id = "calcularArea";
  if (calculoAreaAtivo) inputSwitch.checked = false;
  const spanSlider = document.createElement("span");
  spanSlider.className = "slider";
  labelSwitch.appendChild(inputSwitch);
  labelSwitch.appendChild(spanSlider);

  spanSwitch.appendChild(labelSwitch);
  spanSwitch.appendChild(document.createTextNode("Cálculo de área"));
  fieldsetInfo.appendChild(spanSwitch);

  // Lista de outorga (inicialmente vazia)
  const ulOutorga = document.createElement("ul");
  ulOutorga.id = "outorga-container";
  ulOutorga.style.marginTop = "10px";
  ulOutorga.style.maxHeight = "120px";
  ulOutorga.style.overflowY = "auto";
  ulOutorga.style.paddingLeft = "20px";
  ulOutorga.style.fontSize = "11px";
  ulOutorga.style.color = "#333";
  fieldsetInfo.appendChild(ulOutorga);

  // Monta a estrutura do InfoWindow
  overflowDiv.appendChild(fieldsetBorda);
  overflowDiv.appendChild(fieldsetPreenchimento);
  overflowDiv.appendChild(opacityDiv);
  overflowDiv.appendChild(fieldsetInfo);
  containerDiv.appendChild(titleDiv);
  containerDiv.appendChild(overflowDiv);

  return containerDiv;
};

export default HTMLDrawInfoContent;
