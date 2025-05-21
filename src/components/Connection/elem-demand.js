import React, { useState } from 'react';
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, TableCell, TableRow } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { findPointsInASystem } from '../../services/geolocation'
import { CircularProgress, Fade } from '@mui/material';
import { useData } from '../../hooks/analyse-hooks';

import { analyzeAvailability, converterPostgresToGmaps } from '../../tools';
import { initialsStates } from '../../initials-states';

export function ElemDemand({ demand, setUser }) {

    // mostrar barra de progresso ao clicar
    const [loading, setLoading] = useState(false);

    const { map, setMarker, overlays, setOverlays, setSubsystem, setTpId } = useData(); // Hook para estado global

    const [age, setAge] = React.useState(1);

    const handleChange = (event) => {
        setAge(event.target.value);
    };


    function onClick() {
        setLoading((prevLoading) => !prevLoading);

        // setar usuário
        setUser(prev => {
            return {
                ...prev,
                us_nome: demand.us_nome,
                sub_tp_id: demand.sub_tp_id,
                tp_id: demand.sub_tp_id,
                dt_demanda: demand.dt_demanda,
                int_shape: {
                    coordinates: [demand.int_longitude, demand.int_latitude],
                },
                int_latitude: demand.int_latitude,
                int_longitude: demand.int_longitude
            }
        })

        let { sub_tp_id, int_latitude, int_longitude } = demand;

        if (sub_tp_id !== undefined && int_latitude !== undefined && int_longitude !== undefined) {

            // Limpa o mapa para o cálculo de nova disponibilidade 
            overlays.shapes.forEach(shape => {
                shape.draw?.setMap(null)
            });
            setOverlays(initialsStates.overlays);

            // Busca ponto no sistema de acordo com o usuário solicitado
            findPointsInASystem(sub_tp_id, int_latitude, int_longitude)
                .then(
                    points => {

                        let marker = {
                            id: 0,
                            us_nome: demand.us_nome,
                            us_cpf_cnpj: demand.us_cpf_cnpj,
                            emp_endereco: demand.end_logradouro,
                            int_processo: demand.proc_sei,
                            // tipo de poço, se manual (1), tubular raso (2) ou tubular profundo (3)
                            tp_id: demand.sub_tp_id,
                            // subterrâneo, caso seja feito de superficial mudar...
                            ti_id: 2,
                            sub_tp_id: demand.sub_tp_id,
                            dt_demanda: demand.dt_demanda,
                            int_shape: {
                                coordinates: [demand.int_longitude, demand.int_latitude],
                            },
                            int_latitude: demand.int_latitude,
                            int_longitude: demand.int_longitude
                        }

                        let markers = [marker, ...points._points || []]

                        let { _hg_info, _hg_shape } = points
                        // verificar disponibilidade com o ponto (user) adicionado.
                        let _hg_analyse = analyzeAvailability(_hg_info, markers);

                        setSubsystem(prev => {
                            return {
                                ...prev,
                                /*point: {
                                    tp_id: sub_tp_id,
                                    lat: int_latitude,
                                    lng: int_longitude,
                                    us_nome: demand.us_nome,
                                    us_cpf_cnpj: demand.us_cpf_cnpj,
                                    end_logradouro: demand.end_logradouro,
                                    proc_sei: demand.proc_sei,
                                },*/
                                markers: markers,
                                hg_shape: _hg_shape,
                                hg_info: _hg_info,
                                hg_analyse: _hg_analyse,
                            }
                        });

                        let coordinates = { shape: { coordinates: converterPostgresToGmaps({ shape: _hg_shape }) } }

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
                                subterranea: markers,
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
                        // Seta o tipo de poço. Se 1 (Manual) ou 2 (Tubular Raso), mude para 1, ou então 3 (Tubular Profundo)
                        setTpId(demand.sub_tp_id === 1 || demand.sub_tp_id === 2 ? Number(1) : Number(3));

                        setMarker(marker);

                    }
                )
                .then(() => { setLoading(false); })

        } else {
            setLoading((prevLoading) => !prevLoading);
            alert("Dados Inválidos!!!")

        }
    }

    return (
        <TableRow key="1" sx={{ bgcolor: '#ECECEC' }}>

            <TableCell>{demand.int_latitude}</TableCell>
            <TableCell>{demand.int_longitude}</TableCell>
            {/** mostra vazões em janeiro */}
            {
                demand.dt_demanda.demandas.length !== 0
                    ?
                    <TableCell>{demand.dt_demanda.demandas[0].vazao_lh}</TableCell>
                    :
                    <TableCell>{''}</TableCell>
            }
            {
                demand.dt_demanda.demandas.length !== 0
                    ?
                    <TableCell>{demand.dt_demanda.demandas[0].vazao_ld}</TableCell>
                    :
                    <TableCell>{''}</TableCell>
            }
            <TableCell>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">Quantidade</InputLabel>
                    <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={age}
                        label="Age"
                        onChange={handleChange}
                    >
                        {Array.apply(null, Array(10)).map((a, i) => (<MenuItem key={'menu_' + i} value={++i}>{i}</MenuItem>))}

                    </Select>
                </FormControl>
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex' }}>
                    {loading ? <Fade
                        sx={{ alignSelf: 'center', color: "secondary.main", margin: 1.5 }}
                        in={loading}
                        style={{
                            transitionDelay: loading ? '800ms' : '0ms',
                        }}
                        unmountOnExit
                    >
                        <CircularProgress size={25} />
                    </Fade>
                        :
                        <IconButton
                            color="secondary"
                            size="large"

                            onClick={() => { onClick() }}>
                            <DoneAllIcon />
                        </IconButton>}
                </Box>
            </TableCell>
        </TableRow>
    )
}