import React, { useState, useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { CircularProgress, Fade, FormControl, FormLabel, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import { findAllPointsInCircle } from "../../services/geolocation";
import { useData } from "../../hooks/analyse-hooks";

export default function CoordPaper() {
    // Variável de estado para controlar o status de carregamento
    const [loading, setLoading] = useState(false);
    //const [, , , setOverlays] = useContext(AnalyseContext);
    const { marker, setMarker, setOverlays} = useData();

    const [position, setPosition] = useState(marker);

    useEffect(() => {
        setPosition(marker);
    }, [marker]);

    async function handleClick() {

        setMarker(prev => {
            return {
                ...prev,
                int_latitude: position.int_latitude,
                int_longitude: position.int_longitude

            }
        });

        let radius = 600;

        let markers = await findAllPointsInCircle(
            {
                center: { lng: position.int_longitude, lat: position.int_latitude },
                radius: parseInt(radius)
            }
        );
        let id = Date.now();

        let shape = {
            id: Date.now(),
            type: 'circle',
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

    }

    function handleChange(event) {
        let { name, value } = event.target;

        setPosition(prev => {
            return {
                ...prev,
                [name]: value
            }
        })

    }
    return (
        <FormControl style={{ display: "flex", flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Coordenadas</FormLabel>
            <Paper elevation={3} style={{ margin: 0 }}>
                {/* Caixas de entrada: latitude e longitude */}
                <Box sx={{ display: 'flex', flexFlow: 'row wrap' }}
                >
                    <Box sx={{ display: 'flex', flex: 4, flexDirection: 'row' }}>
                        <TextField
                            sx={{
                                my: 1,
                                ml: 1,
                                display: 'flex',
                                flexGrow: 1
                            }}
                            label="Latitude"
                            color="secondary"
                            name="int_latitude"
                            value={position.int_latitude}
                            onChange={handleChange}
                            size="small"
                        />
                        <TextField
                            sx={{
                                my: 1,
                                ml: 1,
                                display: 'flex',
                                flexGrow: 1,

                            }}
                            color="secondary"
                            label="Longitude"
                            name="int_longitude"
                            value={position.int_longitude}
                            onChange={handleChange}
                            size="small"
                        />
                    </Box>
                    {/* Botões de Manipulação */}
                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            loading ?
                                <Fade
                                    sx={{ color: "secondary.main" }}
                                    in={loading}
                                    style={{
                                        transitionDelay: loading ? '800ms' : '0ms',
                                    }}
                                    unmountOnExit
                                >
                                    <CircularProgress size={25} />
                                </Fade>
                                :
                                <IconButton color="secondary" size="large" onClick={() => { handleClick().then(() => { setLoading(false); }); }}>
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