import { useState, useEffect } from "react";
import "./InfoWindowContent.css";

const cores = ["#FF0000", "#FFFF00", "#0000FF", "#000000"];

const InfoWindowContent = ({ shape, setOverlays }) => {
  const [strokeColor, setStrokeColor] = useState(
    shape?.draw?.strokeColor || "#FF0000"
  );
  const [fillColor, setFillColor] = useState(
    shape?.draw?.fillColor || "#FFFF00"
  );
  const [fillOpacity, setFillOpacity] = useState(
    shape?.draw?.fillOpacity ?? 0.35
  );
  const [calculoAreaAtivo, setCalculoAreaAtivo] = useState(
    shape?.calculoAreaAtivo ?? false
  );

  // Atualiza a shape no mapa sempre que alguma propriedade muda
  useEffect(() => {
    if (shape?.draw?.setOptions) {
      shape.draw.setOptions({
        strokeColor,
        fillColor,
        fillOpacity,
      });
    }
  }, [strokeColor, fillColor, fillOpacity]);

  // Atualiza estado global de cálculo de área
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
