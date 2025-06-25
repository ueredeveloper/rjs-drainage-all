/**
 * Conecta os controles HTML do InfoWindow com as propriedades da shape desenhada,
 * permitindo interação dinâmica com o mapa.
 *
 * @param {Object} shape - Objeto da shape desenhada (polígono, círculo, etc).
 * @param {Function} setOverlays - Função para atualizar o estado global das shapes.
 * @param {HTMLElement} container - Elemento DOM do InfoWindow onde estão os controles.
 */
export function ElemDrawInfoWindow (shape, setOverlays, container) {
  // === Borda ===
  /**
   * Seleciona todos os botões de cor da borda e adiciona eventos de clique.
   * Ao clicar, altera a cor da borda da shape e destaca o botão selecionado.
   */
  const borderButtons = container.querySelectorAll('#borderColors .color-button');
  borderButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.dataset.color;
      // Atualiza a cor da borda da shape
      shape.draw.setOptions({ strokeColor: color });
      // Remove seleção de todos os botões e destaca o atual
      borderButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Preenchimento ===
  /**
   * Seleciona todos os botões de cor de preenchimento e adiciona eventos de clique.
   * Ao clicar, altera a cor de preenchimento da shape e destaca o botão selecionado.
   */
  const fillButtons = container.querySelectorAll('#fillColors .color-button');
  fillButtons.forEach(btn => {
    btn.onclick = () => {
      const color = btn.dataset.color;
      // Atualiza a cor de preenchimento da shape
      shape.draw.setOptions({ fillColor: color });
      // Remove seleção de todos os botões e destaca o atual
      fillButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
  });

  // === Opacidade ===
  /**
   * Seleciona o slider de opacidade e adiciona evento de alteração.
   * Ao alterar, ajusta a opacidade do preenchimento da shape.
   */
  const opacitySlider = container.querySelector('#opacitySlider');
  if (opacitySlider) {
    opacitySlider.oninput = () => {
      const opacity = parseFloat(opacitySlider.value);
      // Atualiza a opacidade do preenchimento da shape
      shape.draw.setOptions({ fillOpacity: opacity });
    };
  }

  // === Cálculo de área ===
  /**
   * Seleciona o checkbox de cálculo de área e adiciona evento de alteração.
   * Ao alterar, atualiza o estado global para ativar/desativar o popup de cálculo de área.
   */
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
