
import React, { useEffect, useState } from "react";


import {
    Box,
    Paper,
    SpeedDial,
    SpeedDialAction,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Autocomplete,
    TextField,
    Typography,
    IconButton,
    Fade,
} from "@mui/material";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";

import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";

import LayersClearIcon from "@mui/icons-material/LayersClear";
import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';


import { convertGeometryToGmaps } from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import { fetchRiversByCoordinates, fetchShape } from "../../../services/shapes";
import { initialsStates } from "../../../initials-states";


import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchAddressesByPosition, fetchAdministrativeRegions, fetchSuplySystemByPosition } from "../../../services/connection";
import { AddressControllers, SupplySystemControllers, SurfaceControllers } from "./controllers";
import SubterraneanControlllers from "./controllers/SubterraneanControllers";


const checkboxOptions = {
    Superficial: [
        { name: "bacias_hidrograficas", alias: "Bacias Hidrográficas", checked: false, meters: 200 },
        { name: "unidades_hidrograficas", alias: "Unidades Hidrográficas", checked: false, meters: 200 },
        { name: "rios_df", alias: "Rios do DF", checked: false, meters: 200 }
    ],
    Subterrânea: [
        { name: "hidrogeo_fraturado", alias: "Fraturado", checked: false, isWaterAvailable: false, meters: 200 },
        { name: "hidrogeo_poroso", alias: "Poroso", checked: false, isWaterAvailable: false, meters: 200 }
    ],
    Geoportal: [
        // A busca engloba com quantos metros de distância
        { name: "enderecos_df", alias: "Endereços pela Coordenada", checked: false, meters: 200 },
        { name: "geoportal_input", alias: "Buscar Endereço no DF", checked: false, meters: 200 },
        { name: "regioes_administrativas", alias: "Regiões Administrativas", checked: false, meters: 200 },
    ],
    Caesb: [
        // A busca engloba com quantos metros de distância
        { name: "caesb_df", alias: "Abastecimento", checked: false, meters: 200 },
    ]
};

// Copia profunda do objeto para o estado inicial
const getInitialCheckboxes = () => {
    const initial = {};
    for (const [group, items] of Object.entries(checkboxOptions)) {
        initial[group] = {};
        items.forEach((item) => {
            initial[group][item?.name] = { ...item };
        });
    }
    return initial;
};

/**
 * Componente React responsável pelos controladores do mapa.
 *
 * Este componente gerencia checkboxes que representam camadas geográficas
 * como bacias hidrográficas, entre outras, e lida com a lógica para carregar,
 * exibir e remover os polígonos no mapa com base na seleção do usuário.
 *
 * - Inicializa camadas geográficas ao selecionar checkboxes.
 * - Evita requisições duplicadas reutilizando dados já buscados.
 * - Possui botão para limpar todos os checkboxes e remover polígonos do mapa.
 * - Usa o hook `useData` para acessar e modificar estados globais relacionados às camadas.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.checkboxes - Estado atual das camadas ativas, organizado por grupos e itens.
 * @param {Function} props.setCheckboxes - Função para atualizar o estado dos checkboxes.
 *
 * @returns {JSX.Element} Elemento JSX que renderiza o painel de controle do mapa.
 */
