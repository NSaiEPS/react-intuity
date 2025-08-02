'use client';

import * as React from 'react';
import { colors } from '@/utils';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Button } from 'nsaicomponents';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loader?: boolean;
};

export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loader = false,
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        sx={{
          minWidth: '400px',
        }}
      >
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3, // padding left and right (3 * 8 = 24px)
          py: 2, // padding top and bottom (2 * 8 = 16px)
        }}
      >
        <Button
          onClick={onCancel}
          color="inherit"
          variant="outlined"
          textTransform="none"
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            borderRadius: '12px',
            height: '41px',
          }}
          disabled={loader}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loader}
          loading={loader}
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors['blue.3']}
          hoverColor="white"
          style={{
            borderRadius: '12px',
            height: '41px',
            backgroundColor: colors.blue,
            color: 'white',
            // backgroundColor: 'red',
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
