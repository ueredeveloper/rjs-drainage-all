import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { CircularProgress, Fade, FormControl, FormLabel, TextField, IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { findAllPointsInCircle } from "../../services/geolocation";
import { useData } from "../../hooks/analyse-hooks";
import RadiusPaper from "./RadiusPaper";
import AlertCommom from './AlertCommom';


/**
 * @description Componente que gera um formulário para entrada de coordenadas e exibe um alerta caso as coordenadas sejam inválidas.
 * 
 * @component
 * @returns {JSX.Element} O componente JSX para o formulário de coordenadas.
 */
export default function CoordPaper() {
    const [loading, setLoading] = useState(false);
    const { marker, setMarker, setOverlays, radius } = useData();
    const [position, setPosition] = useState(marker);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        setPosition(marker);
    }, [marker]);

    useEffect(() => {

        if (openAlert) {
            const timer = setTimeout(() => {
                setOpenAlert(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [openAlert]);

    /**
     * Função que lida com o clique no botão de busca, validando coordenadas e atualizando os marcadores.
     * @async
     * @function
     * @returns {Promise<void>}
     */
    async function handleClick() {

        console.log('handle click ')
        const lat = parseFloat(position.int_latitude);
        const lng = parseFloat(position.int_longitude);

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setAlertMessage("Coordenadas inválidas. Verifique a latitude e longitude.");
            setOpenAlert(true);
            return;
        }

        setMarker(prev => ({
            ...prev,
            int_latitude: position.int_latitude,
            int_longitude: position.int_longitude
        }));
        setLoading(true);

        let markers = await findAllPointsInCircle({
            center: { lng: position.int_longitude, lat: position.int_latitude },
            radius: parseInt(radius)
        });

        let shape = {
            id: Date.now(),
            type: 'circle',
            position: { lat: position.int_latitude, lng: position.int_longitude },
            markers: markers,
            radius: radius,
        };

        setOverlays(prev => ({
            ...prev,
            shapes: [...prev.shapes, shape]
        }));

        setLoading(false);
    }

    /**
     * Função que lida com mudanças nos campos de entrada de coordenadas.
     * @function
     * @param {Object} event - O evento de alteração do campo.
     * @returns {void}
     */
    function handleChange(event) {


        console.log('input handle change ')



        let { name, value } = event.target;

        value = value.replace(",", ".").trim();



        setPosition(prev => ({
            ...prev,
            [name]: value
        }));
    }

    return (
        <>
            <AlertCommom openAlert={openAlert} alertMessage={alertMessage} setOpen={setOpenAlert} />

            <Box sx={{ position: 'relative', width: '100%' }}>
                <FormControl style={{ display: "flex", flexDirection: 'column' }}>
                    <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Coordenadas</FormLabel>
                    <Paper elevation={3}>
                        <Box sx={{ display: 'flex', flexFlow: 'row wrap' }}>
                            <Box sx={{ display: 'flex', flex: 4, flexDirection: 'row' }}>
                                <TextField
                                    sx={{ my: 1, mx: 1, display: 'flex', flexGrow: 1, minWidth: '5rem' }}
                                    label="Latitude"
                                    color="secondary"
                                    name="int_latitude"
                                    value={position.int_latitude}
                                    onChange={handleChange}
                                    size="small"
                                />
                                <TextField
                                    sx={{ my: 1, mx: 1, display: 'flex', flexGrow: 1, minWidth: '5rem' }}
                                    color="secondary"
                                    label="Longitude"
                                    name="int_longitude"
                                    value={position.int_longitude}
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <RadiusPaper />
                                {loading ? (
                                    <Fade in={loading} style={{ transitionDelay: loading ? '800ms' : '0ms' }} unmountOnExit>
                                        <CircularProgress size={25} />
                                    </Fade>
                                ) : (
                                    <IconButton color="secondary" size="large" onClick={handleClick}>
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
            </Box>
        </>
    );
}