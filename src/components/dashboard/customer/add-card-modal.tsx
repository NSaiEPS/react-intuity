import { FC, useEffect, useState } from "react";
import { getPaymentDetails } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";

import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "@/hooks/redux";
import { toast } from "@/lib/custom-toast";
import { colors } from "@/utils";
import {
  extractSavedPaymentMethod,
  hasOneTimePaymentToken,
  ONE_TIME_TOKEN_AUTOPAY_ERROR,
} from "@/utils/paymentTokenUtils";
import PaymentIframe from "@/components/CommonComponents/PaymentIframeModal";

interface SavedPaymentRecord {
  id?: string | number;
  [key: string]: unknown;
}

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (card?: SavedPaymentRecord) => void;
  onReturnCard?: (data: SavedPaymentRecord) => void;
  isAutopay?: boolean;
}

const AddCardModal: FC<AddCardModalProps> = ({
  open,
  onClose,
  onSuccess,
  onReturnCard,
  isAutopay = false,
}) => {
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [expiryMonth, setExpiryMonth] = useState<string>("");
  const [expiryYear, setExpiryYear] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  // const handleContinue = () => {
  //   if (!agreed) {
  //     alert("Please agree to the terms.");
  //     return;
  //   }

  //   onClose();
  // };

  // const handleReset = () => {
  //   setCardNumber("");
  //   setCvv("");
  //   setExpiryMonth("");
  //   setExpiryYear("");
  //   setAgreed(false);
  // };

  useEffect(() => {
    // Dynamically load the external iCG script
    const script = document.createElement("script");
    script.src = "https://cdn.icheckgateway.com/Scripts/iefixes.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const dispatch = useDispatch();

  const handleSaveDetails = (data) => {
    if (data?.error) {
      toast.error(
        data?.error ? data?.error : "Try again something went wrong!"
      );

      return;
    }
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("model_open", "1");
    if (isAutopay) {
      formdata.append("is_autopay", "1");
    }
    if (data?.ssl_token) {
      formdata.append("token", data?.ssl_token);
      formdata.append("credit_card_number", data?.ssl_card_number);
      formdata.append("card_type", data?.ssl_card_short_description);
      formdata.append("expiration", data?.ssl_exp_date);
      formdata.append("approval_code", data?.ssl_approval_code);
    } else if (data?.forte_response || data?.forte_token) {
      const forteResp = data?.forte_response;
      const forteToken = String(forteResp?.onetime_token ?? data?.forte_token ?? data?.token ?? "");
      const last4 = String(forteResp?.last_4 ?? data?.credit_card_number ?? data?.cardNumber ?? "");
      const cardType = String(forteResp?.card_type ?? data?.card_type ?? data?.cardType ?? "");
      const expMonth = String(forteResp?.expire_month ?? "").padStart(2, "0");
      const expYearRaw = String(forteResp?.expire_year ?? "");
      const expYearFull = expYearRaw.length === 2 ? `20${expYearRaw}` : expYearRaw;
      const expirationFormatted =
        expMonth && expYearFull ? `${expMonth}/${expYearFull}` : String(data?.expiration ?? data?.cardExpDate ?? "");

      formdata.append("token", forteToken);
      formdata.append("forte_token", forteToken);
      if (forteResp) {
        formdata.append(
          "forte_response",
          typeof forteResp === "string" ? forteResp : JSON.stringify(forteResp)
        );
      }
      formdata.append("credit_card_number", last4);
      formdata.append("card_type", cardType);
      formdata.append("expiration", expirationFormatted);
    } else {
      formdata.append("token", data?.token);
      formdata.append("credit_card_number", data?.cardNumber);
      formdata.append("card_type", data?.cardType);
      formdata.append("expiration", data?.cardExpDate);
    }
    dispatch(
      getPaymentDetails(
        formdata,
        true,
        () => {
          const refreshForm = new FormData();
          refreshForm.append("acl_role_id", stored?.body?.acl_role_id);
          refreshForm.append("customer_id", stored?.body?.customer_id);

          dispatch(getPaymentDetails(refreshForm));
          onSuccess?.();
          onClose();
        },
        null,
        (resBody) => {
          const savedCard = extractSavedPaymentMethod(resBody);
          if (isAutopay && hasOneTimePaymentToken(savedCard)) {
            toast.error(ONE_TIME_TOKEN_AUTOPAY_ERROR);
            return;
          }
          onReturnCard?.(resBody);
        }
      )
    );
  };
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pl: 3 }}>
        Add New Card
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 10,
            top: 8,
            pr: 1.5,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={24} color={colors.blue} />
        </IconButton>
      </DialogTitle>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          width: "100%", // full width
        }}
      >
        <PaymentIframe type="card" onSuccess={handleSaveDetails} />
      </Box>
      {/* <DialogContent>
        {iframeLoading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={500}
            width={500}
            sx={{ border: "1px solid #ccc", mb: 2 }}
          >
            Loading...
          </Box>
        )}
        <div className="projects-section-line" style={{ marginTop: "20px" }}>
          {!iframeLoading && (
            <Typography
              variant="body1"
              align="center"
              sx={{ color: "red", fontWeight: "bold" }}
            >
              ⚠️ WARNING! Only click this button ONCE!
            </Typography>
          )}
          <iframe
            id="iFrameBA"
            name="iFrameBA"
            src={iframeUrlForCard}
            scrolling="no"
            width="500"
            height="500"
            frameBorder="0"
            title="ICG Payment"
            onLoad={() => setIframeLoading(false)}
          ></iframe>
        </div>
      </DialogContent> */}
    </Dialog>
  );
};

export default AddCardModal;
