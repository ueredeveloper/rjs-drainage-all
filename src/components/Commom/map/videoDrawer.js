/**
 * Importações necessárias:
 * - React para hooks e JSX
 * - Box e Drawer do Material-UI (MUI) para estrutura e painel lateral
 * - VideoCameraBackIcon como ícone do botão de abrir
 * - IconButton para o botão flutuante que abre o drawer
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';


/**
 * Componente VideoDrawer
 * 
 * Este componente cria um Drawer (painel lateral) que é aberto ao clicar em um botão 
 * flutuante fixado no canto superior direito da tela.
 * O Drawer aparece do lado direito e pode receber qualquer conteúdo via `children` 
 * (ex: players de vídeo, listas, textos, etc).
 *
 * @component
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Conteúdo JSX passado como filho, que será exibido dentro do Drawer.
 * 
 * @returns {JSX.Element} Drawer com botão de abrir/fechar.
 */
export default function VideoDrawer({ children }) {
  /**
   * Estado de controle do Drawer.
   * - open: booleano que indica se o Drawer está aberto ou fechado
   */
  const [open, setOpen] = React.useState(false);

  /**
   * Função que alterna o estado do Drawer.
   * Evita abrir/fechar caso a tecla pressionada seja Tab ou Shift (para não atrapalhar navegação).
   *
   * @function toggleDrawer
   * @param {boolean} isOpen - Define se o Drawer deve abrir (true) ou fechar (false).
   * @returns {function} Função de evento para ser usada em onClick/onClose.
   */
  const toggleDrawer = (isOpen) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  return (
    <div>
      {/* Botão flutuante que abre o Drawer */}
      <Tooltip title="Tutoriais">
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 1000,
          color: 'white',
          backgroundColor: '#1976d2',
          mr: 3
        }}
      >
        <VideoCameraBackIcon/>
      </IconButton>
      </Tooltip>


      {/* Drawer lateral à direita */}
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 500, padding: 2 }} role="presentation">
          {children /* Conteúdo passado via props.children */}
        </Box>
      </Drawer>
    </div>
  );
}
