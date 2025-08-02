'use client';

import * as React from 'react';
import { boarderRadius, colors } from '@/utils';
import { Button, CardActions, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import { Stack } from '@mui/system';

export function NewDetailsForm(): React.JSX.Element {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card sx={{ mt: 3, borderRadius: boarderRadius.card }}>
        <CardHeader title="New Information" />

        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel htmlFor="account-name">Account name</InputLabel>
                <OutlinedInput id="account-name" name="firstName" defaultValue="" label="Account name" />
              </FormControl>
            </Grid>

            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Primary Phone </InputLabel>
                <OutlinedInput
                  label="Primary Phone"
                  name="phone"
                  type="tel"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Alt Phone </InputLabel>
                <OutlinedInput
                  label="Alt Phone "
                  name="phone"
                  type="tel"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={1}>
            <Grid xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="h6">I am the *</Typography>

                <RadioGroup row name="preferredOwnerMethod" defaultValue="Owner">
                  <FormControlLabel value="Owner" control={<Radio />} label="Owner" />
                  <FormControlLabel value="Tenant" control={<Radio />} label="Tenant" />
                </RadioGroup>
              </Stack>
            </Grid>
          </Grid>
          <Grid md={12} xs={12} p={0} pt={3}>
            <FormControl fullWidth required>
              <InputLabel>Comment</InputLabel>
              <OutlinedInput defaultValue="" label="Comment" name="comment" multiline />
            </FormControl>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            sx={{
              color: colors.blue,
              borderColor: colors.blue,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.blue,
              '&:hover': {
                backgroundColor: colors['blue.3'], // or any other hover color
              },
            }}
          >
            Save
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
