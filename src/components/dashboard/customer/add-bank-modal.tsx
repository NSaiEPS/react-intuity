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
  const paymentProcessorDetails = useSelector(
    (state: RootState) => state?.Account?.paymentProcessorDetails
  );
  const [processorDetails, setProcessorDetails] = useState<any>({});
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);

  useEffect(() => {
    if (paymentProcessorDetails?.current_processor?.length > 0) {
      let details =
        paymentProcessorDetails[
          paymentProcessorDetails?.current_processor[0]?.config_value
        ]?.[0]?.config_value;
      setProcessorDetails(JSON.parse(details));
    }
  }, [paymentProcessorDetails]);
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");
  const iframeUrlForBank = `https://iframe.icheckdev.com/iFrameBA.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&amp;street1=${CustomerInfo?.customer_nameaddress}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`;

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.custId) {
        handleSaveDetails(event.data);
      }
      // if (event.origin !== 'https://iframe.icheckdev.com') return; // or use production origin

      // // Check the message format
      // if (event.data && typeof event.data === 'string') {
      //
      //   // Optional: Store in state
      // }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
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
    formdata.append("account_type", data?.accountType);

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

      <DialogContent>
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
      </DialogContent>

      {/* <DialogActions sx={{ gap: 1, mb: 2, pr: 3 }}>
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
      </DialogActions> */}
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
