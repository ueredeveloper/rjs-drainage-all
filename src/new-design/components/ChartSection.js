import React from 'react';
import { Box, Typography } from '@mui/material';


export default function ChartSection({ id, title, height = 150, children }) {
  return (
    <Box id={id} sx={{ px: 2, pt: 1.2, pb: 0.5, flexShrink: 0 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {title}
      </Typography>
      <Box sx={{ height, mt: 0.5 }}>{children}</Box>
    </Box>
  );
}
