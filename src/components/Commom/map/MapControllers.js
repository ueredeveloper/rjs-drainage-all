
import React, { useEffect, useState } from "react";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Paper,
    SpeedDial,
    ClickAwayListener,
    Typography
    ,
    TextField
} from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import LayersClearIcon from "@mui/icons-material/LayersClear";
import LayersIcon from "@mui/icons-material/Layers";
import { converterPostgresToGmaps } from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import { fetchRiversByCoordinates, fetchShape } from "../../../services/shapes";
import { initialsStates } from "../../../initials-states";

import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';

import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary, { accordionSummaryClasses } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';


import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchSuplySystemByPosition } from "../../../services/connection";

const checkboxOptions = {
    Superficial: [
        { name: "bacias_hidrograficas", alias: "Bacias Hidrográficas", checked: false },
        { name: "unidades_hidrograficas", alias: "Unidades Hidrográficas", checked: false },
        { name: "rios_df", alias: "Rios do DF", checked: false }
    ],
    Subterrânea: [
        { name: "hidrogeo_fraturado", alias: "Fraturado", checked: false, isWaterAvailable: false },
        { name: "hidrogeo_poroso", alias: "Poroso", checked: false, isWaterAvailable: false }
    ],
    Geoportal: [
        { name: "geoportal_checkox", alias: "Endereços no Ponto ou Camada", checked: false },
        { name: "geoportal_input", alias: "Buscar Endereço no DF", checked: false },
        { name: "geoportal_regioes_administrativas", alias: "Regiões Administrativas", checked: false },
    ],
    Caesb: [
        { name: "caesb_df", alias: "Abastecimento", checked: false },
    ]
};

// Copia profunda do objeto para o estado inicial
const getInitialCheckboxes = () => {
    const initial = {};
    for (const [group, items] of Object.entries(checkboxOptions)) {
        initial[group] = {};
        items.forEach((item) => {
            initial[group][item.name] = { ...item };
        });
    }
    return initial;
};

// Estilos do Accordion
const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': { borderBottom: 0 },
    '&::before': { display: 'none' },
}));

