/**
 * Componente para entrada e manipulação de coordenadas.
 * @returns {JSX.Element} O elemento React que representa o componente.
 */
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { CircularProgress, Fade, FormControl, FormLabel, TextField, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import { findAllPointsInCircle, findPointsInASystem } from "../../services/geolocation";
import { useData } from "../../hooks/analyse-hooks";
import CircleRadiusSelector from "./CircleRadiusSelector";
import WellTypeSelector from "./Subterranean/WellTypeSelector";
import { analyzeAvailability, converterPostgresToGmaps, getMarkersInsideOttoBasins, searchHydrograficUnit } from "../../tools";
import AlertCommon from "./AlertCommon";
import { initialsStates } from "../../initials-states";
import ElemGrant from '../Connection/elem-grant';
import { fetchShape, fetchMarkersByUH, fetchOttoBasins } from "../../services/shapes";
import { calculateQOutorgadaSecao, calculateQIndividualSecao, calculateQOutorgavelSecao, calculateQReferenciaSecao, calculateQDisponivelSecao, calculateQOutorgadaUH, calculateQReferenciaUH, calculateQRemanescenteUH, calculateQOutorgavelUH, calculateQDisponivelUH, calculateQSolicitadaMenorQDisponivel, calculateQSolicitadaMenorQIndividual } from "../../tools/surface-tools";



/**
 * Componente que permite a busca de outorgas a partir de coordenadas geográficas informadas pelo usuário.
 * Exibe inputs para latitude e longitude e realiza a busca por pontos próximos ou análise por subsistema.
 * Inclui também feedback visual por meio de um alerta em caso de coordenadas inválidas.
 * 
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {number} props.tabNumber - Define o tipo de busca pela tab selecionada: 0 para raio, 1 para subsistema.
 * @returns {JSX.Element} Elemento JSX que representa o componente SearchCoords.
 */
function SearchCoords({ tabNumber }) {

  const [loading, setLoading] = useState(false); // Estado de carregamento da busca
  const {
    map, marker, setMarker, overlays, setOverlays,
    radius, setHgAnalyse, subsystem, setSubsystem,
    setOttoBasins,
    surfaceAnalyse, setSurfaceAnalyse,
    shapesFetched, setShapesFetched } = useData(); // Hook para estado global
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

    // Se selecionado a tab geral, de buscas gerais por camadas ou dados do banco de dados com cpf, nome etc...
    if (tabNumber === 0) {
      
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
        draw: { area: subsystem.area },
        markers: markers,
        radius: radius,
        area: null
      };

      setOverlays(prev => ({
        ...prev,
        shapes: [...prev.shapes, shape]
      }));
    }
    // Set selecionado a tab subterrânea
    else if (tabNumber === 1) {

      // limpa o mapa

      overlays.shapes.forEach(shape => {
        if (shape.draw != undefined && shape.draw.area !== undefined) shape?.draw?.setMap(null)
      });
      setOverlays(initialsStates.overlays);


      let { tp_id, int_latitude, int_longitude } = marker;

      await findPointsInASystem(tp_id, int_latitude, int_longitude).then(markers => {

        let hidrogeoInfo = markers._hg_info;

        // Cria um primeiro marcador com dados vazios, pois não foi buscado usuário específico
        let _markers = [
          {
            id: 0,
            tp_id: tp_id,
            ti_id: 2,
            int_latitude: lat,
            int_longitude: lng,
            dt_demanda: { demandas: [] }
          },
          ...markers._points || []
        ];

        // Realiza análise de disponibilidade hídrica.
        let hgAnalyse = analyzeAvailability(hidrogeoInfo, _markers);

        setHgAnalyse(hgAnalyse)

        // Preenche subsistema com dados dos usuários etc.
        setSubsystem((prev) => ({
          ...prev,
          markers: _markers,
          hg_shape: markers._hg_shape,
          hg_info: markers._hg_info,
          hg_analyse: hgAnalyse,
        }));


        let coordinates = { shape: { coordinates: converterPostgresToGmaps({ shape: markers._hg_shape }) } }

        let shape = {
          id: Date.now(),
          type: 'polygon',
          position: null,
          map: map,
          draw: new window.google.maps.Polygon({
            paths: coordinates.shape.coordinates,
            strokeColor: 'red',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: 'red',
            fillOpacity: 0.35,
            map: map
          }),
          markers: {
            subterranea: _markers,
            superficial: null,
            barragem: null,
            lancamento_efluentes: null,
            lancamento_pluviais: null
          },
          area: null
        };

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, shape]
        }));

      });


    }
    // Se selecionado a tab superficial 
    else if (tabNumber === 2) {

      // Limpa os mapa de camadas, marcadores etc.
      overlays.shapes.forEach(shape => {
        if (shape.draw != undefined && shape.draw.area !== undefined) shape?.draw?.setMap(null)

      });
      setOverlays(initialsStates.overlays)

      // Unidade Hidrográfica necessária para a busca de ottoBasins
      let shapeName = "unidades_hidrograficas";
      // Pesquisa a shape da unidade hidrofráfica, se já existente na renderização e assim buscar em qual unidade hidrográfica está a coordenada
      let _shape = shapesFetched.find(sf => sf.name === shapeName);

      // Se os polígonso das unidades ainda não estiverem sido buscados
      if (shapesFetched.length === 0 || _shape === undefined) {

        _shape = await fetchShape(shapeName).then(__shape => {
          // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
          return __shape.map(sh => {
            return { ...sh, shapeName: shapeName, shape: { coordinates: converterPostgresToGmaps(sh) } }
          })
        });

        // Busca ottobacias a partir das coordenadas (lat, lng)
        let ottoBasins = await fetchOttoBasins(lat, lng);

        setOttoBasins(ottoBasins.ottoBasinsToGmaps);

 

        // Número da UH (uh_codigo, nas shape de otto bacias: uh_rotulo)
        let uhRotulo = ottoBasins.ottoBasins[0].attributes.uh_rotulo;

        let uhGrants = await fetchMarkersByUH(uhRotulo);

        let sectionGrants = await getMarkersInsideOttoBasins(ottoBasins.ottoBasinsToGmaps, uhGrants, map)

        let hydrographicBasin = await searchHydrograficUnit(fetchShape, shapesFetched, setShapesFetched, uhRotulo)

        let ottoBasinArea = ottoBasins.ottoBasinsToGmaps.area;

        let q_outorgada_secao = calculateQOutorgadaSecao(sectionGrants);
        let q_referencia_secao = calculateQReferenciaSecao(hydrographicBasin, ottoBasinArea);
        let q_outorgavel_secao = calculateQOutorgavelSecao(q_referencia_secao);
        // verificarum hook para o percentual desta função, no caso aqui está 20%
        let q_individual_secao = calculateQIndividualSecao(q_outorgavel_secao, 0.2)
        let q_disponivel = calculateQDisponivelSecao(q_outorgavel_secao, q_outorgada_secao)

        let q_sol_q_dis = calculateQSolicitadaMenorQDisponivel(surfaceAnalyse.q_solicitada.values, q_disponivel)
        let q_sol_q_ind = calculateQSolicitadaMenorQIndividual(surfaceAnalyse.q_solicitada.values, q_individual_secao)



        let q_outorgada_uh = calculateQOutorgadaUH(uhGrants[0]);
        let q_referencia_uh = calculateQReferenciaUH(hydrographicBasin);
        let q_remanescente_uh = calculateQRemanescenteUH(q_referencia_uh);
        let q_outorgavel_uh = calculateQOutorgavelUH(q_referencia_uh);
        let q_disponivel_uh = calculateQDisponivelUH(q_outorgavel_uh, q_outorgada_uh);


        setSurfaceAnalyse((prev) => {
          return {
            ...prev,
            secao: {
              ...prev.secao,
              outorgas: sectionGrants,
              q_outorgada: {
                ...prev.secao.q_outorgada,
                values: q_outorgada_secao
              },
              q_referencia: {
                ...prev.secao.q_referencia,
                values: q_referencia_secao
              },
              q_outorgavel: {
                ...prev.secao.q_outorgavel,
                values: q_outorgavel_secao
              },
              q_individual: {
                ...prev.secao.q_individual,
                values: q_individual_secao
              },
              q_disponivel: {
                ...prev.secao.q_disponivel,
                values: q_disponivel
              },
              q_sol_q_dis: {
                ...prev.secao.q_sol_q_dis,
                values: q_sol_q_dis
              },
              q_sol_q_ind: {
                ...prev.secao.q_sol_q_ind,
                values: q_sol_q_ind
              }
            },
            uh: {
              ...prev.uh,
              outorgas: uhGrants,
              attributes: hydrographicBasin.attributes,
              q_outorgada: {
                ...prev.uh.q_outorgada,
                values: q_outorgada_uh
              },
              q_referencia: {
                ...prev.uh.q_referencia,
                values: q_referencia_uh
              },
              q_remanescente: {
                ...prev.uh.q_remanescente,
                values: q_remanescente_uh
              },
              q_outorgavel: {
                ...prev.uh.q_outorgavel,
                values: q_outorgavel_uh
              },
              q_disponivel: {
                ...prev.uh.q_disponivel,
                values: q_disponivel_uh
              },
            }
          };
        });

        // section markers
        ottoBasins.ottoBasinsToGmaps.markers = sectionGrants;

        // Seta em uma variável global para ter como limpar o mapa
        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, ottoBasins.ottoBasinsToGmaps]
        }));
        // se já houver os polígonos das unidades hidrográficas
      } else {

        // Busca ottobacias a partir das coordenadas (lat, lng)
        let ottoBasins = await fetchOttoBasins(lat, lng);

        setOttoBasins(ottoBasins.ottoBasinsToGmaps);



        // Número da UH (uh_codigo, nas shape de otto bacias: uh_rotulo)
        let uhRotulo = ottoBasins.ottoBasins[0].attributes.uh_rotulo;


        let uhGrants = await fetchMarkersByUH(uhRotulo);

        let sectionGrants = await getMarkersInsideOttoBasins(ottoBasins.ottoBasinsToGmaps, uhGrants, map)

        let hydrographicBasin = await searchHydrograficUnit(fetchShape, shapesFetched, setShapesFetched, uhRotulo)

        let ottoBasinArea = ottoBasins.ottoBasinsToGmaps.area;

        let q_outorgada_secao = calculateQOutorgadaSecao(sectionGrants);
        let q_referencia_secao = calculateQReferenciaSecao(hydrographicBasin, ottoBasinArea);
        let q_outorgavel_secao = calculateQOutorgavelSecao(q_referencia_secao);
        // verificarum hook para o percentual desta função, no caso aqui está 20%
        let q_individual_secao = calculateQIndividualSecao(q_outorgavel_secao, 0.2)
        let q_disponivel = calculateQDisponivelSecao(q_outorgavel_secao, q_outorgada_secao)


        let q_outorgada_uh = calculateQOutorgadaUH(uhGrants[0]);
        let q_referencia_uh = calculateQReferenciaUH(hydrographicBasin);
        let q_remanescente_uh = calculateQRemanescenteUH(q_referencia_uh);
        let q_outorgavel_uh = calculateQOutorgavelUH(q_referencia_uh);
        let q_disponivel_uh = calculateQDisponivelUH(q_outorgavel_uh, q_outorgada_uh);

        // Atualização dos Dados da Análise Superficial
        setSurfaceAnalyse((prev) => {
          return {
            ...prev,
            secao: {
              ...prev.secao,
              outorgas: sectionGrants,
              q_outorgada: {
                ...prev.secao.q_outorgada,
                values: q_outorgada_secao
              },
              q_referencia: {
                ...prev.secao.q_referencia,
                values: q_referencia_secao
              },
              q_outorgavel: {
                ...prev.secao.q_outorgavel,
                values: q_outorgavel_secao
              },
              q_individual: {
                ...prev.secao.q_individual,
                values: q_individual_secao
              },
              q_disponivel: {
                ...prev.secao.q_disponivel,
                values: q_disponivel
              }
            },
            uh: {
              ...prev.uh,
              outorgas: uhGrants,
              attributes: hydrographicBasin.attributes,
              q_outorgada: {
                ...prev.uh.q_outorgada,
                values: q_outorgada_uh
              },
              q_referencia: {
                ...prev.uh.q_referencia,
                values: q_referencia_uh
              },
              q_remanescente: {
                ...prev.uh.q_remanescente,
                values: q_remanescente_uh
              },
              q_outorgavel: {
                ...prev.uh.q_outorgavel,
                values: q_outorgavel_uh
              },
              q_disponivel: {
                ...prev.uh.q_disponivel,
                values: q_disponivel_uh
              },
            }
          };
        });

        ottoBasins.ottoBasinsToGmaps.markers = sectionGrants;

        setOverlays(prev => ({
          ...prev,
          shapes: [...prev.shapes, ottoBasins.ottoBasinsToGmaps]
        }));

      }

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

    if (tabNumber === 1) {
      overlays.shapes.forEach(shape => {
        if (shape.draw != undefined && shape.draw.area !== undefined) shape?.draw?.setMap(null)


      });
      setOverlays(initialsStates.overlays);
      setSubsystem(initialsStates.subsystem);
      setHgAnalyse(initialsStates.subsystem.hg_analyse);
    }

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

    // Atualiza o marcador global
    setMarker(prev => ({
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

  const handleCopy = () => {

    navigator.clipboard.writeText(`${position.int_latitude}, ${position.int_longitude}`).then(() => {
      console.log(`${position.int_latitude}, ${position.int_longitude}`);
    });
  };


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
            {tabNumber === 0 ? (
              <Box sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                <CircleRadiusSelector />
              </Box>
            ) : tabNumber === 1 ? (
              <Box sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                <WellTypeSelector />
              </Box>
            ) : null}

            {/* Botões de busca e cópia */}
            <Box sx={{ display: "flex", minWidth: 100 }}>
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
                <Tooltip title="Buscar por coordenada">
                  <IconButton
                    color="secondary"
                    size="large"
                    onClick={() => {
                      handleOnClick().then(() => setLoading(false));
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}

              {tabNumber === 1 ? <ElemGrant /> : null}

              <Tooltip title="Copiar coordenada">
                <IconButton
                  color="secondary"
                  size="large"
                  onClick={handleCopy}>


                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>


            </Box>



          </Box>
        </Paper>
      </FormControl>
    </>
  );
}

export default SearchCoords;
