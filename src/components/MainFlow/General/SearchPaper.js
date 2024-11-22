import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { CircularProgress, Fade, FormControl, FormLabel, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import { findByColumn } from "../../../services/users";
import { useData } from "../../../hooks/analyse-hooks";

/**
 * 
 * Buscador de outorgas por coordenadas
 * @component
 * @requires findByColumn
 * @requires useData
 */
function SearchPaper() {
    // Variável de estado para controlar o status de carregamento
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    //  const [, , , setOverlays] = useContext(AnalyseContext);
    const { setOverlays } = useData();

    function searchQueryHandle(event) {
        let { value } = event.target;
        setSearchQuery(value)
    }

    async function findByColumnHandler() {

        let markers = await findByColumn(searchQuery);

        let shape = {
            id: Date.now(),
            type: null,
            position: { lat: null, lng: null },
            map: null,
            draw: null,
            markers: markers,
            radius: null,
            area: null

        }

        setOverlays(prev => {
            return {
                ...prev,
                shapes: [...prev.shapes, shape]
            }
        });
    }



    return (
        <FormControl style={{ display: "flex", flexDirection: 'column' }}>
            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ my: 1 }}>Buscador</FormLabel>
            <Paper elevation={3} sx={{ margin: 0 }}>
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
                            label="Nome, CPF/CNPN, Endereço, Processo, Nº Ato"
                            color="secondary"
                            name="search"
                            value={searchQuery}
                            onChange={searchQueryHandle}
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
                                <IconButton color="secondary" size="large" onClick={() => { findByColumnHandler().then(() => { setLoading(false); }); }}>
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
export default SearchPaper;