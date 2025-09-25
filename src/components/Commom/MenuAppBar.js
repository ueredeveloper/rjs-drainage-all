/**
 * Importação dos componentes do Material-UI (MUI) necessários para construir a AppBar.
 */
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import VideoDrawer from "./map/videoDrawer";

/**
 * Lista de vídeos que serão exibidos no drawer.
 * Cada objeto contém:
 * - src: URL do vídeo embed do YouTube
 * - title: título que descreve o vídeo
 */
const videos = [
  {
    src: "https://www.youtube.com/embed/GslPomqj5qA?si=u0LjmeHYwjZWpJDh",
    title: "Camadas do Mapa",
  },
];

/**
 * Componente MenuAppBar
 *
 * Este componente cria uma AppBar (barra de navegação superior) com:
 * - O título "Sistema de Apoio à Decisão - SAD/DF"
 * - Um botão de "Login"
 * - Um drawer que contém a lista de vídeos definidos no array `videos`
 *
 * @function MenuAppBar
 * @returns {JSX.Element} Retorna a AppBar com título, botão de login e drawer com vídeos.
 */
function MenuAppBar() {
  return (
    <Box>
      {/* Barra superior fixa */}
      <AppBar position="static">
        <Toolbar>
          {/* Título do sistema */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Apoio à Decisão - SAD/DF
          </Typography>

          <Box sx={{ mr: 10}}>
            {/* Botão de login alinhado à direita */}
            <Button color="inherit">Login</Button>

            {/* Drawer contendo os vídeos */}
            <VideoDrawer sx={{ flexGrow: 1, mr: 2}}>
              {videos.map((video, index) => (
                <Box key={index}>
                  {/* Título de cada vídeo */}
                  <Typography variant="subtitle1">{video.title}</Typography>

                  {/* Player de vídeo do YouTube embedado */}
                  <iframe
                    width="100%"
                    height="315"
                    src={video.src}
                    title={`YouTube video player ${index}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </Box>
              ))}
            </VideoDrawer>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default MenuAppBar;
