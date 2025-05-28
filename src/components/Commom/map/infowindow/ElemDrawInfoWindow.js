// src/components/Commom/map/infowindow/ElemDrawInfoWindow.js

/**
 * Gera o conteúdo HTML do InfoWindow com base nas propriedades da shape fornecida.
 * Permite configurar cor da borda, preenchimento, opacidade e ativar/desativar cálculo de área.
 *
 * @param {google.maps.Polygon|google.maps.Rectangle|google.maps.Circle|google.maps.Polyline} shape - A forma desenhada no mapa (shape) cujas propriedades serão utilizadas.
 * @returns {string} HTML a ser inserido no InfoWindow.
 */
export function getDrawInfoWindowHtmlWithState(shape) {
  // Use shape.draw para acessar métodos do Google Maps
  const strokeColor = shape.draw?.get('strokeColor') || '#ff0000';
  const fillColor = shape.draw?.get('fillColor') || '#ffff00';
  const fillOpacity = shape.draw?.get('fillOpacity') ?? 0.35;
  // Sempre inicia desmarcado
  const calculoAreaAtivo = false;

  return `
    <div class="info-content" style="font-family: Arial, sans-serif; font-size: 12px; width: 280px;">
      <fieldset style="border-radius: 10px; padding: 10px; border: 1px solid #ccc;">
        <legend style="font-weight: bold; font-size: 14px;">Opções de personalização</legend>
        <div style="display: flex; gap: 20px;">
          <fieldset style="border-radius: 10px; border: 1px solid #ccc; padding: 5px;">
            <legend style="font-size: 12px; font-weight: bold;">Borda</legend>
            <div id="borderColors" style="display: flex; gap: 5px;">
              ${['#FF0000', '#FFFF00', '#0000FF', '#000000'].map(c =>
    `<button class="color-button${strokeColor === c ? ' selected' : ''}" data-color="${c}" 
                  style="background-color: ${c}; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #555; cursor: pointer;"></button>`
  ).join('')}
            </div>
          </fieldset>
          <fieldset style="border-radius: 10px; border: 1px solid #ccc; padding: 5px;">
            <legend style="font-size: 12px; font-weight: bold;">Preenchimento</legend>
            <div id="fillColors" style="display: flex; gap: 5px;">
              ${['#FF0000', '#FFFF00', '#0000FF', '#000000'].map(c =>
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
        <span style="display: flex; align-items: center; gap: 8px;">
          <label class="switch">
            <input type="checkbox" id="calcularArea" ${calculoAreaAtivo ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          Cálculo de área
        </span>
        <ul id="outorga-container" style="margin-top: 10px; max-height: 120px; overflow-y: auto; padding-left: 20px; font-size: 11px; color: #333;"></ul>
      </fieldset>
    </div>
  `;
}

/**
 * Adiciona os listeners aos elementos da interface de InfoWindow,
 * permitindo ao usuário modificar dinamicamente as propriedades da shape desenhada.
 *
 * @param {google.maps.Polygon|google.maps.Rectangle|google.maps.Circle|google.maps.Polyline} shape - A forma desenhada no mapa a ser manipulada.
 * @param {Function} setOverlays - Função para atualizar o estado dos overlays.
 */
export function attachDrawInfoListeners(shape, setOverlays) {
  const container = document.querySelector('.info-content');
  if (!container) return;

  // === Listeners para cor da borda ===
  const borderButtons = container.querySelectorAll('#borderColors .color-button');
  borderButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.getAttribute('data-color');
      shape.draw.setOptions({ strokeColor: color });
      borderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Listeners para cor de preenchimento ===
  const fillButtons = container.querySelectorAll('#fillColors .color-button');
  fillButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.getAttribute('data-color');
      shape.draw.setOptions({ fillColor: color });
      fillButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Listener para controle de opacidade ===
  const opacitySlider = container.querySelector('#opacitySlider');
  if (opacitySlider) {
    opacitySlider.oninput = () => {
      const opacity = parseFloat(opacitySlider.value);
      shape.draw.setOptions({ fillOpacity: opacity });
    };
  }

  // === Listener para checkbox de cálculo de área ===
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