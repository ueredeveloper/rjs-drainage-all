import Box from "@mui/material/Box";
import { Alert, Collapse } from "@mui/material";


/**
 * Componente de alerta comum.
 * Exibe uma mensagem de erro dentro de um alerta colapsável.
 * 
 * @component
 * @param {Object} props - As propriedades do componente.
 * @param {boolean} props.openAlert - Define se o alerta deve ser exibido ou não.
 * @param {string} props.alertMessage - A mensagem a ser exibida dentro do alerta.
 * @param {function} props.setOpen - Função para atualizar o estado do alerta.
 * @returns {JSX.Element} O componente JSX do alerta.
 */

export default function AlertCommom({ openAlert, alertMessage, setOpen }) {
  
  return (
    <Box
      sx={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        width: "fit-content",
        zIndex: 10,
      }}
      
    >
      <Collapse in={openAlert}>
        <Alert 
          variant="filled" 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setOpen(false)} // Adiciona a funcionalidade de fechar
        >
          {alertMessage}
        </Alert>
      </Collapse>
    </Box>
  );
}