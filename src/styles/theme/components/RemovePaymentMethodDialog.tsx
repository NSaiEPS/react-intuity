import * as React from "react";
import { colors, decryptFunction } from "@/utils";
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    Stack,
    Typography,
} from "@mui/material";
import { Button } from "nsaicomponents";
import { Box } from "@mui/system";
import { Trash } from '@phosphor-icons/react';
// import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

// NOTE: these already exist elsewhere in the codebase (per the snippets provided).
// Adjust the import path if they don't live in "@/utils".
const CARD_TYPE_ICON_MAP: Record<string, string> = {
    VISA: 'visa.png',
    // MC: 'master-card.png',
    // MASTERCARD: 'master-card.png',
    DISC: 'discover.png',
    DISCOVER: 'discover.png',
    AMEX: 'american-express.png',
    AMERICANEXPRESS: 'american-express.png',
};

const DEFAULT_CARD_ICON = '/assets/cards/default-card.png';
const BANK_ACCOUNT_ICON = '/assets/cards/bank-account.png';

function getCardIconSrc(cardType?: string | null): string {
    if (!cardType) return BANK_ACCOUNT_ICON;

    const key = cardType.replace(/[\s-]/g, '').toUpperCase();
    const matchedFileName = CARD_TYPE_ICON_MAP[key];
    if (!matchedFileName) return DEFAULT_CARD_ICON;

    return `/assets/cards/${matchedFileName}`;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CardDetails = {
    /** Present only for credit/debit cards. e.g. "Visa", "Mastercard" */
    card_type?: string;
    /** Encrypted account/card number — decrypted via decryptFunction */
    number: string;
    /** Card-only */
    expiration_month?: number | string;
    expiration_year?: number | string;
    /** Bank-account-only, e.g. "Checking", "Savings" */
    account_type?: string;
    /** Bank-account-only, e.g. "Wells Fargo" */
    bank_name?: string;
};

type ConfirmDialogProps = {
    open: boolean;
    title?: React.ReactNode;
    message?: string;
    footerMessage?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loader?: boolean;
    checkBox?: boolean;
    details?: React.ReactNode;
};

/* ------------------------------------------------------------------ */
/*  Base ConfirmDialog (unchanged behaviour, `title` now accepts a     */
/*  ReactNode so we can render the icon + heading shown in the mock)   */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
    open,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    footerMessage,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    loader = false,
    checkBox = false,
    details,
}: ConfirmDialogProps): React.JSX.Element {
    const [checked, setChecked] = React.useState(false);

    // Reset checkbox when dialog closes
    React.useEffect(() => {
        if (!open) setChecked(false);
    }, [open]);

    return (
        <Dialog
            open={open}
            PaperProps={{
                sx: {
                    
                    m: { xs: 0, sm: 4 },
                    width: { xs: "95%", sm: "auto" },
                    maxWidth: { xs: "100%", sm: "60%", md:"40%" },
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    p: 2,
                    pb: { xs: 1, sm: 2 },
                }}
            >
                {title}
            </DialogTitle>

            <DialogContent
                sx={{
                    minWidth: {xs:"80%", sm: "400px" },
                    px: 2,
                    py: 0,
                    m: 0,
                    wordBreak: "break-word",
                }}
            >
                {checkBox ? (
                    <FormControlLabel
                        style={{ margin: 0 }}
                        control={
                            <Checkbox
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                                color="primary"
                                size="small"
                                sx={{ m: 0 }}
                            />
                        }
                        label={
                            <DialogContentText
                                sx={{
                                    whiteSpace: "pre-line",
                                    fontSize: { xs: "0.85rem", sm: "1rem" },
                                    textAlign: "center",
                                }}
                            >
                                {message}
                            </DialogContentText>
                        }
                        sx={{
                            alignItems: "flex-start",
                            mt: 1,
                        }}
                    />
                ) : (
                    <DialogContentText
                        sx={{
                            whiteSpace: "pre-line",
                            fontSize: { xs: "0.85rem", sm: "1rem" },
                            textAlign: "center",
                        }}
                    >
                        {message}
                    </DialogContentText>
                )}

                {details && <Box sx={{ my: 2 }}>{details}</Box>}

                {footerMessage && (
                    <DialogContentText
                        sx={{
                            maxWidth:{xs:"100%", sm:'80%'},
                            mx:'auto',
                            whiteSpace: "pre-line",
                            fontSize: { xs: "0.85rem", sm: "1rem" },
                            textAlign: "center",
                            mb: 1,
                        }}
                    >
                        {footerMessage}
                    </DialogContentText>
                )}
            </DialogContent>

            <Divider sx={{mt:1}}/>

            <DialogActions
                sx={{
                    display:'flex',
                    justifyContent:'space-between',
                    p: 2,
                    gap: 1,
                }}
            >
                <Button
                    onClick={onCancel}
                    color="inherit"
                    variant="outlined"
                    size="small"
                    textTransform="none"
                    disabled={loader}
                    style={{
                        color: colors.blue,
                        borderColor: colors.blue,
                        borderRadius: "12px",
                        background: "white",
                    }}
                >
                    {cancelLabel}
                </Button>

                <Button
                    onClick={onConfirm}
                    disabled={loader || (checkBox && !checked)}
                    loading={loader}
                    variant="contained"
                    size="small"
                    textTransform="none"
                    bgColor={colors.blue}
                    hoverBackgroundColor={colors["blue.3"]}
                    hoverColor="white"
                    style={{
                        borderRadius: "12px",
                        backgroundColor: colors.red,
                        color: "white",
                    }}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** True only for cards (bank accounts never expire in this flow). */
function isCardExpired(details: CardDetails): boolean {
    if (!details.card_type || !details.expiration_month || !details.expiration_year) {
        return false;
    }
    const month = Number(details.expiration_month);
    let year = Number(details.expiration_year);
    if (String(details.expiration_year).length === 2) year += 2000;
    if (!month || !year) return false;

    // Last moment of the expiration month, e.g. 04/27 -> end of April 30 2027
    const expiryEnd = new Date(year, month, 0, 23, 59, 59);
    return expiryEnd.getTime() < Date.now();
}

function formatExpiry(details: CardDetails): string {
    const { expiration_month: month, expiration_year: year } = details;
    if (!month || !year) return "";
    const mm = String(month).padStart(2, "0");
    const yy = String(year).length === 4 ? String(year).slice(-2) : String(year).padStart(2, "0");
    return `${mm}/${yy}`;
}

/* ------------------------------------------------------------------ */
/*  Header: red trash icon in a circle + bold centered heading,        */
/*  matching the provided mock                                         */
/* ------------------------------------------------------------------ */

function DialogHeading({ label }: { label: string }) {
    return (
        <Stack alignItems="center" spacing={1.5} sx={{ pt: 1 }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "#FDEBEC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#E12B2B",
                    fontSize: 28
                }}
            >
                <Trash />
            </Box>
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                    textAlign: "center",
                }}
            >
                {label}
            </Typography>
        </Stack>
    );
}