function MapControllers({ checkboxes, setCheckboxes }) {

    const theme = createTheme({
        typography: {
            fontSize: 12, // ⬅️ muda a base para todos os componentes MUI (12px por padrão)
        },
    });

    const { marker, overlaysFetched, setOverlaysFetched, setSubsystem, setHgAnalyse, overlays, setOverlays } = useData();

    const [openPanel, setOpenPanel] = useState(false);

    useEffect(() => {
        // Inicialização da variável checkboxes
        setCheckboxes(getInitialCheckboxes())

    }, [])

    const handleCheckboxChange = (group, name, field) => (event) => {

        const value = event.target.checked;

        // Se fechar a camada, não precisa mostrar a disponibilidade (cores, nº poços e porcentagem)
        if (field === 'checked' && !value) {

            setCheckboxes((prev) => ({
                ...prev,
                [group]: {
                    ...prev[group],
                    [name]: {
                        ...prev[group][name],
                        [field]: value,
                        ['isWaterAvailable']: false
                    },
                },
            }));

        } else if (field === 'meters') {

            setCheckboxes((prev) => ({
                ...prev,
                [group]: {
                    ...prev[group],
                    [name]: {
                        ...prev[group][name],
                        [field]: event.target.value,
                    },
                },
            }));

        }
        else {
            setCheckboxes((prev) => ({
                ...prev,
                [group]: {
                    ...prev[group],
                    [name]: {
                        ...prev[group][name],
                        [field]: value,
                    },
                },
            }));

        }

    };

    const [expanded, setExpanded] = useState('');

    const handleExpandedAccordion = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };


    const clearCheckboxes = () => {
        setCheckboxes(getInitialCheckboxes())

        setSubsystem(initialsStates.subsystem);
        setHgAnalyse(initialsStates.subsystem.hg_analyse);
        overlays.shapes.forEach(shape => {
            if (shape.draw !== null) shape?.draw?.setMap(null)
        });
        setOverlays(initialsStates.overlays);
    };

    useEffect(() => {

        console.log('checkboxes', checkboxes['Caesb'])

        // Converter objeto em array com os valores name, alias e checked
        const listCheckboxes = Object.values(checkboxes).flatMap(group =>
            Object.values(group).map(item => ({
                name: item?.name,
                alias: item?.alias,
                checked: item?.checked,
                meters: item?.meters || null,
                isWaterAvailable: item?.isWaterAvailable || null
            }))
        );

        listCheckboxes.forEach(async checkbox => {

            if (checkbox.checked) {

                let riversCoord = "rios_df_" + marker.int_latitude + "_" + marker.int_longitude;
                let supplyCoords = "caesb_df_" + marker.int_latitude + "_" + marker.int_longitude;
                let addressCoords = "enderecos_df_" + marker.int_latitude + "_" + marker.int_longitude;

                // verificar se overlaysFetched está vazio
                if (overlaysFetched.length === 0 || overlaysFetched.length === undefined) {

                    // A busca dos rios é em outro método
                    if (checkbox.name === "rios_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === riversCoord)

                        if (overlay === undefined) {

                            const _shape = await fetchRiversByCoordinates(marker.int_latitude, marker.int_longitude).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: riversCoord, geometry: { type: sh.geometry.type, coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === riversCoord);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: riversCoord, geometry: _shape });
                                return newSet;
                            });

                        }
                    } else if (checkbox.name === "caesb_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === supplyCoords)

                        if (overlay === undefined) {

                            const _shape = await fetchSuplySystemByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {

                                    return { ...sh, properties: sh.attributes, shapeName: supplyCoords, geometry: { type: 'LineString', coordinates: convertGeometryToGmaps(sh.geometry) } }


                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === supplyCoords);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: supplyCoords, geometry: _shape });
                                return newSet;
                            });

                        }
                    }

                    else if (checkbox.name === "enderecos_df") {

                        console.log('address, if')

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === addressCoords)

                        if (overlay === undefined) {

                            const _shape = await fetchAddressesByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {
                                    return { ...sh, properties: sh.attributes, shapeName: addressCoords, geometry: { type: 'Polygon', coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            console.log(_shape)

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === addressCoords);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: addressCoords, geometry: _shape });
                                return newSet;
                            });

                        }
                    }
                    else if (checkbox.name === "regioes_administrativas") {
                        console.log('if -> regiões administrativas')

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === "regioes_administrativas")

                        if (overlay === undefined) {

                            const _shape = await fetchAdministrativeRegions().then(__shape => {
                                return __shape.features.map(sh => {
                                    return { ...sh, properties: sh.attributes, shapeName: "regioes_administrativas", geometry: { type: 'Polygon', coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            console.log(_shape)

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === "regioes_administrativas");
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: "regioes_administrativas", geometry: _shape });
                                return newSet;
                            });

                        }

                    }

                    else {



                        const _shape = await fetchShape(checkbox.name).then(__shape => {
                            // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
                            return __shape.map(sh => {
                                return { ...sh, shapeName: checkbox.name, geometry: { type: sh.type, coordinates: convertGeometryToGmaps(sh.shape) } }
                            })
                        });

                        setOverlaysFetched(prev => {
                            const exists = Array.from(prev).some(ov => ov.name === checkbox.name);
                            if (exists) return prev;
                            const newSet = new Set(prev);
                            newSet.add({ name: checkbox.name, geometry: _shape });
                            return newSet;
                        });

                    }

                } else {

                    // A busca dos rios é em outro método
                    if (checkbox.name === "rios_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === riversCoord)
                        if (overlay === undefined) {

                            const _shape = await fetchRiversByCoordinates(marker.int_latitude, marker.int_longitude).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: riversCoord, geometry: { type: sh.geometry.type, coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === riversCoord);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: riversCoord, geometry: _shape });
                                return newSet;
                            });

                        }

                    }
                    else if (checkbox.name === "caesb_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === supplyCoords)

                        if (overlay === undefined) {

                            const _shape = await fetchSuplySystemByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {

                                    return { ...sh, properties: sh.attributes, shapeName: supplyCoords, geometry: { type: 'LineString', coordinates: convertGeometryToGmaps(sh.geometry) } }


                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === supplyCoords);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: supplyCoords, geometry: _shape });
                                return newSet;
                            });

                        }
                    }

                    else if (checkbox.name === "enderecos_df") {

                        console.log('address, else')

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === addressCoords)

                        if (overlay === undefined) {

                            const _shape = await fetchAddressesByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {
                                    return { ...sh, properties: sh.attributes, shapeName: addressCoords, geometry: { type: 'Polygon', coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            console.log(_shape)

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === addressCoords);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: addressCoords, geometry: _shape });
                                return newSet;
                            });

                        }
                    }
                    else if (checkbox.name === "regioes_administrativas") {
                        console.log('else -> regiões administrativas')

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === "regioes_administrativas")

                        if (overlay === undefined) {

                            const _shape = await fetchAdministrativeRegions().then(__shape => {
                                return __shape.features.map(sh => {
                                    return { ...sh, properties: sh.attributes, shapeName: "regioes_administrativas", geometry: { type: 'Polygon', coordinates: convertGeometryToGmaps(sh.geometry) } }
                                })
                            });

                            console.log(_shape)

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === "regioes_administrativas");
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: "regioes_administrativas", geometry: _shape });
                                return newSet;
                            });

                        }

                    }


                    else {
                        // verifica se a shape está presente na array overlaysFetched

                        // converte new Set() to array e busca um valor
                        let searchoverlaysFetched = Array.from(overlaysFetched).find(st => st.name === checkbox.name);

                        console.log(searchoverlaysFetched)
                        // verificar se a shapeState já foi solicitada, bacias_hidorograficas ou outra, se não, solicitar.
                        // Assim, não se repete solicitação de camada no servidor.]
                        if (searchoverlaysFetched === undefined) {
                            const _shape = await fetchShape(checkbox.name).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: checkbox.name, geometry: { type: sh.type, coordinates: convertGeometryToGmaps(sh.shape) } }
                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === checkbox.name);
                                if (exists) return prev;
                                const newSet = new Set(prev);
                                newSet.add({ name: checkbox.name, geometry: _shape });
                                return newSet;
                            });

                        }
                    }

                }

            }
        });

    }, [checkboxes]);


    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    position: "absolute",
                    right: 25,
                    bottom: 20,
                    padding: 0,
                    margin: 0
                }}
            >

                {/* Floating SpeedDial in the bottom-right */}
                <SpeedDial
                    ariaLabel="SpeedDial Accordion Combo"
                    sx={{
                        "& .MuiFab-primary": {
                            width: 45, // Metade do tamanho padrão (56px)
                            height: 45,
                            mx: 0.5
                        }
                    }}
                    icon={<LayersIcon />}
                    onClick={() => setOpenPanel((prev) => !prev)}
                    open={openPanel}
                >
                    {/* A single action that toggles a small panel */}
                    <SpeedDialAction
                        id="speed-dial-action-clear"
                        key="panel"
                        icon={<LayersClearIcon />}
                        tooltipTitle="Limpar o Mapa"
                        onClick={() => clearCheckboxes() && setOpenPanel((s) => !s)}
                    />
                </SpeedDial>

                {/* The floating panel: use Fade for a smooth appear */}
                <Fade in={openPanel} id="fade-map-controllers">
                    <Paper
                        elevation={6}
                        sx={{
                            width: 320,
                            maxHeight: "300px",
                            position: "absolute",
                            overflow: "auto",
                            bottom: 82,
                            right: 16,
                            p: 1,
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Painel de Camadas</Typography>
                            <IconButton size="small" onClick={() => setOpenPanel(false)} aria-label="fechar painel">
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {Object.entries(checkboxOptions).map(([group, items]) => (
                            <Accordion id="accordion" key={group} expanded={expanded === group} onChange={handleExpandedAccordion(group)} sx={{ my: 0, p: 0 }}>
                                <AccordionSummary id="accordion-summary" sx={{
                                    "&.Mui-expanded": {
                                        minHeight: 0,        // remove min-height
                                    },
                                    "& .MuiAccordionSummary-content.Mui-expanded": {
                                        margin: 0,           // opcional: remove margin que aumenta altura
                                    }
                                }}>
                                    <Typography id="typography" component="span" sx={{ fontSize: 12, p: 0, m: 0, fontWeight: 'bold' }}>{group}</Typography>
                                </AccordionSummary>

                                {items.map((item, index) => {
                                    if (!checkboxes[group] || !checkboxes[group][item.name]) return null;
                                    const state = checkboxes[group][item.name];
                                    return (
                                        <AccordionDetails id="accordion-details" sx={{ textAlign: "left", my: 0, mx: 2, p: 0 }} key={group + item.name + index}>
                                            <Box id="first-box" key={'box-controlls' + group + item.name + index} sx={{ p: 0, height: "2rem" }}>
                                                {(group === "Superficial") && (
                                                    <SurfaceControllers
                                                        key={'surf-controlls' + group + item.name + index}
                                                        group={group}
                                                        name={item.name}
                                                        alias={item.alias}
                                                        checked={state?.checked}
                                                        handleCheckboxChange={handleCheckboxChange}
                                                    />
                                                )}
                                                {(group === "Subterrânea") && (
                                                    <SubterraneanControlllers
                                                        key={'subt-controlls' + group + item.name + index}
                                                        group={group}
                                                        name={item.name}
                                                        alias={item.alias}
                                                        checked={state?.checked}
                                                        isWaterAvailable={state?.isWaterAvailable}
                                                        handleCheckboxChange={handleCheckboxChange}
                                                    />
                                                )}
                                                {(group === "Caesb") && (
                                                    <SupplySystemControllers
                                                        key={'supply-controlls' + group + item.name + index}
                                                        group={group}
                                                        name={item.name}
                                                        alias={item.alias}
                                                        checked={state?.checked}
                                                        meters={state?.meters}
                                                        handleCheckboxChange={handleCheckboxChange}
                                                    />
                                                )}
                                                {(group === "Geoportal") && (
                                                    <AddressControllers
                                                        key={'address-controlls' + group + item.name + index}
                                                        group={group}
                                                        name={item.name}
                                                        alias={item.alias}
                                                        checked={state?.checked}
                                                        meters={state?.meters}
                                                        handleCheckboxChange={handleCheckboxChange} />
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    );
                                })}
                            </Accordion>
                        ))}
                    </Paper>
                </Fade>
            </Box>
        </ThemeProvider>

    );

}

export default MapControllers