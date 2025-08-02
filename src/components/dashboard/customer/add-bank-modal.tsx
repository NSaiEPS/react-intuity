'use client';

import { FC, useState } from 'react';
import { colors } from '@/utils';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Question, X } from '@phosphor-icons/react';

interface AddBankAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AddBankAccountModal: FC<AddBankAccountModalProps> = ({ open, onClose }) => {
  const [routingNumber, setRoutingNumber] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  const handleContinue = () => {
    if (!agreed) {
      alert('Please agree to the terms.');
      return;
    }
    console.log({ routingNumber, accountNumber, accountType });
    onClose();
  };

  const handleReset = () => {
    setRoutingNumber('');
    setAccountNumber('');
    setAccountType('');
    setAgreed(false);
  };

  const openPaper = Boolean(anchorEl);
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pl: 3 }}>
        Add Bank Account
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 10,
            top: 8,
            pr: 1.5,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            border: '1px solid #cfd8dc',
            borderRadius: 1,
            padding: 3,
            mt: 1,
          }}
        >
          {/* Help Section */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1rem',
                color: colors.blue,
              }}
            >
              Help me find my routing/account numbers
            </Typography>

            <Tooltip
              title={
                <Box
                  component="img"
                  src="/assets/cards_image.jpeg"
                  alt="Routing and Account Help"
                  sx={{ width: 270 }}
                />
              }
              placement="bottom"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#fff', // white background
                    boxShadow: 3, // subtle shadow
                    borderRadius: 2, // rounded corners
                    p: 1, // padding inside tooltip
                  },
                },
                arrow: {
                  sx: {
                    color: '#fff', // make the arrow white to match the background
                  },
                },
              }}
            >
              <IconButton sx={{ p: 0 }}>
                <Question size={20} color="#90caf9" weight="fill" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Routing Number"
              variant="standard"
              fullWidth
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
            />
            <TextField
              label="Account Number"
              variant="standard"
              fullWidth
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <FormControl variant="standard" fullWidth>
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select labelId="account-type-label" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <MenuItem value="checking">Checking</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
              label={
                <Typography variant="body2" color="text.secondary">
                  SANDBOX - I authorize Creative Technologies - Eldorado to store and enroll the bank account indicated
                  in this form for payment of one-time and/or auto recurring transactions for amounts due on my utility
                  account on or before the due date. I understand that the authorization will remain in effect until I
                  cancel it and that payments may be withdrawn from my account on the same or next banking business day
                  after it is originated.
                </Typography>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ gap: 1, mb: 2, pr: 3 }}>
        <Button
          onClick={handleContinue}
          variant="contained"
          sx={{
            backgroundColor: colors.blue,
            '&:hover': {
              backgroundColor: colors['blue.3'], // or any other hover color
            },
          }}
        >
          Continue
        </Button>
        <Button
          onClick={handleReset}
          variant="outlined"
          sx={{
            color: colors.blue,
            borderColor: colors.blue,
          }}
        >
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBankAccountModal;
