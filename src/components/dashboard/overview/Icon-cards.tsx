import { boarderRadius } from '@/utils';
import { Card, Link as MuiLink, Stack } from '@mui/material';
import { Envelope, Headphones } from '@phosphor-icons/react/dist/ssr';

export function IconCards({ type }) {
  return (
    <Stack>
      <Card
        sx={{
          borderRadius: boarderRadius.card,

          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        {type === 'Headphones' ? (
          <MuiLink
            href="tel:+12345678900"
            underline="none"
            color="inherit"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <Headphones size={24} weight="regular" />
          </MuiLink>
        ) : (
          <MuiLink
            href="mailto:info@intuity.com"
            underline="none"
            color="inherit"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <Envelope size={24} weight="regular" />
          </MuiLink>
        )}
      </Card>
    </Stack>
  );
}
