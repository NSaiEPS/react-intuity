import { FC, useEffect, useState } from "react";
import { getPaymentDetails } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
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
} from "@mui/material";
import { Question, X } from "@phosphor-icons/react";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PaymentIframeModal from "@/components/CommonComponents/PaymentIframeModal";
import PaymentIframe from "@/components/CommonComponents/PaymentIframeModal";

interface AddBankAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AddBankAccountModal: FC<AddBankAccountModalProps> = ({
  open,
  onClose,
}) => {
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const [iframeLoading, setIframeLoading] = useState(true);

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
      alert("Please agree to the terms.");
      return;
    }

    onClose();
  };

  const handleReset = () => {
    setRoutingNumber("");
    setAccountNumber("");
    setAccountType("");
    setAgreed(false);
  };

  const openPaper = Boolean(anchorEl);

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

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const dispatch = useDispatch();

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

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
    formdata.append("token", data?.token);
    formdata.append("bank_account_number", data?.accountNumber);
    formdata.append("routing_number", data?.routingNumber);

    formdata.append(
      "account_type",
      data?.accountType === "PC"
        ? "Personal Checking"
        : data?.accountType === "PS"
        ? "Personal Savings"
        : data?.accountType === "BC"
        ? "Business Checking"
        : data?.accountType === "BS"
        ? "Business Savings"
        : data?.accountType === "GL"
        ? "General Ledger"
        : " Other"
    );

    dispatch(
      getPaymentDetails(stored?.body?.token, formdata, true, () => {
        const formdata = new FormData();
        formdata.append("acl_role_id", stored?.body?.acl_role_id);
        formdata.append("customer_id", stored?.body?.customer_id);

        dispatch(
          getPaymentDetails(stored?.body?.token, formdata, false, onClose)
        );
      })
    );

    //   bank_account_number:6789
    // routing_number:083000056
    // account_type:Personal Checking
  };
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, pl: 3 }}>
        Add Bank Account
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
            src={iframeUrlForBank}
            scrolling="no"
            width="500"
            height="500"
            frameBorder="0"
            title="ICG Payment"
            onLoad={() => setIframeLoading(false)}
          ></iframe>
        </div>
      </DialogContent> */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          width: "100%", // full width
        }}
      >
        <PaymentIframe type="account" onSuccess={handleSaveDetails} />
      </Box>
      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Dialog>
  );
};

export default AddBankAccountModal;
