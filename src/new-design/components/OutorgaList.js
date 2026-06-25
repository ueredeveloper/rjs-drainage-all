import React from 'react';
import {
  List, ListItem, ListItemText, Avatar, Divider, Box, Typography, Stack, Chip,
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';


export function OutorgaListItem({ outorga, color = '#0277bd', bg = '#e1f5fe', Icon = WaterDropIcon }) {
  return (
    <>
      <ListItem alignItems="flex-start" sx={{ px: 2, py: 0.9, cursor: 'pointer', '&:hover': { bgcolor: '#f0f7ff' }, transition: 'background 0.12s' }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: bg, color, mr: 1.5, mt: 0.4, flexShrink: 0 }}>
          <Icon sx={{ fontSize: 17 }} />
        </Avatar>
        <ListItemText
          primaryTypographyProps={{ component: 'div' }}
          secondaryTypographyProps={{ component: 'div' }}
          primary={
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.77rem', color: '#1a237e', flex: 1 }}>
                {outorga.nome || outorga.us_nome}
              </Typography>
              <Chip label={`${outorga.vazao ?? ''} L/s`} size="small" sx={{ height: 18, fontSize: '0.59rem', fontWeight: 700, bgcolor: bg, color, flexShrink: 0 }} />
            </Stack>
          }
          secondary={
            <Stack direction="row" spacing={0.8} alignItems="center" mt={0.25}>
              <Typography variant="caption" sx={{ fontSize: '0.63rem', color: 'text.secondary' }}>{outorga.processo || outorga.int_processo}</Typography>
              <Typography variant="caption" sx={{ color: '#bdbdbd' }}>•</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.63rem', color: 'text.secondary' }}>{outorga.municipio || outorga.emp_endereco}</Typography>
            </Stack>
          }
        />
      </ListItem>
      <Divider component="li" sx={{ ml: 7 }} />
    </>
  );
}

export default function ScrollList({ items, color, bg, Icon }) {
  return (
    <List dense disablePadding sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#bdbdbd', borderRadius: 3 } }}>
      {items.length === 0
        ? <Box sx={{ py: 5, textAlign: 'center' }}><Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>Nenhum registro</Typography></Box>
        : items.map((o, i) => <OutorgaListItem key={o.id ?? i} outorga={o} color={color} bg={bg} Icon={Icon} />)
      }
    </List>
  );
}

