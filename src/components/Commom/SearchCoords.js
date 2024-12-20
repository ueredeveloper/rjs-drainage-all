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

/**
 * Busca outorgas por uma coordenada indicada pelo usário.
 * @component
 * @returns {JSX.Element} Retorn elemento React que representa o componente SearchCoords.
 */
function SearchCoords({ value }) {
    // Variável de estado para controlar o status de carregamento
    const [loading, setLoading] = useState(false);
    // Estado para o marcador (marker) e desenhos no map (overlays)
    const { marker, setMarker, setOverlays, radius, setHgAnalyse } = useData();
    // posição a ser analisada
    const [position, setPosition] = useState(marker);

    useEffect(() => {
        setPosition(marker);
    }, [marker]);

    /**
     * Manipula o clique no botão de pesquisa.
     * Atualiza o marcador com as coordenadas atuais, pesquisa marcadores no raio especificado
     * e adiciona uma forma de cículo ou polígono ao objeto overlays.
     * @async
     */
    async function handleOnClick() {

        setMarker(prev => {
            return {
                ...prev,
                int_latitude: position.int_latitude,
                int_longitude: position.int_longitude
            }
        });

        if (value === 0) {
            // Buscar pontos próximos à coordenada desejada, a proximidade é avaliada pelo raio solicitado pelo usuário.
            let markers = await findAllPointsInCircle(
                {
                    center: { lng: position.int_longitude, lat: position.int_latitude },
                    radius: parseInt(radius)
                }
            );

            // salvar uma shape, polígono, com o raio solicitado.
            let shape = {
                id: Date.now(),
                type: "circle",
                position: { lat: position.int_latitude, lng: position.int_longitude },
                map: null,
                draw: null,
                markers: markers,
                radius: radius,
                area: null

            }

            setOverlays(prev => {
                return {
                    ...prev,
                    shapes: [...prev.shapes, shape]
                }
            });

        } else if (value === 1) {

            let { tp_id, int_latitude, int_longitude } = marker;

            // Buscar pontos próximos à coordenada desejada, a proximidade é avaliada pelo raio solicitado pelo usuário.
            await findAllPointsInASubsystem(tp_id, int_latitude, int_longitude).then(markers => {
                // Analisar disponibilidade, se é possível outorgar.
                let hidrogeoInfo = markers.hidrogeo[0].info;
                // Adiciona o primeiro marcador com vazão nula, pois só se está buscando por coordenadas, sem se tratar de vazão.
                let subterraneanMarkers = [
                    {
                        int_latitude: position.int_latitude,
                        int_longitude: position.int_longitude,
                        dt_demanda: { demandas: [], vol_anual_ma: 5000000.4585 }
                    }, ...markers.subterranea
                ];

                let hgAnalyse = analyzeAvailability(hidrogeoInfo, subterraneanMarkers);
                // setar Valor que será utilzado no componente DataAnalyseTable.js e DataAnalyseChart.js
                setHgAnalyse(hgAnalyse)

                // Setar polígono solicitado.
                let shape = {
                    id: Date.now(),
                    type: "polygon",
                    position: { lat: position.int_latitude, lng: position.int_longitude },
                    map: null,
                    draw: null,
                    markers: markers,
                    radius: radius,
                    area: null

                }

                setOverlays(prev => {
                    return {
                        ...prev,
                        shapes: [...prev.shapes, shape]
                    }
                });
            });
        }

    }

    /**
     * Manipula a alteração de valores nos campos de entrada de coordenadas.
     * @param {Object} event - O evento de alteração.
     */
    function handleOnTextFieldChange(event) {
        let { name, value } = event.target;

        setPosition(prev => {
            return {
                ...prev,
                [name]: value
            }
        })

    }

    return (
        <FormControl style={{ display: "flex", flexDirection: "column" }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Coordenadas</FormLabel>
            <Paper elevation={3} sx={{ margin: 0 }}>
                {/* Caixas de entrada: latitude e longitude */}
                <Box id="sc-container" sx={{ display: "flex", flexFlow: "row wrap" }}>
                    <Box id="sc-text-fields" sx={{ display: "flex", flex: 4, flexDirection: "row" }}>
                        <TextField
                            sx={{
                                my: 1,
                                mx: 1,
                                minWidth: "3rem",
                                flex: 1
                            }}
                            label="Latitude"
                            color="secondary"
                            name="int_latitude"
                            value={position.int_latitude}
                            onChange={handleOnTextFieldChange}
                            size="small"
                        />
                        <TextField
                            sx={{
                                my: 1,
                                mx: 1,
                                minWidth: "3rem",
                                flex: 1

                            }}

                            color="secondary"
                            label="Longitude"
                            name="int_longitude"
                            value={position.int_longitude}
                            onChange={handleOnTextFieldChange}
                            size="small"
                        />
                    </Box>
                    {value === 0 ?
                        <Box id="sc-controls" sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                            <CircleRadiusSelector />
                        </Box>
                        : value === 1 ?
                            <Box id="sc-controls" sx={{ display: "flex", flex: 2, flexDirection: "row", alignItems: "center" }}>
                                <WellTypeSelector />
                            </Box>
                            :
                            null}

                    <Box id="sc-search-copy-controls" sx={{ minWidth: 100 }}>
                        {
                            loading ?
                                <Fade
                                    sx={{ color: "secondary.main" }}
                                    in={loading}
                                    style={{
                                        transitionDelay: loading ? "800ms" : "0ms",
                                    }}
                                    unmountOnExit
                                >
                                    <CircularProgress size={25} />
                                </Fade>
                                :
                                <IconButton color="secondary" size="large" onClick={() => { handleOnClick().then(() => { setLoading(false); }); }}>
                                    <SearchIcon />
                                </IconButton>
                        }
                        <IconButton color="secondary" size="large">
                            <ContentCopyIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        </FormControl>
    );
}

export default SearchCoords;
