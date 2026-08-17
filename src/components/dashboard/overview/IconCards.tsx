import { boarderRadius } from '@/utils';
import { Card, Link as MuiLink, Stack } from '@mui/material';
import { Envelope, Headphones, Globe } from '@phosphor-icons/react/dist/ssr';

interface IconCardsProps {
  type: string;
  href?: string;
}

export function IconCards({ type, href }: IconCardsProps) {
  const Icon =
    type === 'Headphones'
      ? Headphones
      : type === 'Website'
      ? Globe
      : Envelope;

  const cardContent = <Icon size={24} weight="regular" />;

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
        {href ? (
          <MuiLink
            href={href}
            target={type === 'Website' ? '_blank' : undefined}
            rel={type === 'Website' ? 'noopener noreferrer' : undefined}
            underline="none"
            color="inherit"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            {cardContent}
          </MuiLink>
        ) : (
          cardContent
        )}
      </Card>
    </Stack>
  );
}

