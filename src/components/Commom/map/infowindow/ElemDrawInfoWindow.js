// src/components/Commom/map/infowindow/ElemDrawInfoWindow.js

export function getDrawInfoWindowHtmlWithState(shape) {
  // Obtém propriedades atuais da shape para inicializar controles
  const strokeColor = shape.get('strokeColor') || '#ff0000';
  const fillColor = shape.get('fillColor') || '#ffff00';
  const fillOpacity = shape.get('fillOpacity') ?? 0.35;
  const calculoAreaAtivo = shape.calculoAreaAtivo ?? true;

  return `
    <div class="info-content" style="font-family: Arial, sans-serif; font-size: 12px; width: 280px;">
      <fieldset style="border-radius: 10px; padding: 10px; border: 1px solid #ccc;">
        <legend style="font-weight: bold; font-size: 14px;">Opções de personalização</legend>
        <div style="display: flex; gap: 20px;">
          <fieldset style="border-radius: 10px; border: 1px solid #ccc; padding: 5px;">
            <legend style="font-size: 12px; font-weight: bold;">Borda</legend>
            <div id="borderColors" style="display: flex; gap: 5px;">
              ${['#FF0000','#FFFF00','#0000FF','#000000'].map(c => 
                `<button class="color-button${strokeColor === c ? ' selected' : ''}" data-color="${c}" 
                  style="background-color: ${c}; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #555; cursor: pointer;"></button>`
              ).join('')}
            </div>
          </fieldset>
          <fieldset style="border-radius: 10px; border: 1px solid #ccc; padding: 5px;">
            <legend style="font-size: 12px; font-weight: bold;">Preenchimento</legend>
            <div id="fillColors" style="display: flex; gap: 5px;">
              ${['#FF0000','#FFFF00','#0000FF','#000000'].map(c => 
                `<button class="color-button${fillColor === c ? ' selected' : ''}" data-color="${c}" 
                  style="background-color: ${c}; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #555; cursor: pointer;"></button>`
              ).join('')}
            </div>
          </fieldset>
        </div>
        <div style="margin-top: 10px;">
          <label for="opacitySlider" style="font-weight: bold; font-size: 12px;">Opacidade do preenchimento:</label>
          <input type="range" id="opacitySlider" min="0" max="1" step="0.01" value="${fillOpacity}" style="width: 100%; cursor: pointer;">
        </div>
      </fieldset>

      <fieldset style="border-radius: 10px; padding: 10px; margin-top: 10px; border: 1px solid #ccc;">
        <legend style="font-weight: bold; font-size: 14px;">Info</legend>
        <label style="font-weight: bold; font-size: 12px; display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" id="calcularArea" ${calculoAreaAtivo ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
          Cálculo de área
        </label>
        <ul id="outorga-container" style="margin-top: 10px; max-height: 120px; overflow-y: auto; padding-left: 20px; font-size: 11px; color: #333;"></ul>
      </fieldset>
    </div>
  `;
}

// Função para adicionar os listeners e atualizar a shape com as interações no popup
export function attachDrawInfoListeners(shape) {
  const container = document.querySelector('.info-content');
  if (!container) return;

  // Bordas
  const borderButtons = container.querySelectorAll('#borderColors .color-button');
  borderButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.getAttribute('data-color');
      shape.setOptions({ strokeColor: color });
      borderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // Preenchimento
  const fillButtons = container.querySelectorAll('#fillColors .color-button');
  fillButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.getAttribute('data-color');
      shape.setOptions({ fillColor: color });
      fillButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // Opacidade
  const opacitySlider = container.querySelector('#opacitySlider');
  if (opacitySlider) {
    opacitySlider.oninput = () => {
      const opacity = parseFloat(opacitySlider.value);
      shape.setOptions({ fillOpacity: opacity });
    };
  }

  // Checkbox cálculo área
  const calcularAreaCheckbox = container.querySelector('#calcularArea');
  if (calcularAreaCheckbox) {
    calcularAreaCheckbox.onchange = () => {
      shape.calculoAreaAtivo = calcularAreaCheckbox.checked;
      // Aqui você pode disparar lógica para mostrar/esconder popup de cálculo de área, se tiver
      // Exemplo:
      if (window.showCalcAreaPopup) {
        if (shape.calculoAreaAtivo) window.showCalcAreaPopup(shape);
        else window.hideCalcAreaPopup && window.hideCalcAreaPopup();
      }
    };
  }
}
