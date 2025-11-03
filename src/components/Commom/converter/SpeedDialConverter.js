import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import Converter from './Converter.js';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';

/**
 * @typedef {object} SpeedDialConverterProps
 * @property {function(coords: {lat: number, lng: number}): void} [setCoords] - Uma função de callback opcional para definir as coordenadas (latitude e longitude) no componente pai.
 */

/**
 * Um componente que renderiza um botão para abrir um popover com o componente {@link Converter}.
 *
 * Este componente gerencia o estado do popover e passa a função `setCoords` para o `Converter`.
 *
 * @param {SpeedDialConverterProps} props - As propriedades do componente.
 * @returns {React.ReactElement} O componente React renderizado.
 */
export default function SpeedDialConverter({ setCoords }) {
    /**
     * O elemento de âncora para o Popover.
     * @type {[HTMLElement | null, React.Dispatch<React.SetStateAction<HTMLElement | null>>]}
     */
    const [anchorEl, setAnchorEl] = React.useState(null);

    /**
     * Manipulador de clique para abrir o popover.
     * @param {React.MouseEvent<HTMLButtonElement>} event - O evento de clique.
     */
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    /**
     * Manipulador para fechar o popover.
     */
    const handleClose = () => {
        setAnchorEl(null);
    };

    /**
     * Determina se o popover está aberto.
     * @type {boolean}
     */
    const open = Boolean(anchorEl);

    /**
     * O ID do popover, usado para acessibilidade.
     * @type {string|undefined}
     */
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Tooltip title="conversor">
                <IconButton
                    color="secondary"
                    aria-label="converter"
                    size="large"
                    onClick={handleClick}
                >
                    <TravelExploreIcon />
                </IconButton>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Converter setMapCoords={setCoords} />
                </Box>
            </Popover>
        </>
    );
}