/* ------------------------------------------------------------------ */
/*  Card / bank-account summary chip shown inside the dialog body      */
/* ------------------------------------------------------------------ */

function PaymentMethodSummary({ details }: { details: CardDetails }) {
    const isCard = !!details.card_type;
    const decryptedNumber = decryptFunction(details.number);
    const last4 = String(decryptedNumber).slice(-4);
    const iconSrc = getCardIconSrc(details.card_type);
    const expiryDisplay = isCard ? formatExpiry(details) : "";

    const primaryLabel = isCard ? details.card_type : details.bank_name ?? "Bank Account";

    return (
        <Stack
            direction="row"
            alignItems="center"
            margin={"auto"}
            spacing={1.5}
            sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#F8FAFC",
                maxWidth: {xs: "100%",sm:"60%"}
            }}
        >
            <Box
                sx={{
                    width: 52,
                    height: 34,
                    borderRadius: 1,
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <img
                    src={iconSrc}
                    alt={isCard ? details.card_type : "Bank Account"}
                    style={{ maxWidth: "80%", width: "auto", height: "80%", objectFit: "contain" }}
                    onError={(e) => {
                        const fallback = isCard ? DEFAULT_CARD_ICON : BANK_ACCOUNT_ICON;
                        if (e.currentTarget.src.indexOf(fallback) === -1) {
                            e.currentTarget.src = fallback;
                        }
                    }}
                />
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} sx={{ fontSize: "0.85rem" }}>
                    {primaryLabel} ending in {last4}
                </Typography>
                {!isCard && details.account_type && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {details.account_type}
                    </Typography>
                )}
                {expiryDisplay && (
                    <Typography sx={{ fontSize: "0.78rem" }} color="text.secondary">
                        Expires {expiryDisplay}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export type RemovePaymentMethodDialogProps = {
    open: boolean;
    /** The payment method being removed. Card if `card_type` is set, else a bank account. */
    details?: CardDetails;
    onConfirm: () => void;
    onCancel: () => void;
    loader?: boolean;
    /** Optional extra warning, e.g. "this is the primary payment method" */
    isPrimary?: boolean;
};


export function RemovePaymentMethodDialog({
    open,
    details,
    onConfirm,
    onCancel,
    loader = false,
    isPrimary = false,
}: RemovePaymentMethodDialogProps): React.JSX.Element {
    const isCard = !!details?.card_type;
    const expired = isCard && details ? isCardExpired(details) : false;

    const primaryWarning = isPrimary
        ? "\n\nWarning: You are removing your Primary payment method. No Primary payment method will be assigned after this payment method is removed."
        : "";

    let heading: string;
    let message: string;
    let footerMessage: string | undefined;
    let showSummary: boolean;

    if (expired) {
        // Requirement 2: expired credit card — no card details, no question, no "will no longer be
        // available" clause. Just state that an expired payment method is being removed.
        heading = "Remove Expired Payment Method";
        message = "You are removing an expired payment method.";
        footerMessage = undefined;
        showSummary = false;
    } else {
        // Requirement 1 (active card) and Requirement 3 (bank account / ACH) share the same
        // question + clause, with the summary chip sandwiched in between them.
        heading = "Remove Payment Method";
        message = "Are you sure you want to remove this payment method?";
        footerMessage =
            "This payment method will no longer be available for future payments or AutoPay." +
            primaryWarning;
        showSummary = true;
    }

    return (
        <ConfirmDialog
            open={open}
            title={<DialogHeading label={heading} />}
            message={message}
            footerMessage={footerMessage}
            details={showSummary && details ? <PaymentMethodSummary details={details} /> : undefined}
            confirmLabel="Remove Payment Method"
            cancelLabel="Cancel"
            onConfirm={onConfirm}
            onCancel={onCancel}
            loader={loader}
        />
    );
}
