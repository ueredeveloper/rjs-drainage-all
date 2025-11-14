import proj4 from "proj4";

// Definições JSDoc
// ----------------------------------------------------------------------

/**
 * @typedef {object} UTMtoDECInput
 * @property {number} easting - A coordenada Leste (Easting) no sistema UTM.
 * @property {number} northing - A coordenada Norte (Northing) no sistema UTM.
 * @property {number|string} zone - O número da zona UTM.
 * @property {'N'|'S'} hemisphere - O hemisfério da coordenada ('N' para Norte, 'S' para Sul).
 */

/**
 * @typedef {object} CoordsDEC
 * @property {number} lon - A longitude em graus decimais.
 * @property {number} lat - A latitude em graus decimais.
 */

// Funções de Conversão
// ----------------------------------------------------------------------

/**
 * Converte coordenadas de UTM (Universal Transverse Mercator) para Graus Decimais (WGS84).
 *
 * A função constrói a string de projeção Proj4 correta baseada na zona e hemisfério fornecidos.
 *
 * @param {UTMtoDECInput} params - Objeto contendo as coordenadas UTM e os parâmetros da projeção.
 * @returns {CoordsDEC} Um objeto contendo a longitude (lon) e a latitude (lat) em graus decimais.
 * @throws {Error} Se as coordenadas Easting ou Northing não forem números finitos.
 */
export const UtmToDec = ({ easting, northing, zone, hemisphere }) => {
  if (!isFinite(easting) || !isFinite(northing)) {
    throw new Error("As coordenadas devem ser números finitos.");
  }

  // 1. Define a string de projeção UTM (Proj4 string)
  const projUTM = hemisphere === "S"
    ? `+proj=utm +zone=${zone} +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs`
    : `+proj=utm +zone=${zone} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

  // 2. Executa a conversão: de projUTM para WGS84
  const [lon, lat] = proj4(projUTM, "WGS84", [easting, northing]);

  // 3. Retorna as coordenadas decimais
  return { lon, lat };
};

/**
 * Converte coordenadas de GMS (Graus, Minutos, Segundos) para Graus Decimais.
 *
 * A fórmula de conversão é: Decimal = |Grau| + Minuto/60 + Segundo/3600.
 * O valor é negado se a direção for Sul ('S') ou Oeste ('O').
 *
 * @param {number} deg - Os graus.
 * @param {number} min - Os minutos.
 * @param {number} sec - Os segundos.
 * @param {'N'|'S'|'L'|'O'|'E'|'W'} dir - A direção (Norte, Sul, Leste/Este, Oeste/Oeste).
 * @returns {number} A coordenada em graus decimais.
 */
export const GmsToDec = (deg, min, sec, dir) => {
  // 1. Calcula o valor absoluto em decimal
  let dec = Math.abs(deg) + min / 60 + sec / 3600;

  // 2. Aplica o sinal negativo para hemisférios Sul (Latitude) ou Oeste (Longitude)
  if (dir === "S" || dir === "O") {
    dec = -dec;
  }

  // 3. Retorna o valor decimal final
  return dec;
};