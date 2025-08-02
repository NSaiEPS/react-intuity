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
  Divider,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { X } from '@phosphor-icons/react';

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

const AddCardModal: FC<AddCardModalProps> = ({ open, onClose }) => {
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [expiryMonth, setExpiryMonth] = useState<string>('');
  const [expiryYear, setExpiryYear] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);

  const handleContinue = () => {
    if (!agreed) {
      alert('Please agree to the terms.');
      return;
    }
    console.log({ cardNumber, cvv, expiryMonth, expiryYear });
    onClose();
  };

  const handleReset = () => {
    setCardNumber('');
    setCvv('');
    setExpiryMonth('');
    setExpiryYear('');
    setAgreed(false);
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pl: 3 }}>
        Add New Card
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
          {/* Card Logos - replace with icons if needed */}
          <Box display="flex" gap={1} mb={2}>
            <img src="/assets/cards_image.jpeg" alt="Cards" width={140} />
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Card Number"
              variant="standard"
              fullWidth
              value={cardNumber}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ''); // remove all non-digits
                if (value.length > 16) value = value.slice(0, 16); // limit to 16 digits
                const parts = value.match(/.{1,4}/g); // split every 4 digits
                setCardNumber(parts ? parts.join('-') : '');
              }}
            />
            <TextField
              label="CVV"
              variant="standard"
              sx={{ width: 100 }}
              value={cvv}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3) value = value.slice(0, 3);
                setCvv(value);
              }}
            />
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Expiration
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                label="MM"
                variant="standard"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                inputProps={{ maxLength: 2 }}
                sx={{ width: 40 }}
              />
              <Typography mt={4}>/</Typography>
              <TextField
                label="YY"
                variant="standard"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                inputProps={{ maxLength: 2 }}
                sx={{ width: 40 }}
              />
            </Box>
          </Box>

          <FormControlLabel
            control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
            label={
              <Typography variant="body2" color="text.secondary">
                Sandbox - I authorize Creative Technologies - Eldorado to store and enroll the credit card indicated in
                this form for payment of one-time and/or auto recurring transactions for amounts due on my utility
                account on or before the due date. I understand that the authorization will remain in effect until I
                cancel it and that payments may be withdrawn from my account on the same or next banking business day
                after it is originated.
              </Typography>
            }
            sx={{ alignItems: 'flex-start' }}
          />
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
          // sx={{ background: 'linear-gradient(to right, #43e97b, #38f9d7)' }}
        >
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCardModal;
