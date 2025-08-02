'use client';

import * as React from 'react';
import { colors } from '@/utils';
import { Button, CardActions, Dialog, DialogActions, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';

import AddBankAccountModal from './add-bank-modal';
import AddCardModal from './add-card-modal';
import { PaymentMethods } from './payment-methods';

export interface CardDetails {
  name: string;
  number: string;
  type: string;
  createdAt: Date;
  id: number;
}

export function SelectPaymentMethod(): React.JSX.Element {
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const page = 0;
  const rowsPerPage = 10;

  return (
    <Grid>
      <Typography
        variant="h6"
        sx={{
          // color: 'primary.main',
          color: colors.blue,

          cursor: 'pointer',
          display: 'inline-block',
          transition: 'border-bottom 0.2s ease',
          borderBottom: '2px solid transparent',
          '&:hover': {
            borderBottom: '2px solid',
            borderColor: colors['blue.1'],
          },
        }}
        onClick={() => setOpenPaymentModal(true)}
      >
        Select Payment Method
      </Typography>

      {/* <AddCardModal open={cardModalOpen} onClose={() => setCardModalOpen(false)} /> */}
      <Dialog open={openPaymentModal} maxWidth="lg" fullWidth>
        <PaymentMethods
          onClose={() => {
            setOpenPaymentModal(false);
          }}
          isModal={true}
          count={10}
          page={page}
          rows={[]}
          rowsPerPage={rowsPerPage}
        />
      </Dialog>
    </Grid>
  );
}

function applyPagination(rows: CardDetails[], page: number, rowsPerPage: number): CardDetails[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
