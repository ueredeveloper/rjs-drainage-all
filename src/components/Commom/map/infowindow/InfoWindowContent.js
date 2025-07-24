import { useState, useEffect } from "react";
import "./InfoWindowContent.css";


/**
 * Lista de cores disponíveis para seleção de borda e preenchimento.
 * @type {string[]}
 */
const cores = ["#FF0000", "#FFFF00", "#0000FF", "#000000"];

/**
 * Componente de conteúdo da InfoWindow para personalização de shapes no mapa.
 *
 * Permite ao usuário alterar a cor da borda, cor do preenchimento, opacidade do preenchimento
 * e ativar/desativar o cálculo de área de uma shape desenhada no mapa.
 *
 * @param {Object} props
 * @param {Object} props.shape - Objeto da shape desenhada, contendo propriedades de estilo e controle.
 * @param {Function} props.setOverlays - Função para atualizar o estado global das shapes no mapa.
 * @returns {JSX.Element}
 */
const InfoWindowContent = ({ shape, setOverlays }) => {
  /**
   * Estado para cor da borda da shape.
   * @type {[string, Function]}
   */
  const [strokeColor, setStrokeColor] = useState(
    shape?.draw?.strokeColor || "#FF0000"
  );
  /**
   * Estado para cor do preenchimento da shape.
   * @type {[string, Function]}
   */
  const [fillColor, setFillColor] = useState(
    shape?.draw?.fillColor || "#FFFF00"
  );
  /**
   * Estado para opacidade do preenchimento da shape.
   * @type {[number, Function]}
   */
  const [fillOpacity, setFillOpacity] = useState(
    shape?.draw?.fillOpacity ?? 0.35
  );
  /**
   * Estado para ativação do cálculo de área.
   * @type {[boolean, Function]}
   */
  const [calculoAreaAtivo, setCalculoAreaAtivo] = useState(
    shape?.calculoAreaAtivo ?? false
  );

  /**
   * Atualiza as opções de estilo da shape no mapa sempre que cor ou opacidade mudam.
   */
  useEffect(() => {
    if (shape?.draw?.setOptions) {
      shape.draw.setOptions({
        strokeColor,
        fillColor,
        fillOpacity,
      });
    }
  }, [strokeColor, fillColor, fillOpacity]);

  /**
   * Atualiza o estado global de cálculo de área da shape.
   */
  useEffect(() => {
    if (typeof setOverlays === "function") {
      setOverlays((prev) => ({
        ...prev,
        shapes: prev.shapes.map((s) =>
          s.id === shape.id ? { ...s, calculoAreaAtivo } : s
        ),
      }));
    }
  }, [calculoAreaAtivo]);

  return (
    <div id="draw-container">
      <div id="draw-title">Opções de Personalização</div>
      <div id="draw-overflow">
        <div id="draw-row">
          <fieldset>
            <legend>Borda</legend>
            <div className="color-options">
              {cores.map((cor) => (
                <button
                  key={cor}
                  className={`color-button ${
                    strokeColor === cor ? "selected" : ""
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => setStrokeColor(cor)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Preenchimento</legend>
            <div className="color-options">
              {cores.map((cor) => (
                <button
                  key={cor}
                  className={`color-button ${
                    fillColor === cor ? "selected" : ""
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => setFillColor(cor)}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="opacity-control">
          <label htmlFor="opacitySlider">Opacidade do preenchimento:</label>
          <input
            id="opacitySlider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={fillOpacity}
            onChange={(e) => setFillOpacity(parseFloat(e.target.value))}
          />
        </div>

        <fieldset>
          <legend>Info</legend>
          <label>
            <input
              type="checkbox"
              checked={calculoAreaAtivo}
              onChange={() => setCalculoAreaAtivo((prev) => !prev)}
            />
            Cálculo de área
          </label>
        </fieldset>
      </div>
    </div>
  );
};

export default InfoWindowContent;
