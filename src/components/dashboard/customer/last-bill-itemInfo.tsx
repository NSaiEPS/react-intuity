import React, { useState } from 'react';
import {
  Box,
  Collapse,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

// Your data object with multiple utility keys

export default function UtilityList({ data }) {
  const [expandedKey, setExpandedKey] = useState(null);

  // Handle expand/collapse toggle
  const toggleExpand = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // or manually check screen width
  return (
    <Grid container spacing={2} style={{}}>
      {Object?.entries(data).map(([key, items]: any) => {
        // Parse key parts: "WATER;1;48699537;40 PECAN COVE CT"
        const [utilityName, , meterNumber, ...addressParts] = key.split(';');
        const serviceAddress = addressParts.join(';'); // in case address has ';'

        // Calculate total amount and consumption (assuming all same)
        const totalAmount = items?.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalUnits = items[0]?.consumption || 0;

        // Determine if expanded
        const isExpanded = expandedKey === key;

        return (
          <Box
            key={key}
            mb={3}
            p={3}
            pr={0}
            bgcolor="#f9fafb"
            borderRadius={2}
            boxShadow={1}
            style={{
              width: '100%',
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              flexWrap="wrap"
              gap={1}
              mb={2}
            >
              <Box
                onClick={() => toggleExpand(key)}
                sx={{ cursor: 'pointer', flex: { xs: '1 1 100%', sm: '1 1 60%' } }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Utility
                </Typography>
                <Typography variant="body1" whiteSpace="normal">
                  <strong>{utilityName}</strong> - {meterNumber} - {serviceAddress}
                </Typography>
              </Box>

              <Box
                onClick={() => toggleExpand(key)}
                sx={{ cursor: 'pointer', textAlign: { xs: 'left', sm: 'right' }, minWidth: 100 }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Units
                </Typography>
                <Typography>{Number(totalUnits) ? totalUnits.toLocaleString() : '-'}</Typography>
              </Box>

              <Box
                onClick={() => toggleExpand(key)}
                sx={{ cursor: 'pointer', textAlign: { xs: 'left', sm: 'right' }, minWidth: 100 }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Amount
                </Typography>
                <Typography fontWeight="bold">${totalAmount.toFixed(2)}</Typography>
              </Box>

              <Box alignSelf={{ xs: 'flex-start', sm: 'center' }}>
                <IconButton aria-label="expand" onClick={() => toggleExpand(key)} size="small" sx={{ mt: -1 }}>
                  {isExpanded ? <CaretUp size={22} /> : <CaretDown size={22} />}
                </IconButton>
              </Box>
            </Box>

            {/* Expandable Content */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box bgcolor="white" borderRadius={1} mt={1} p={2} pr={5} boxShadow={0}>
                <List disablePadding>
                  {items.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        disableGutters
                        sx={{ py: 1 }}
                        secondaryAction={<Typography fontWeight="medium">${Number(item.amount).toFixed(2)}</Typography>}
                      >
                        <ListItemText primary={item.product_id} primaryTypographyProps={{ fontWeight: 'medium' }} />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}

                  {/* Total Row */}
                  <ListItem disableGutters sx={{ mt: 1, fontWeight: 600 }}>
                    <ListItemText primary="Total" />
                    {/* <Typography fontWeight="bold">{Number(totalUnits) ? totalUnits.toLocaleString() : '-'}</Typography> */}
                    <Typography fontWeight="bold" sx={{ ml: 4 }}>
                      ${totalAmount.toFixed(2)}
                    </Typography>
                  </ListItem>
                </List>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Grid>
  );
}
