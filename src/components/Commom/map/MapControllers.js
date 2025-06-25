import React, { useEffect, useState } from "react";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Paper,
    SpeedDial,
    SpeedDialIcon,
    ClickAwayListener,
    Button,
    Icon,
} from "@mui/material";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import LayersIcon from "@mui/icons-material/Layers";
import { Height, MarkEmailReadSharp } from "@mui/icons-material";
import { converterPostgresToGmaps } from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import { fetchRiversByCoordinates, fetchShape } from "../../../services/shapes";
import { initialsStates } from "../../../initials-states";

const checkboxOptions = {
    Superficial: [
        {
            name: "bacias_hidrograficas",
            alias: "Bacias Hidrográficas",
            checked: false,
        },
        {
            name: "unidades_hidrograficas",
            alias: "Unidades Hidrográficas",
            checked: false,
        },
        {
            name: "rios_df",
            alias: "Rios do DF",
            checked: false,
        },
    ],
    Subterrânea: [
        {
            name: "hidrogeo_fraturado",
            alias: "Fraturado",
            checked: false,
        },
        {
            name: "hidrogeo_poroso",
            alias: "Poroso",
            checked: false,
        },
    ],
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
    const {
        marker,
        overlaysFetched,
        setOverlaysFetched,
        setSubsystem,
        setHgAnalyse,
        overlays,
        setOverlays,
    } = useData();

    const [openPanel, setOpenPanel] = useState(false);

    const toggleCheckbox = (group, item) => (event) => {
        setCheckboxes((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [item.name]: {
                    ...prev[group]?.[item.name],
                    ...item,
                    checked: event.target.checked,
                },
            },
        }));
    };

    const clearCheckboxes = () => {
        setCheckboxes({});

        setSubsystem(initialsStates.subsystem);
        setHgAnalyse(initialsStates.subsystem.hg_analyse);
        overlays.shapes.forEach((shape) => {
            if (shape.draw !== null) shape?.draw?.setMap(null);
        });
        setOverlays(initialsStates.overlays);
    };

    useEffect(() => {
        async function fetchOverlays() {
            console.log("Checkboxes:", checkboxes);
            console.log("OverlaysFetched:", overlaysFetched);

            const listCheckboxes = Object.values(checkboxes).flatMap((group) =>
                Object.values(group).map((item) => ({
                    name: item.name,
                    alias: item.alias,
                    checked: item.checked,
                })),
            );

            console.log("ListCheckboxes:", listCheckboxes);

            // for...of ao invés de forEach para aguardar async/await
            for (const checkbox of listCheckboxes) {
                if (checkbox.checked) {
                    let searchOverlaysFetched = overlaysFetched.find(
                        (st) => st.name === checkbox.name,
                    );
                    console.log(
                        `Checkbox "${checkbox.name}" está marcado. Já buscou?`,
                        searchOverlaysFetched !== undefined,
                    );

                    if (searchOverlaysFetched === undefined) {
                        if (checkbox.name === "rios_df") {
                            console.log("Buscando rios_df...");
                            const _shape = await fetchRiversByCoordinates(
                                marker.int_latitude,
                                marker.int_longitude,
                            ).then((__shape) =>
                                __shape.map((sh) => ({
                                    ...sh,
                                    shapeName: checkbox.name,
                                    geometry: {
                                        type: sh.geometry.type,
                                        coordinates: converterPostgresToGmaps(
                                            sh.geometry,
                                        ),
                                    },
                                })),
                            );
                            console.log("Resultado rios_df:", _shape);
                            setOverlaysFetched((prev) => [
                                ...prev,
                                { name: checkbox.name, geometry: _shape },
                            ]);
                        } else {
                            console.log(`Buscando shape: ${checkbox.name}`);
                            const _shape = await fetchShape(checkbox.name).then(
                                (__shape) =>
                                    __shape.map((sh) => ({
                                        ...sh,
                                        // string corrigida
                                        shapeName: `${checkbox.name}_${marker.int_latitude}_${marker.int_longitude}`,
                                        geometry: {
                                            type: sh.type,
                                            coordinates:
                                                converterPostgresToGmaps(
                                                    sh.shape,
                                                ),
                                        },
                                    })),
                            );
                            console.log(`Resultado ${checkbox.name}:`, _shape);
                            setOverlaysFetched((prev) => [
                                ...prev,
                                { name: checkbox.name, geometry: _shape },
                            ]);
                        }
                    } else {
                        console.log(
                            `Shape ${checkbox.name} já foi buscada, não fará novo fetch.`,
                        );
                    }
                }
            }
        }

        fetchOverlays();
    }, [
        checkboxes,
        overlaysFetched,
        marker.int_latitude,
        marker.int_longitude,
    ]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                position: "absolute",
                right: 0,
            }}
        >
            <SpeedDial
                sx={{
                    "& .MuiFab-primary": {
                        width: 45, // Metade do tamanho padrão (56px)
                        height: 45,
                        mx: 0.5,
                    },
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
                            bottom: 70,
                            right: 0,
                            p: 2,
                            width: 250,
                            maxHeight: 500,
                            overflowY: "auto",
                            borderRadius: 2,
                        }}
                    >
                        {Object.entries(checkboxOptions).map(
                            ([group, items]) => (
                                <Box key={group} sx={{ mb: 1 }}>
                                    <strong>{group}</strong>

                                    {items.map((item) => (
                                        <FormControlLabel
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                            }}
                                            key={item.name}
                                            control={
                                                <Checkbox
                                                    checked={
                                                        checkboxes[group]?.[
                                                            item.name
                                                        ]?.checked || false
                                                    }
                                                    onChange={toggleCheckbox(
                                                        group,
                                                        item,
                                                    )}
                                                />
                                            }
                                            label={item.alias}
                                        />
                                    ))}
                                </Box>
                            ),
                        )}

                        <Box
                            display="flex"
                            justifyContent="flex-end"

                            mt={1}
                        ></Box>
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
    );
}

export default MapControllers;
