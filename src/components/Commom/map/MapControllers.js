
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
import { Height } from "@mui/icons-material";
import { converterPostgresToGmaps } from "../../../tools";
import { useData } from "../../../hooks/analyse-hooks";
import { fetchShape } from "../../../services/shapes";
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


function MapControllers({ checkboxes, setCheckboxes }) {

    const { shapesFetched, setShapesFetched, setSubsystem, setHgAnalyse, overlays, setOverlays } = useData();

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
        overlays.shapes.forEach(shape => {
            shape?.draw?.setMap(null)
        });
        setOverlays(initialsStates.overlays);
    };

    useEffect(() => {


        const listCheckboxes = Object.values(checkboxes).flatMap(group =>
            Object.values(group).map(item => ({
                name: item.name,
                alias: item.alias,
                checked: item.checked
            }))
        );


        listCheckboxes.forEach(async checkbox => {
            if (checkbox.checked) {



                // verificar se shapesFetched está vazio
                if (shapesFetched.length === 0) {
                    const _shape = await fetchShape(checkbox.name).then(__shape => {
                        // converter posgress para gmaps. ex: [-47.000, -15.000] => {lat: -15.000, lng: -47.000}
                        return __shape.map(sh => {
                            return { ...sh, shapeName: checkbox.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                        })
                    });

                    setShapesFetched(prev => [...prev, { name: checkbox.name, shape: _shape }]);
                } else {
                    // verifica se a shape está presente na array shapesFetched
                    let searchShapesFetched = shapesFetched.find(st => st.name === checkbox.name);
                    // verificar se a shapeState já foi solicitada, bacias_hidorograficas ou outra, se não, solicitar.
                    // Assim, não se repete solicitação de camada no servidor.]
                    if (searchShapesFetched === undefined) {
                        const _shape = await fetchShape(checkbox.name).then(__shape => {
                            return __shape.map(sh => {

                                return { ...sh, shapeName: checkbox.name, shape: { coordinates: converterPostgresToGmaps(sh) } }
                            })
                        });
                        setShapesFetched(prev => [...prev, { name: checkbox.name, shape: _shape }]);
                    }
                }

            }
        })

    }, [checkboxes, setShapesFetched, shapesFetched]);

    return (
        <Box

            sx={{

                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                position: "absolute",
                right: 0

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
                        {Object.entries(checkboxOptions).map(([group, items]) => (
                            <Box key={group} sx={{ mb: 1 }}>
                                <strong>{group}</strong>

                                {items.map((item) => (
                                    <FormControlLabel
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row"

                                        }}
                                        key={item.name}
                                        control={
                                            <Checkbox
                                                checked={checkboxes[group]?.[item.name]?.checked || false}
                                                onChange={toggleCheckbox(group, item)}
                                            />
                                        }
                                        label={item.alias}
                                    />
                                ))}
                            </Box>
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
    );

}

export default MapControllers