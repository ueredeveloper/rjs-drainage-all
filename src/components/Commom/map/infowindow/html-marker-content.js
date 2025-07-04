import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { setInfoMarkerIcon } from "../../../../tools";

/**
 * Componente de conteúdo para InfoWindow de marcadores no mapa.
 *
 * Este componente renderiza informações detalhadas de um marcador em um layout
 * estruturado usando Material-UI. Inclui cabeçalho colorido, ícone SVG dinâmico
 * e seção de informações com scroll quando necessário.
 *
 * @component
 * @example
 * // Exemplo de uso básico
 * <HTMLMarkerContent
 *   color="#1976d2"
 *   info={{
 *     id: 1,
 *     ti_id: 2,
 *     tp_id: 3,
 *     ti_descricao: "Tipo Interferência",
 *     tp_descricao: "Tipo Processo",
 *     to_descricao: "Captação",
 *     sp_descricao: "Ativo",
 *     us_nome: "João Silva",
 *     us_cpf_cnpj: "123.456.789-00",
 *     int_num_ato: "12345/2023",
 *     emp_endereco: "Rua das Flores, 123",
 *     int_processo: "PROC-2023-001",
 *     int_latitude: -23.5505,
 *     int_longitude: -46.6333,
 *     bh_nome: "Bacia do Rio Tietê",
 *     uh_nome: "Unidade Alto Tietê"
 *   }}
 * />
 *
 * @param {Object} props - Propriedades do componente
 * @param {string} [props.color] - Cor de fundo do cabeçalho em formato hexadecimal (ex: "#ffffff")
 *                                 Se não fornecida, usa a cor primária do tema
 * @param {Object} props.info - Objeto contendo todas as informações do marcador
 * @param {number|string} props.info.id - Identificador único do marcador
 * @param {number|string} props.info.ti_id - ID do tipo de interferência
 * @param {number|string} props.info.tp_id - ID do tipo de processo
 * @param {string} props.info.ti_descricao - Descrição do tipo de interferência
 * @param {string} props.info.tp_descricao - Descrição do tipo de processo
 * @param {string} props.info.to_descricao - Descrição do tipo de outorga
 * @param {string} props.info.sp_descricao - Descrição da situação do processo
 * @param {string} props.info.us_nome - Nome do usuário/requerente
 * @param {string} props.info.us_cpf_cnpj - CPF ou CNPJ do usuário
 * @param {string} props.info.int_num_ato - Número do ato/documento
 * @param {string} props.info.emp_endereco - Endereço do empreendimento
 * @param {string} props.info.int_processo - Número do processo
 * @param {number|string} props.info.int_latitude - Latitude da interferência
 * @param {number|string} props.info.int_longitude - Longitude da interferência
 * @param {string} props.info.bh_nome - Nome da bacia hidrográfica
 * @param {string} props.info.uh_nome - Nome da unidade hidrográfica
 *
 * @returns {React.ReactElement} Componente Paper do Material-UI contendo as informações formatadas
 *
 * @requires react
 * @requires @mui/material
 * @requires @mui/material/styles
 * @requires ../../../../tools (função setInfoMarkerIcon)
 *
 * @since 1.0.0
 */
const HTMLMarkerContent = ({ color, info }) => {
    /**
     * Hook para acessar o tema atual do Material-UI
     * Usado como fallback quando a cor não é fornecida via props
     * @type {import('@mui/material/styles').Theme}
     */
    const theme = useTheme();

    /**
     * Obtém o SVG do ícone baseado nos IDs do marcador
     *
     * @type {string} - String contendo o código SVG do ícone
     * @function setInfoMarkerIcon
     * @memberof external:tools
     * @param {number|string} id - ID do marcador
     * @param {number|string} ti_id - ID do tipo de interferência
     * @param {number|string} tp_id - ID do tipo de processo
     * @returns {Object} Objeto contendo propriedade 'iw' com o SVG
     */
    const svgData = setInfoMarkerIcon(info.id, info.ti_id, info.tp_id).iw;

    return (
        <Paper
            elevation={2}
            sx={{
                width: "100%",
                minWidth: 320,
                maxWidth: 400,
            }}
        >
            {/* Cabeçalho com informações principais */}
            <Box
                sx={{
                    backgroundColor: color || theme.palette.primary.main,
                    color: "white",
                    p: 1.5,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {/* Tipo de interferência */}
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                    {info.ti_descricao}
                </Typography>

                {/* Tipo de processo */}
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                    {info.tp_descricao}
                </Typography>
            </Box>

            {/* Corpo do conteúdo com informações detalhadas */}
            <Box
                sx={{
                    p: 2,
                    maxHeight: "180px",
                    overflowY: "auto", // Scroll vertical quando necessário
                }}
            >
                {/* Cabeçalho da seção de informações com ícone */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Informações
                    </Typography>

                    {/* Ícone SVG dinâmico */}
                    <object
                        type="image/svg+xml"
                        data={`data:image/svg+xml,${encodeURIComponent(svgData)}`}
                        style={{ width: 70, height: 70 }}
                        aria-label="Ícone do marcador"
                    />
                </Box>

                {/* Lista de informações detalhadas */}
                <Box
                    sx={{
                        fontSize: 13,
                        lineHeight: "18px",
                        fontWeight: 400,
                    }}
                >
                    {/* Tipo de outorga */}
                    <Typography variant="body2">
                        <strong>Tipo:</strong> {info.to_descricao}
                    </Typography>

                    {/* Situação do processo */}
                    <Typography variant="body2">
                        <strong>Situação:</strong> {info.sp_descricao}
                    </Typography>

                    {/* Nome do requerente */}
                    <Typography variant="body2">
                        <strong>Nome:</strong> {info.us_nome}
                    </Typography>

                    {/* CPF/CNPJ */}
                    <Typography variant="body2">
                        <strong>CPF:</strong> {info.us_cpf_cnpj}
                    </Typography>

                    {/* Número do ato */}
                    <Typography variant="body2">
                        <strong>Número do Ato:</strong> {info.int_num_ato}
                    </Typography>

                    {/* Endereço do empreendimento */}
                    <Typography variant="body2">
                        <strong>Endereço:</strong> {info.emp_endereco}
                    </Typography>

                    {/* Número do processo */}
                    <Typography variant="body2">
                        <strong>Processo:</strong> {info.int_processo}
                    </Typography>

                    {/* Coordenadas geográficas */}
                    <Typography variant="body2">
                        <strong>Coordenadas:</strong> {info.int_latitude},{" "}
                        {info.int_longitude}
                    </Typography>

                    {/* Bacia hidrográfica */}
                    <Typography variant="body2">
                        <strong>Bacia Hidrográfica:</strong> {info.bh_nome}
                    </Typography>

                    {/* Unidade hidrográfica */}
                    <Typography variant="body2">
                        <strong>Unidade Hidrográfica:</strong> {info.uh_nome}
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default HTMLMarkerContent;
