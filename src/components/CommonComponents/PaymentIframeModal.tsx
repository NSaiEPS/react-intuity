import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/auth";
import { CustomBackdrop, Loader } from "nsaicomponents";
import crypto from "crypto";
import NachaIframe from "./NachaIframe";

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
  const [decryptedDetails, setDecryptedDetails] = useState<any>({});
  const [iframeDynamicUrl, setIframeDynamicUrl] = useState("");
  console.log(processorDetails, "processorDetails");
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");

  // Extract processor details
  const [curentProcessor, setCurentProcessor] = useState("");
  useEffect(() => {
    const isCard = type === "card";
    const processorList = isCard
      ? paymentProcessorDetails?.current_processor
      : paymentProcessorDetails?.current_processor_ach;

    if (processorList?.length > 0) {
      const key = processorList[0]?.config_value;
      setCurentProcessor(key);
      const processor = paymentProcessorDetails?.[key]?.[0];

      if (processor?.config_value) {
        setIframeDynamicUrl(
          isCard
            ? processor?.iframe_url ?? processor?.iframe_url_ach
            : processor?.iframe_url_ach ?? processor?.iframe_url
        );
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
    const getField = (baseKey) => {
      return (
        decryptedDetails?.[`${baseKey}_ach`] ?? decryptedDetails?.[baseKey]
      );
    };
    if (iframeDynamicUrl.includes("icheckgateway")) {
      // iCheck
      return `appId=${getField("app_id")}&appSecret=${getField("app_secret")}`;
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
  // const iframeUrl =
  //   "https://test-intuity-backend.pay.waterbill.com/nacha_bank_frame.php?companyName=South & Center Chautauqua Lake Sewer District&sec_code=ppd,ccd";

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

  async function decryptPass(encrypted) {
    const keyString = "Intuity";
    const ivString = "1234567891011121";

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

  // Process config with conditions
  async function processConfig(config) {
    // Conditions (based on your PHP rules)
    let shouldDecrypt = false;

    // site_id or site_id_ach
    if ((config?.site_id || config?.site_id_ach)?.length > 4)
      shouldDecrypt = true;

    // account_id or account_id_ach
    if ((config?.account_id || config?.account_id_ach)?.length > 7)
      shouldDecrypt = true;

    // merchant_id or merchant_id_ach
    if ((config?.merchant_id || config?.merchant_id_ach)?.length > 7)
      shouldDecrypt = true;

    // autoAchworks.sss
    if (config?.autoAchworks?.sss && config.autoAchworks.sss.length > 3)
      shouldDecrypt = true;

    // autoNacha.routing_no
    if (config?.autoNacha?.routing_no && config.autoNacha.routing_no.length > 9)
      shouldDecrypt = true;

    // biller_guid (must not contain "-")
    if (config?.biller_guid && !config.biller_guid.includes("-"))
      shouldDecrypt = true;

    const result = {};

    for (const [key, value] of Object.entries(config)) {
      if (!value || typeof value !== "string") {
        result[key] = value;
        continue;
      }

      if (shouldDecrypt) {
        try {
          result[key] = await decryptPass(value);
          console.log(result[key], "Decrypted Config1:");
        } catch (e) {
          console.warn("Failed decrypt, keeping original:", key, value);
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  useEffect(() => {
    if (processorDetails) {
      (async () => {
        const decryptedConfig = await processConfig(processorDetails);
        console.log("Final Config:", decryptedConfig);

        setDecryptedDetails(decryptedConfig);
      })();
    }
  }, [processorDetails]);

  if (
    curentProcessor?.includes("nacha") ||
    curentProcessor?.includes("achworks")
  ) {
    return <NachaIframe onSuccess={onSuccess} />;
  }
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
