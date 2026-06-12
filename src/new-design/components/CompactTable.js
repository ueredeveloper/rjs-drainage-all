import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';

export default function CompactTable({ headers, rows, onRowClick }) {
  return (
    <TableContainer sx={{
      overflowX: 'auto', overflowY: 'auto', maxHeight: '100%',
      '&::-webkit-scrollbar': { width: 8, height: 8 },
      '&::-webkit-scrollbar-thumb': { bgcolor: '#b0bec5', borderRadius: 4, border: '2px solid transparent', backgroundClip: 'content-box' },
      '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
    }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.map(h => (
              <TableCell key={h} sx={{ bgcolor: '#f5f7fa', fontWeight: 700, fontSize: '0.62rem', color: '#455a64', py: 0.8, borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap' }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={i}
              onClick={() => onRowClick && onRowClick(i)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': { bgcolor: '#f0f7ff' },
                transition: 'background 0.1s',
              }}
            >
              {row.map((cell, j) => (
                <TableCell key={j} sx={{ fontSize: '0.68rem', py: 0.75 }}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
