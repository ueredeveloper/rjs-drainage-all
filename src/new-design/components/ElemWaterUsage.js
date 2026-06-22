import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

/** Legenda de uso de água — cópia local para o novo design. */
const marks = [
    { value: 0, label: '0%', color: "#4cc94c" },
    { value: 10, label: '10%', color: "#007c00" },
    { value: 25, label: '25%', color: "#004700" },
    { value: 50, label: '50%', color: "#FFD32C" },
    { value: 75, label: '75%', color: "#FF2C2C" },
    { value: 90, label: '90%', color: "#F200FF" },
    { value: 100, label: '100%', color: "#F200FF" }
];

export default function ElemWaterUsage({ isFullscreen, isWaterAvailable }) {

    // Se tela cheia, mostra o slide que explica porcentagens de uso
    return (
        isFullscreen && isWaterAvailable ?
            <Box id="nd-water-usage" sx={{
                display: "flex", justifyContent: "center", alignItems: "center",
                backgroundColor: "#FFF",
                boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
                px: 2, height: 50, mb: 2,
                maxWidth: 600, minWidth: 360,
            }}>
                <Slider
                    aria-label="Custom marks"
                    marks={marks}
                    value={0} // valor fixo
                    disabled // não interativo
                    sx={{
                        height: 8,
                        width: "clamp(300px, 36dvw, 540px)",
                        '& .MuiSlider-thumb': {
                            display: 'none'
                        },
                        '& .MuiSlider-rail': {
                            opacity: 1,
                            background: `linear-gradient(to right,
              ${marks[0].color} 0% ${marks[1].value}%,
              ${marks[1].color} ${marks[1].value}% ${marks[2].value}%,
              ${marks[2].color} ${marks[2].value}% ${marks[3].value}%,
              ${marks[3].color} ${marks[3].value}% ${marks[4].value}%,
              ${marks[4].color} ${marks[4].value}% ${marks[5].value}%,
              ${marks[5].color} ${marks[5].value}% 100%
            )`
                        },
                        '& .MuiSlider-track': {
                            background: 'transparent' // sem preenchimento
                        },
                        '& .MuiSlider-markLabel': {
                            fontSize: '0.786rem',
                            color: '#CCCCC', // Change to your desired color
                        }
                    }}
                />
            </Box> : <Box id="nd-water-usage-hidden"></Box>
    );
}
