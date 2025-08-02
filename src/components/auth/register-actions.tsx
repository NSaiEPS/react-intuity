import { Box, Paper, Typography } from '@mui/material';
import { CalendarCheck, Headphones, Leaf, Megaphone } from '@phosphor-icons/react';

const quickActions = [
  { icon: <Leaf size={15} weight="fill" />, label1: 'Go', label2: 'Paperless' },
  {
    icon: <CalendarCheck size={15} weight="fill" />,
    label1: 'Configure',
    label2: 'Autopay',
  },
  {
    icon: <Headphones size={15} weight="fill" />,
    label1: 'Request',
    label2: 'Support',
  },
  {
    icon: <Megaphone size={15} weight="fill" />,
    label1: 'Receive',
    label2: 'Alerts',
  },
];

export default function QuickActionsBox() {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#f5f5f5',
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: '100%',
        mx: 'auto',
        height: 50,
        overflow: 'hidden',
      }}
    >
      {quickActions.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textAlign: 'left',
            width: 150,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ color: 'black', alignItems: 'center', marginTop: '3.5px' }}>{item.icon}</Box>
          <Box sx={{ lineHeight: 1.1 }}>
            <Typography
              sx={{
                // fontSize: '11px',
                fontSize: { xs: '8px', sm: '9px', md: '12px' }, // xs <600px, sm ≥600px, md ≥900px

                fontWeight: 500,
                color: '#444',
                lineHeight: 1.1,
              }}
            >
              {item.label1} {` `}
              {item.label2}
            </Typography>
            {/* <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 500,
                color: '#444',
                lineHeight: 1.1,
              }}
            >
              {item.label2}
            </Typography> */}
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
