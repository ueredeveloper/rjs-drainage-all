import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ElemWaterUsage from "./ElemWaterUsage";
import MapControllers from "./MapControllers";
import { Box } from "@mui/material";

const ElemMapOverlayControls = ({ map, position, isFullscreen, isWaterAvailable, checkboxes, setCheckboxes }) => {

  const controlContainerRef = useRef(null);

  // Cria o container do controle apenas uma vez
  if (!controlContainerRef.current) {
    controlContainerRef.current = document.createElement("div");
    // Adiciona a classe para aplicar o espaçamento inferior do CSS
    controlContainerRef.current.className = "popup-container";
  }

  useEffect(() => {
    // Se não houver mapa, não faz nada
    if (!map || !controlContainerRef.current) {
      return;
    }

    const controlDiv = controlContainerRef.current;
    const controlPosition = window.google.maps.ControlPosition[position];
    // Adiciona nosso div aos controles do mapa. A API do Google Maps gerenciará sua posição.
    map.controls[controlPosition].push(controlDiv);

    // Função de limpeza para remover o controle quando o componente for desmontado
    return () => {
      const controls = map.controls[controlPosition];

      const index = controls.getArray().indexOf(controlDiv);
      if (index > -1) {
        controls.removeAt(index);
      }
    };
  }, [map]);

  // Faz o botão de camadas ir mais para a direito que em tela cheia
  useEffect(() => {

    if (isFullscreen) {
      controlContainerRef.current.style.width = '75%';
    } else {
      controlContainerRef.current.style.width = '70%';
    }

  }, [isFullscreen])

  // Usa um portal para renderizar o componente do gráfico dentro do div de controle
  return createPortal(
    <Box>
      <ElemWaterUsage isFullscreen={isFullscreen} isWaterAvailable={isWaterAvailable} />
      <MapControllers checkboxes={checkboxes} setCheckboxes={setCheckboxes} />
    </Box>, controlContainerRef.current);
};

export default ElemMapOverlayControls;
