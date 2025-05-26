import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const rows = [
  {
    name: "QSOLICITADA-SEÇÃO",
    values: [
      50,
      50,
      50,
      50,
      50,
      50,
      50,
      50,
      50,
      50,
      50,
      50
    ]
  },
  {
    name: "SQOUTORGADA-MONT.-SEÇÃO",
    values: [
      "22.37",
      "22.30",
      "22.54",
      "22.18",
      "21.23",
      "20.81",
      "20.39",
      "19.78",
      "19.35",
      "19.67",
      "20.39",
      "21.15"]
  },
  {
    name: "QREFERÊNCIA-SEÇÃO (Regionalizada)",
    values: [
      "371.95",
      "364.80",
      "388.80",
      "351.92",
      "255.76",
      "213.23",
      "170.80",
      "133.04",
      "119.45",
      "131.45",
      "170.80",
      "247.73"
    ],

  },
  {
    name: "QOUTORGÁVEL-SEÇÃO (80% QREFERÊNCIA-SEÇÃO)",
    values: [
      "297.56",
      "291.84",
      "311.04",
      "281.54",
      "204.61",
      "170.58",
      "136.64",
      "106.43",
      "95.56",
      "105.16",
      "136.64",
      "198.18"
    ]
  },
  {
    name: "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
    decimais: [
      {
        "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (20% QOUTORGÁVEL-SEÇÃO)",
        "decimal": 0.2
      },
      {
        "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (70% QOUTORGÁVEL-SEÇÃO)",
        "decimal": 0.7
      },
      {
        "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (80% QOUTORGÁVEL-SEÇÃO)",
        "decimal": 0.8
      },
      {
        "alias": "QOUTORGÁVEL-INDIVIDUAL-SEÇÃO (90% QOUTORGÁVEL-SEÇÃO)",
        "decimal": 0.9
      }
    ],
    values: [
      "59.51",
      "58.37",
      "62.21",
      "56.31",
      "40.92",
      "34.12",
      "27.33",
      "21.29",
      "19.11",
      "21.03",
      "27.33",
      "39.64"
    ]
  },
  {
    name: "QDISPONÍVEL-SEÇÃO",
    values: [
      "275.19",
      "269.54",
      "288.50",
      "259.36",
      "183.38",
      "149.77",
      "116.25",
      "86.65",
      "76.21",
      "85.49",
      "116.25",
      "177.03"
    ]
  },
  {
    name: "QSOLICITADA-SEÇÃO ≤ QDISPONÍVEL-SEÇÃO",
    values: [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      true
    ]
  },
  {
    name: "QSOLICITADA-SEÇÃO ≤ QOUTORGÁVEL-INDIVIDUAL-SEÇÃO",
    values: [
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]
  }
];

function formatValue(value) {
  if (value === true) {
    return "SIM";
  } else if (value === false) {
    return "NÃO";
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else {
    return "";
  }
}


export default function SufaceTable() {

  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];


  return (

    <TableContainer id="table-container-box" component={Paper} elevation={4}  sx={{ marginLeft: '-1.5rem', paddingRight: '3rem', minWidth: "100%", maxHeight: "250px" }}>
      <Table sx={{ minWidth: "100%", paddingLeft: "0px" }} size="small" >
        <TableHead>
          <TableRow>
            <TableCell sx={{ padding: "0px", px: "5px", fontSize: "12px", width: "60rem", lineHeight: "1.1rem" }}>Quadro de Vazões (L/s)</TableCell>
            {months.map((value) => (
              <TableCell key={value} align="right" sx={{ lineHeight: "1.1rem" }}>{value}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem", width: "100px" }}>
                {row.name}
              </TableCell >
              {row.values.map((value) =>
                (<TableCell key={value} align="right" sx={{ padding: "0px", px: "5px", fontSize: "12px", lineHeight: "1.1rem" }}>{formatValue(value)}</TableCell>)
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

  );
}
