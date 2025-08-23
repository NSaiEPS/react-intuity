import { FC, useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/auth";
import { CustomBackdrop, Loader } from "nsaicomponents";

interface PaymentIframeModalProps {
  open: boolean;
  onClose: () => void;
  type: "card" | "account";
  onSuccess: (data: any) => void; // handleSaveDetails
}

const PaymentIframeModal: FC<PaymentIframeModalProps> = ({
  open,
  onClose,
  type,
  onSuccess,
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const { paymentProcessorDetails } = useSelector(
    (state: RootState) => state?.Account
  );
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);

  const [processorDetails, setProcessorDetails] = useState<any>({});
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");

  // Get processor details once available
  useEffect(() => {
    if (paymentProcessorDetails?.current_processor?.length > 0) {
      const details =
        paymentProcessorDetails[
          //   paymentProcessorDetails?.current_processor[0]?.config_value
          "icheck_2"
        ]?.[0]?.config_value;
      setProcessorDetails(JSON.parse(details));
    }
  }, [paymentProcessorDetails]);

  // iframe url depends on type
  const iframeUrl =
    type === "account"
      ? `https://iframe.icheckgateway.com/iFrameBA.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&street1=${CustomerInfo?.customer_nameaddress}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`
      : `https://iframe.icheckgateway.com/iFrameCC.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&street1=${CustomerInfo?.customer_nameaddress}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`;

  // Load icheck script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.icheckgateway.com/Scripts/iefixes.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Listen for iframe postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event?.data?.custId || event?.data?.token) {
        onSuccess(event.data); // trigger parent callback
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        {type === "account" ? "Add Bank Account" : "Add Card"}
        <X size={20} onClick={onClose} style={{ cursor: "pointer" }} />
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

        <div style={{ marginTop: 20 }}>
          {!iframeLoading && (
            <Typography
              variant="body1"
              align="center"
              sx={{ color: "red", fontWeight: "bold", mb: 1 }}
            >
              ⚠️ WARNING! Only click this button ONCE!
            </Typography>
          )}
          <iframe
            id={type === "account" ? "iFrameBA" : "iFrameCC"}
            name={type === "account" ? "iFrameBA" : "iFrameCC"}
            src={iframeUrl}
            scrolling="no"
            width="500"
            height="500"
            frameBorder="0"
            title="ICG Payment"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      </DialogContent>

      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Dialog>
  );
};

export default PaymentIframeModal;
