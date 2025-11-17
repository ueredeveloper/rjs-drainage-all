import { Box, Typography, Link } from "@mui/material";
import packageJson from "../package.json"; // ajuste o caminho conforme seu projeto

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        
        mt: "auto",
        py: 1,
        px: 2,
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
        SAD/DF – Versão {packageJson.version}
      </Typography>

      <Link
        href="mailto:outorga@adasa.df.gov.br"
        underline="none"
        sx={{ fontSize: 10 }}
      >
        outorga@adasa.df.gov.br
      </Link>
    </Box>
  );
}
