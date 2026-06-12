import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export default function SectionLabel({ title, count }) {
  return (
    <Box sx={{ px: 2, py: 0.7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fafafa' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '0.6rem' }}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip label={`${count} resultado${count !== 1 ? 's' : ''}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#e3f2fd', color: '#1565c0' }} />
      )}
    </Box>
  );
}
