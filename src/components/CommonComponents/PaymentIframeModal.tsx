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
      return `companyName=South & Center Chautauqua Lake Sewer District&sec_code=ppd,ccd`;
    }
    if (iframeDynamicUrl.includes("achworks_frame")) {
      // NACHA (currently assuming same param, adjust later if needed)
      return `companyName=South & Center Chautauqua Lake Sewer District`;
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

    // Fix: pad Base64 if needed
    const padded = encrypted + "=".repeat((4 - (encrypted.length % 4)) % 4);

    const decipher = crypto.createDecipheriv(algorithm, fixedKey, iv);
    let decrypted = decipher.update(padded, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  function processConfig(config) {
    const decryptAll = true;
    const result = {};
    for (const [key, value] of Object.entries(config)) {
      if (!value || typeof value !== "string") {
        result[key] = value;
        continue;
      }

      if (decryptAll) {
        try {
          result[key] = decryptPass(value);
          console.log(decryptPass(value), "Decrypted Config1:");
        } catch (e) {
          // if decryption fails, keep original
          console.log(value, "Decrypted Config1:");

          result[key] = value;
        }
      } else {
        console.log(value, "Decrypted Config1:");

        result[key] = value;
      }
    }
    return result;
  }

  // Example
  const config1 = {
    site_id_ach: "f6togA==",
    site_key_ach: "f6togA==",
    api_key_ach: "Ed9L/u1XfTdzNcJB",
    app_id_ach: "T45BpOwIInEFOZQzuVhld7lQlHBW5q076NtFkUkzohc",
    app_secret_ach: "ZIB9gcQbJFICG5IQiw9iS5ZSkjVV1rAu69wQu1dHrDk=",
  };

  // console.log("Decrypted Config1:", processConfig(config1));

  async function decryptPass1(encrypted) {
    const keyString = "Intuity";
    const ivString = "1234567891011121";

    // Pad key to 16 bytes
    const keyBytes = new TextEncoder().encode(keyString.padEnd(16, "\0"));

    const key = await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CTR" },
      false,
      ["decrypt"]
    );

    // Fix base64 padding
    const base64 =
      encrypted.length % 4 === 0
        ? encrypted
        : encrypted + "=".repeat(4 - (encrypted.length % 4));

    const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const iv = new TextEncoder().encode(ivString);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CTR", counter: iv, length: 128 },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  // Example usage
  decryptPass1("ZIB9gcQbJFICG5IQiw9iS5ZSkjVV1rAu69wQu1dHrDk=")
    .then(console.log)
    .catch((res) => console.log(res));
  // 👉 should log: hdkmckqqCn7GdocWNo3pJsmRACgaOEjx

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
