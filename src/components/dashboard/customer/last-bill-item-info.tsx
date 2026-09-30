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
  id?: string | number;
  product_id?: string | null;
  amount?: string | number | null;
  consumption?: number | null;
  [key: string]: any;
}

interface UtilityListProps {
  data?: Record<string, BillingItem[]> | null;
}

export default function UtilityList({ data }: UtilityListProps) {
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

  const entries = Object.entries((data ?? {}) as Record<string, BillingItem[]>);

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
        const parts = key.split(";");

        const utilityName = parts[0];
        const meterNumber = parts[1];
        const serviceAddress = parts.slice(2).filter(Boolean).join(" ");

        const lineItems = items ?? [];

        const totalAmount = lineItems.reduce(
          (sum, item) => sum + (item?.amount != null && !isNaN(Number(item.amount)) ? Number(item.amount) : 0),
          0
        );
        const totalUnits = items?.[0]?.consumption || 0;
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
                {lineItems.map((item, index) => (
                  <React.Fragment key={item?.id ?? index}>
                    <ListItem
                      disableGutters
                      sx={{ px: 5, py: 0.75 }}
                      secondaryAction={
                        item?.amount != null && !isNaN(Number(item.amount)) ? (
                          <Typography variant="body2" fontWeight="medium" sx={{ pr: 1 }}>
                            ${Number(item.amount).toFixed(2)}
                          </Typography>
                        ) : null
                      }
                    >
                      <ListItemText
                        primary={item?.product_id && String(item.product_id).trim() ? item.product_id : '\u00A0'}
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