const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.8rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor: 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
        transform: 'rotate(90deg)',
    },
    [`& .${accordionSummaryClasses.content}`]: { marginLeft: theme.spacing(1) },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(1),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

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

        } else {
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

        // Converter objeto em array com os valores name, alias e checked
        const listCheckboxes = Object.values(checkboxes).flatMap(group =>
            Object.values(group).map(item => ({
                name: item.name,
                alias: item.alias,
                checked: item.checked,
                isWaterAvailable: item.isWaterAvailable || null
            }))
        );

        listCheckboxes.forEach(async checkbox => {

            if (checkbox.checked) {

                let riversByCoordinates = "rios_df_" + marker.int_latitude + "_" + marker.int_longitude;
                let supplySystemCoordinates = "caesb_df_" + marker.int_latitude + "_" + marker.int_longitude;

                // verificar se overlaysFetched está vazio
                if (overlaysFetched.length === 0 || overlaysFetched.length === undefined) {

                    // A busca dos rios é em outro método
                    if (checkbox.name === "rios_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === riversByCoordinates)

                        if (overlay === undefined) {

                            const _shape = await fetchRiversByCoordinates(marker.int_latitude, marker.int_longitude).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: riversByCoordinates, geometry: { type: sh.geometry.type, coordinates: converterPostgresToGmaps(sh.geometry) } }
                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === riversByCoordinates);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: riversByCoordinates, geometry: _shape });
                                return newSet;
                            });

                        }
                    } else if (checkbox.name === "caesb_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === supplySystemCoordinates)

                        if (overlay === undefined) {

                            const _shape = await fetchSuplySystemByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {

                                    return { ...sh, properties: sh.attributes, shapeName: supplySystemCoordinates, geometry: { type: 'LineString', coordinates: converterPostgresToGmaps(sh.geometry) } }


                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === supplySystemCoordinates);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: supplySystemCoordinates, geometry: _shape });
                                return newSet;
                            });

                        }
                    }


                    else {

                        const _shape = await fetchShape(checkbox.name).then(__shape => {
                            // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
                            return __shape.map(sh => {
                                return { ...sh, shapeName: checkbox.name, geometry: { type: sh.type, coordinates: converterPostgresToGmaps(sh.shape) } }
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
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === riversByCoordinates)
                        if (overlay === undefined) {

                            const _shape = await fetchRiversByCoordinates(marker.int_latitude, marker.int_longitude).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: riversByCoordinates, geometry: { type: sh.geometry.type, coordinates: converterPostgresToGmaps(sh.geometry) } }
                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === riversByCoordinates);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: riversByCoordinates, geometry: _shape });
                                return newSet;
                            });

                        }

                    }
                    else if (checkbox.name === "caesb_df") {

                        // Só busca novos rios se for em outra coordenada
                        let overlay = Array.from(overlaysFetched).find(_of => _of.name === supplySystemCoordinates)

                        if (overlay === undefined) {

                            const _shape = await fetchSuplySystemByPosition({ lat: marker.int_latitude, lng: marker.int_longitude }).then(__shape => {
                                return __shape.features.map(sh => {

                                    return { ...sh, properties: sh.attributes, shapeName: supplySystemCoordinates, geometry: { type: 'LineString', coordinates: converterPostgresToGmaps(sh.geometry) } }


                                })
                            });

                            setOverlaysFetched(prev => {
                                const exists = Array.from(prev).some(ov => ov.name === supplySystemCoordinates);
                                if (exists) return prev; // não adiciona
                                const newSet = new Set(prev);
                                newSet.add({ name: supplySystemCoordinates, geometry: _shape });
                                return newSet;
                            });

                        }
                    }


                    else {
                        // verifica se a shape está presente na array overlaysFetched

                        // converte new Set() to array e busca um valor
                        let searchoverlaysFetched = Array.from(overlaysFetched).find(st => st.name === checkbox.name);

                        // verificar se a shapeState já foi solicitada, bacias_hidorograficas ou outra, se não, solicitar.
                        // Assim, não se repete solicitação de camada no servidor.]
                        if (searchoverlaysFetched === undefined) {
                            const _shape = await fetchShape(checkbox.name).then(__shape => {
                                return __shape.map(sh => {

                                    return { ...sh, shapeName: checkbox.name, geometry: { type: sh.type, coordinates: converterPostgresToGmaps(sh.shape) } }
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
                    right: 0,
                    bottom: 10

                }}
            >
                <SpeedDial
                    sx={{
                        "& .MuiFab-primary": {
                            width: 45, // Metade do tamanho padrão (56px)
                            height: 45,
                            mx: 0.5
                        }
                    }}
                    ariaLabel="Show Filters"
                    icon={<LayersIcon />}
                    onClick={() => setOpenPanel((prev) => !prev)}
                />

                {openPanel && (
                    <ClickAwayListener onClickAway={() => setOpenPanel(false)}>
                        <Paper
                            elevation={6}
                            sx={{
                                position: "absolute",
                                bottom: 50,
                                right: 14,
                                p: 2,
                                width: 300,
                                maxHeight: 400,
                                overflowY: "auto",
                                borderRadius: 2,
                            }}
                        >
                            {Object.entries(checkboxOptions).map(([group, items]) => (
                                <Accordion key={group} expanded={expanded === group} onChange={handleExpandedAccordion(group)} sx={{ my: 0, py: 0 }}>
                                    <AccordionSummary>
                                        <Typography component="span" sx={{ fontSize: 12 }}>{group}</Typography>
                                    </AccordionSummary>

                                    {items.map((item, index) => {
                                        const state = checkboxes[group][item.name];

                                        return (
                                            <AccordionDetails sx={{ textAlign: "left", mx: 3 }} key={group + item.name + index}>
                                                <Box>
                                                    {item.name === 'geoportal_input' ? (
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <TextField
                                                                label="Buscar endereço"
                                                                variant="standard"
                                                                size="small"
                                                                sx={{ flex: 1 }}
                                                            />
                                                            <IconButton aria-label="buscar" size="small">
                                                                <SearchIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ) : (
                                                        <Box>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        sx={{ padding: 0.5 }}
                                                                        checked={state.checked}
                                                                        onChange={handleCheckboxChange(group, item.name, 'checked')}
                                                                        size="small"
                                                                    />
                                                                }
                                                                label={item.alias}
                                                                sx={{ '.MuiTypography-root': { fontSize: 12 } }}
                                                            />
                                                            {('isWaterAvailable' in item) && (
                                                                <FormControlLabel
                                                                    control={
                                                                        <Tooltip title="Disponibilidade Hídrica">
                                                                            <Checkbox
                                                                                checked={state.isWaterAvailable}
                                                                                onChange={handleCheckboxChange(group, item.name, 'isWaterAvailable')}
                                                                                size="small"
                                                                            />
                                                                        </Tooltip>
                                                                    }
                                                                    label="%"
                                                                    sx={{ '.MuiTypography-root': { fontSize: 12 } }}
                                                                />
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </AccordionDetails>
                                        );
                                    })}
                                </Accordion>
                            ))}

                            <Box display="flex" justifyContent="flex-end" mt={1}></Box>
                        </Paper>
                    </ClickAwayListener>
                )}
                <SpeedDial
                    sx={{
                        "& .MuiFab-primary": {
                            width: 35, // Metade do tamanho padrão (56px)
                            height: 20,
                            mx: 0.5,
                        },
                    }}
                    ariaLabel="Show Filters"
                    icon={<LayersClearIcon sx={{ fontSize: 20 }} />}
                    onClick={() => clearCheckboxes()}
                />
            </Box>
        </ThemeProvider>

    );

}

export default MapControllers