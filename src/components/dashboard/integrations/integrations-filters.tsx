import * as React from 'react';
import { boarderRadius } from '@/utils';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export function CompaniesFilters(): React.JSX.Element {
  return (
    <Card
      sx={{
        p: 2,

        borderRadius: boarderRadius.card,
      }}
    >
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Search integration"
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px' }}
      />
    </Card>
  );
}
