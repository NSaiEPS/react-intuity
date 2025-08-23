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
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { colors } from "@/utils";
import PaymentIframeModal from "@/components/CommonComponents/PaymentIframeModal";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

const AddCardModal: FC<AddCardModalProps> = ({ open, onClose }) => {
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

  const iframeUrlForCard = `https://iframe.icheckgateway.com/iFrameCC.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&amp;street1=${CustomerInfo?.customer_nameaddress}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`;

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
    formdata.append("token", data?.token);
    formdata.append("credit_card_number", data?.cardNumber);
    formdata.append("card_type", data?.cardType);
    formdata.append("expiration", data?.cardExpDate);

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

    //       acl_role_id:4
    // customer_id:810
    // model_open:1
    // token:5e49a2e66b31456689174ba62e8029e4
    // credit_card_number:1111
    // card_type:Visa
    // expiration:1129
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
      <PaymentIframeModal
        type="card"
        open={true}
        onSuccess={handleSaveDetails}
        onClose={onClose}
      />
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
