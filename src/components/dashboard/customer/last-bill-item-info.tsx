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
} from '@mui/material';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

interface BillingItem {
  id: string | number;
  product_id: string;
  amount: string | number;
  consumption?: number;
}

export default function UtilityList({ data }) {
  // Set so multiple sections can be open at the same time
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const entries = Object.entries(data as Record<string, BillingItem[]>);

  return (
    <Box>
      {/* ── Column header row ── */}
      <Grid
        container
        sx={{
          px: 1,
          pb: 1,
          borderBottom: '2px solid #d0d5dd',
        }}
      >
        <Grid item xs={6}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            Utility
          </Typography>
        </Grid>
        <Grid item xs={3} sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            Units
          </Typography>
        </Grid>
        <Grid item xs={3} sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            Amount
          </Typography>
        </Grid>
      </Grid>

      {/* ── One row per utility group ── */}
      {entries.map(([key, items]) => {
        // const [utilityName,  meterNumber, ...addressParts] = key.split(';');
        // const serviceAddress = addressParts.join(';');
        const parts = key.split(";");

        const utilityName = parts[0];
        const meterNumber = parts[1];
        const serviceAddress = parts.slice(2).filter(Boolean).join(" ");


        // Suppression: skip items with null/blank description or null amount
        const visibleItems = items?.filter(
          (item) =>
            item?.product_id != null &&
            String(item.product_id).trim() !== '' &&
            item?.amount != null
        );

        const totalAmount = visibleItems?.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        );
        const totalUnits = items[0]?.consumption || 0;
        const isExpanded = expandedKeys.has(key);

        return (
          <React.Fragment key={key}>
            {/* Utility summary row */}
            <Grid
              container
              alignItems="center"
              sx={{
                px: 1,
                py: 1.5,
                borderBottom: '1px solid #e4e7ec',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
              onClick={() => toggleExpand(key)}
            >
              {/* Utility name */}
              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); toggleExpand(key); }}
                    sx={{ p: 0.25, flexShrink: 0 }}
                  >
                    {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
                  </IconButton>
                  <Typography variant="body2">
                    <strong style={{ textDecoration: 'underline' }}>{utilityName}</strong>
                    {' '}- {meterNumber} - {serviceAddress}
                  </Typography>
                </Box>
              </Grid>

              {/* Units */}
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {Number(totalUnits) ? totalUnits.toLocaleString() : '-'}
                </Typography>
              </Grid>

              {/* Amount — rightmost, aligns with summary rows below */}
              <Grid item xs={3} sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="bold">
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>

            {/* Expandable line items */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ bgcolor: '#fafbfc' }}>
                {visibleItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      disableGutters
                      sx={{ px: 5, py: 0.75 }}
                      secondaryAction={
                        <Typography variant="body2" fontWeight="medium" sx={{ pr: 1 }}>
                          ${Number(item.amount).toFixed(2)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={item.product_id}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
