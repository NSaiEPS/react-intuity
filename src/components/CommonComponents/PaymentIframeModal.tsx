import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/auth";
import { CustomBackdrop, Loader } from "nsaicomponents";
import crypto from "crypto";

interface PaymentIframeProps {
  type: "card" | "account";
  onSuccess: (data: any) => void; // handleSaveDetails
  oneTimePayment?: any;
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
  const { paymentRequiredKeyDetails } = useSelector(
    (state: RootState) => state?.Account
  );

  const [processorDetails, setProcessorDetails] = useState<any>({});
  const [iframeDynamicUrl, setIframeDynamicUrl] = useState("");
  console.log(processorDetails, "processorDetails");
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");

  // Extract processor details
  useEffect(() => {
    const isCard = type === "card";
    const processorList = isCard
      ? paymentProcessorDetails?.current_processor
      : paymentProcessorDetails?.current_processor_ach;

    if (processorList?.length > 0) {
      const key = processorList[0]?.config_value;
      const processor = paymentProcessorDetails?.[key]?.[0];

      if (processor?.config_value) {
        setIframeDynamicUrl(processor?.iframe_url);
        setProcessorDetails(JSON.parse(processor?.config_value));
      }
    }
  }, [paymentProcessorDetails, type]);

  // iframe url depends on type
  const icheckParams = oneTimePayment
    ? `custId=${oneTimePayment?.accountNo}&firstName=${oneTimePayment?.name}&street1=${oneTimePayment?.street}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`
    : `custId=${CustomerInfo?.acctnum}&firstName=${CustomerInfo?.customer_name}&street1=${CustomerInfo?.customer_address}+&amount=0.00&entryClassCode=WEB&saveTokenDisabled=false`;

  const getGateDetails = () => {
    if (!iframeDynamicUrl) return "";

    if (iframeDynamicUrl.includes("icheckgateway")) {
      // iCheck
      return `appId=${processorDetails?.app_id}&appSecret=${processorDetails?.app_secret}`;
    }

    if (iframeDynamicUrl.includes("certtransaction")) {
      // WorldPay
      return `TransactionSetupID=${paymentRequiredKeyDetails}`;
    }

    if (iframeDynamicUrl.includes("nacha_bank_frame")) {
      // NACHA (currently assuming same param, adjust later if needed)
      return `TransactionSetupID=${paymentRequiredKeyDetails}`;
    }

    return "";
  };

  const iframeUrl = `${iframeDynamicUrl}?${getGateDetails()}&${icheckParams}`;

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
      console.log(event, "handleMessage");
      if (event?.data?.custId || event?.data?.token) {
        onSuccess(event.data); // parent callback
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess]);

  function decryptPass(encrypted) {
    const algorithm = "aes-128-ctr";
    const key = Buffer.from("Intuity", "utf8");
    const iv = Buffer.from("1234567891011121", "utf8");

    // Ensure key is exactly 16 bytes
    const fixedKey = Buffer.alloc(16);
    key.copy(fixedKey);

    const decipher = crypto.createDecipheriv(algorithm, fixedKey, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Decide if a field should be decrypted based on rules
   */
  function shouldDecrypt(key, value) {
    if (!value || typeof value !== "string") return false;

    switch (key) {
      case "site_id":
      case "site_id_ach":
        return value.length > 4;
      case "account_id":
        return value.length > 7;
      case "merchant_id":
        return value.length > 7;
      case "sss":
        return value.length > 3;
      case "routing_no":
        return value.length > 9;
      case "biller_guid":
        return !value.includes("-");
      // generic rule: if value looks like base64 and is "too long"
      default:
        return /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 15;
    }
  }

  /**
   * Walk through object and decrypt only when needed
   */
  function processConfig(config) {
    const result = {};
    for (const [key, value] of Object.entries(config)) {
      if (shouldDecrypt(key, value)) {
        try {
          result[key] = decryptPass(value);
        } catch (e) {
          // fallback if decrypt fails (maybe already plain)
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  const config1 = {
    site_id_ach: "f6togr==",
    site_key_ach: "Fd8Z8b5WYzf=",
    api_key_ach: "Ed9L/u1XfTdzNcJB",
    app_id_ach: "T45BpOwIInEFOZQzuVhld7lQfdfdfdfdf6NtFkUkzohc=",
    app_secret_ach: "ZIB9gcQbJFICG5IQiw9iS5ZSkjVV1rAu69wQu1dHrererer=",
  };

  const config2 = {
    site_id: "XABI",
    site_key: "25381501",
    api_key: "65a7b4275ba5",
    app_id: "hdkmckqqCn7GdocWNo3pJsmRACrerererer",
    app_secret: "CjWHKxwRDL1dV8dkam55ferererer",
  };

  console.log("Decrypted Config1:", processConfig(config1));
  console.log("Config2 (already plain):", processConfig(config2));

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
