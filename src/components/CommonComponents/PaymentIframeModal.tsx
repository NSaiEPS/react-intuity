import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/auth";
import { CustomBackdrop, Loader } from "nsaicomponents";

interface PaymentIframeProps {
  type: "card" | "account";
  onSuccess: (data: any) => void; // handleSaveDetails
  oneTimePayment: any;
}

const PaymentIframe: FC<PaymentIframeProps> = ({
  type = "card",
  onSuccess,
  oneTimePayment = null,
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const { accountLoading, paymentProcessorDetails } = useSelector(
    (state: RootState) => state?.Account
  );
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);

  const [processorDetails, setProcessorDetails] = useState<any>({});
  console.log(processorDetails, "processorDetails");
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");

  // Extract processor details
  useEffect(() => {
    if (paymentProcessorDetails?.current_processor?.length > 0) {
      const details =
        paymentProcessorDetails[
          // Replace with your required key (hardcoded "icheck_2" earlier)
          paymentProcessorDetails?.current_processor[0]?.config_value
          // "icheck_2"
          // "icheck_4"
        ]?.[0]?.config_value;
      console.log(details, paymentProcessorDetails, "details");
      if (details) {
        setProcessorDetails(JSON.parse(details));
      }
    }
  }, [paymentProcessorDetails]);

  // iframe url depends on type
  const icheckParams = oneTimePayment
    ? `custId=${oneTimePayment?.accountNo}&firstName=${oneTimePayment?.name}&street1=${oneTimePayment?.street}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`
    : `custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&street1=${CustomerInfo?.customer_address}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`;

  const iframeUrl =
    type === "account"
      ? `https://iframe.icheckgateway.com/iFrameBA.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&${icheckParams}`
      : `https://iframe.icheckgateway.com/iFrameCC.aspx?appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}&${icheckParams}`;

  // Load external icheck script
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
        onSuccess(event.data); // parent callback
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  return (
    <Box>
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

      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </Box>
  );
};

export default PaymentIframe;
