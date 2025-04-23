/**
 * Componente para entrada e manipulação de coordenadas.
 * @returns {JSX.Element} O elemento React que representa o componente.
 */
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { CircularProgress, Fade, FormControl, FormLabel, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import { findAllPointsInASubsystem, findAllPointsInCircle } from "../../services/geolocation";
import { useData } from "../../hooks/analyse-hooks";
import CircleRadiusSelector from "./CircleRadiusSelector";
import WellTypeSelector from "./Subterranean/WellTypeSelector";
import { analyzeAvailability } from "../../tools";
import AlertCommon from "./AlertCommon";


/**
 * Componente que permite a busca de outorgas a partir de coordenadas geográficas informadas pelo usuário.
 * Exibe inputs para latitude e longitude e realiza a busca por pontos próximos ou análise por subsistema.
 * Inclui também feedback visual por meio de um alerta em caso de coordenadas inválidas.
 * 
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {number} props.value - Define o tipo de busca: 0 para raio, 1 para subsistema.
 * @returns {JSX.Element} Elemento JSX que representa o componente SearchCoords.
 */


function SearchCoords({ value }) {

  const [loading, setLoading] = useState(false); // Estado de carregamento da busca
  const { marker, setMarker, setOverlays, radius, setHgAnalyse } = useData(); // Hook para estado global
  const [position, setPosition] = useState(marker); // Estado local da posição (lat/lng)

  // Estados para o controle do alerta
  const [openAlert, setOpenAlert] = useState(false); // Visibilidade do alerta
  const [alertMessage, setAlertMessage] = useState(""); // Mensagem do alerta

  // Atualiza o estado local quando o marcador global muda
  useEffect(() => {
    setPosition(marker);
  }, [marker]);

  // Fecha o alerta automaticamente após 4 segundos
  useEffect(() => {
    if (openAlert) {
      const timer = setTimeout(() => {
        setOpenAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [openAlert]);

  /**
   * Função executada ao clicar no botão de busca.
   * Valida as coordenadas, realiza a busca com base no tipo de pesquisa (por raio ou subsistema),
   * atualiza os marcadores e formas no mapa e ativa análises hidrológicas.
   * 
   * @async
   * @returns {Promise<void>}
   */
  async function handleOnClick() {
    const lat = parseFloat(position.int_latitude);
    const lng = parseFloat(position.int_longitude);

    // Validação das coordenadas
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setAlertMessage("Coordenadas inválidas. Verifique a latitude e longitude.");
      setOpenAlert(true);
      return;
    }

    setLoading(true);

    // Atualiza o marcador global
    setMarker(prev => ({
      ...prev,
      int_latitude: position.int_latitude,
      int_longitude: position.int_longitude
    }));

    // Busca por pontos próximos no raio especificado
    if (value === 0) {
      let markers = await findAllPointsInCircle({
        center: { lng: position.int_longitude, lat: position.int_latitude },
        radius: parseInt(radius)
      });

      // Cria uma forma de círculo com os marcadores encontrados
      let shape = {
        id: Date.now(),
        type: "circle",
        position: { lat: position.int_latitude, lng: position.int_longitude },
        map: null,
        draw: null,
        markers: markers,
        radius: radius,
        area: null
      };

      setOverlays(prev => ({
        ...prev,
        shapes: [...prev.shapes, shape]
      }));
    }

    // Busca por subsistema
    else if (value === 1) {
      let { tp_id, int_latitude, int_longitude } = marker;

      await findAllPointsInASubsystem(tp_id, int_latitude, int_longitude).then(markers => {
        let hidrogeoInfo = markers.hidrogeo[0].info;

        let subterraneanMarkers = [
          {
            int_latitude: position.int_latitude,
            int_longitude: position.int_longitude,
            dt_demanda: { demandas: [], vol_anual_ma: 5000000.4585 }
          },
          ...markers.subterranea
        ];

        // Realiza análise de disponibilidade hídrica
        let hgAnalyse = analyzeAvailability(hidrogeoInfo, subterraneanMarkers);
        setHgAnalyse(hgAnalyse);

        // Cria uma forma de polígono com os marcadores encontrados
        let shape = {
          id: Date.now(),
          type: "polygon",
          position: { lat: position.int_latitude, lng: position.int_longitude },
          map: null,
          draw: null,
          markers: markers,
          radius: radius,
          area: null
        };

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));
      });
    }

    setLoading(false);
  }

  /**
   * Atualiza os valores da posição quando o usuário altera os campos de input.
   * Substitui vírgulas por pontos para permitir formatos decimais diferentes.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento do input.
   */
  function handleOnTextFieldChange(event) {
    let { name, value } = event.target;

    // Remove tudo que não for número, ponto, vírgula ou hífen
    value = value.replace(/[^0-9.,-]/g, "");

    // Garante que o hífen fique só no início (caso seja negativo)
    if (value.includes("-")) {
      value = "-" + value.replace(/-/g, "");
    }

    // Substitui vírgula por ponto
    value = value.replace(",", ".");

    // Permite apenas um ponto
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join(""); // remove pontos extras
    }

    // Limita para no máximo 12 caracteres
    value = value.slice(0, 12);


    // Atualiza estado
    setPosition(prev => ({
      ...prev,
      [name]: value.trim()
    }));

  }

  /**
   * Chama a função `handleOnClick` através da tecla enter.
   *
   * @param {KeyboardEvent} event - O evento de teclado disparado.
   */
  function handlekeydown(event) {
    const { key } = event;
    if (key === "Enter") {
      event.preventDefault(); // evita que a pagina recarregue ao pressionar Enter
      handleOnClick();
    }
  }


  return (
    <>


      {/* Componente de alerta exibido quando necessário */}
      <AlertCommon openAlert={openAlert} alertMessage={alertMessage} setOpen={setOpenAlert} />

      <FormControl style={{ display: "flex", flexDirection: "column" }}>
        <FormLabel sx={{ my: 1 }}>Coordenadas</FormLabel>
        <Paper elevation={3} sx={{ margin: 0 }}>
          <Box sx={{ display: "flex", flexFlow: "row wrap" }}>
            {/* Campos de entrada de latitude e longitude */}
            <Box sx={{ display: "flex", flex: 4, flexDirection: "row" }}>
              <TextField
                onKeyDown={handlekeydown}
                sx={{ my: 1, mx: 1, minWidth: "3rem", flex: 1 }}
                label="Latitude"
                color="secondary"
                name="int_latitude"
                value={position.int_latitude}
                onChange={handleOnTextFieldChange}
                size="small"
              />
              <TextField
                onKeyDown={handlekeydown}
                sx={{ my: 1, mx: 1, minWidth: "3rem", flex: 1 }}
                color="secondary"
                label="Longitude"
                name="int_longitude"
                value={position.int_longitude}
                onChange={handleOnTextFieldChange}
                size="small"
              />
            </Box>

            {/* Renderiza o seletor de raio ou tipo de poço, dependendo do valor */}
            {value === 0 ? (
              <Box sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                <CircleRadiusSelector />
              </Box>
            ) : value === 1 ? (
              <Box sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                <WellTypeSelector />
              </Box>
            ) : null}

            {/* Botões de busca e cópia */}
            <Box sx={{ minWidth: 100 }}>
              {loading ? (
                <Fade
                  sx={{ color: "secondary.main" }}
                  in={loading}
                  style={{ transitionDelay: loading ? "800ms" : "0ms" }}
                  unmountOnExit
                >
                  <CircularProgress size={25} />
                </Fade>
              ) : (
                <IconButton
                  color="secondary"
                  size="large"
                  onClick={() => {
                    handleOnClick().then(() => setLoading(false));
                  }}
                >
                  <SearchIcon />
                </IconButton>
              )}
              <IconButton color="secondary" size="large">
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </FormControl>
    </>
  );
}

export default SearchCoords;
