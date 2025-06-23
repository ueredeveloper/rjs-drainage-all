/**
 * Cria o conteúdo interativo do InfoWindow para a shape desenhada,
 * contendo controles de cor, opacidade e cálculo de área.
 */
export function ElemDrawInfoWindow(shape) {
  // Obtém estilos atuais da shape (borda, preenchimento, opacidade)
  const strokeColor = shape.draw?.get('strokeColor') || '#ff0000';
  const fillColor = shape.draw?.get('fillColor') || '#ffff00';
  const fillOpacity = shape.draw?.get('fillOpacity') ?? 0.35;
  const calculoAreaAtivo = false;

  // Contêiner principal do conteúdo do InfoWindow
  const container = document.createElement('div');
  container.className = 'info-content';
  container.style.cssText = 'font-family: Arial, sans-serif; font-size: 12px; width: 280px;';

  // === Seção de opções de personalização ===
  const fieldsetOptions = document.createElement('fieldset');
  fieldsetOptions.style.cssText = 'border-radius: 10px; padding: 10px; border: 1px solid #ccc;';

  const legendOptions = document.createElement('legend');
  legendOptions.textContent = 'Opções de personalização';
  legendOptions.style.cssText = 'font-weight: bold; font-size: 14px;';
  fieldsetOptions.appendChild(legendOptions);

  const colorsContainer = document.createElement('div');
  colorsContainer.style.cssText = 'display: flex; gap: 20px;';

  // Cria dois seletores de cor (borda e preenchimento)
  colorsContainer.appendChild(createColorPicker('Borda', 'borderColors', strokeColor));
  colorsContainer.appendChild(createColorPicker('Preenchimento', 'fillColors', fillColor));
  fieldsetOptions.appendChild(colorsContainer);

  // === Controle de opacidade ===
  const opacityDiv = document.createElement('div');
  opacityDiv.style.marginTop = '10px';

  const opacityLabel = document.createElement('label');
  opacityLabel.textContent = 'Opacidade do preenchimento:';
  opacityLabel.style.cssText = 'font-weight: bold; font-size: 12px;';
  opacityLabel.setAttribute('for', 'opacitySlider');

  // Slider de opacidade
  const opacitySlider = document.createElement('input');
  opacitySlider.type = 'range';
  opacitySlider.id = 'opacitySlider';
  opacitySlider.min = '0';
  opacitySlider.max = '1';
  opacitySlider.step = '0.01';
  opacitySlider.value = fillOpacity;
  opacitySlider.style.cssText = 'width: 100%; cursor: pointer;';

  opacityDiv.appendChild(opacityLabel);
  opacityDiv.appendChild(opacitySlider);
  fieldsetOptions.appendChild(opacityDiv);

  // === Seção de informações adicionais ===
  const fieldsetInfo = document.createElement('fieldset');
  fieldsetInfo.style.cssText = 'border-radius: 10px; padding: 10px; margin-top: 10px; border: 1px solid #ccc;';

  const legendInfo = document.createElement('legend');
  legendInfo.textContent = 'Info';
  legendInfo.style.cssText = 'font-weight: bold; font-size: 14px;';
  fieldsetInfo.appendChild(legendInfo);

  // Switch para cálculo de área
  const areaContainer = document.createElement('span');
  areaContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';

  const labelSwitch = document.createElement('label');
  labelSwitch.className = 'switch';

  const inputSwitch = document.createElement('input');
  inputSwitch.type = 'checkbox';
  inputSwitch.id = 'calcularArea';
  if (calculoAreaAtivo) inputSwitch.checked = true;

  const sliderSpan = document.createElement('span');
  sliderSpan.className = 'slider';

  labelSwitch.appendChild(inputSwitch);
  labelSwitch.appendChild(sliderSpan);

  areaContainer.appendChild(labelSwitch);
  areaContainer.append('Cálculo de área');

  // Lista de informações como outorgas associadas
  const outorgaList = document.createElement('ul');
  outorgaList.id = 'outorga-container';
  outorgaList.style.cssText = 'margin-top: 10px; max-height: 120px; overflow-y: auto; padding-left: 20px; font-size: 11px; color: #333;';

  fieldsetInfo.appendChild(areaContainer);
  fieldsetInfo.appendChild(outorgaList);

  // Monta o container final
  container.appendChild(fieldsetOptions);
  container.appendChild(fieldsetInfo);

  return container;
}

/**
 * Cria um campo de seleção de cor com botões interativos.
 */
function createColorPicker(title, id, selectedColor) {
  const fieldset = document.createElement('fieldset');
  fieldset.style.cssText = 'border-radius: 10px; border: 1px solid #ccc; padding: 5px;';

  const legend = document.createElement('legend');
  legend.textContent = title;
  legend.style.cssText = 'font-size: 12px; font-weight: bold;';
  fieldset.appendChild(legend);

  const colorDiv = document.createElement('div');
  colorDiv.id = id;
  colorDiv.style.cssText = 'display: flex; gap: 5px;';

  const colors = ['#FF0000', '#FFFF00', '#0000FF', '#000000'];

  // Cria os botões de cor circulares
  colors.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-button' + (color === selectedColor ? ' selected' : '');
    btn.dataset.color = color;
    btn.style.cssText = `
      background-color: ${color}; 
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      border: 1px solid #555; 
      cursor: pointer;
    `;
    colorDiv.appendChild(btn);
  });

  fieldset.appendChild(colorDiv);
  return fieldset;
}

/**
 * Conecta os controles HTML com as propriedades da shape desenhada,
 * permitindo interação dinâmica com o mapa.
 */
export function attachDrawInfoListeners(shape, setOverlays) {
  const container = document.querySelector('.info-content');
  if (!container) return;

  // === Borda ===
  const borderButtons = container.querySelectorAll('#borderColors .color-button');
  borderButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.dataset.color;
      shape.draw.setOptions({ strokeColor: color }); // Aplica nova cor
      borderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Preenchimento ===
  const fillButtons = container.querySelectorAll('#fillColors .color-button');
  fillButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.dataset.color;
      shape.draw.setOptions({ fillColor: color });
      fillButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Opacidade ===
  const opacitySlider = container.querySelector('#opacitySlider');
  if (opacitySlider) {
    opacitySlider.oninput = () => {
      const opacity = parseFloat(opacitySlider.value);
      shape.draw.setOptions({ fillOpacity: opacity });
    };
  }

  // === Cálculo de área ===
  const calcularAreaCheckbox = container.querySelector('#calcularArea');
  if (calcularAreaCheckbox) {
    calcularAreaCheckbox.onchange = () => {
      if (typeof setOverlays === 'function') {
        setOverlays(prev => ({
          ...prev,
          shapes: prev.shapes.map(s =>
            s.id === shape.id
              ? { ...s, calculoAreaAtivo: calcularAreaCheckbox.checked }
              : s
          )
        }));
      }
    };
  }
}
