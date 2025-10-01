import { FC, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { RootState } from "@/state/store";
import { useDispatch, useSelector } from "react-redux";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { CustomBackdrop, Loader } from "nsaicomponents";
import crypto from "crypto";
import NachaIframe from "./NachaIframe";
import { getWorldPlayPaymentDetails } from "@/state/features/accountSlice";
import { renderIframeRoot, unmountIframeRoot } from "@/utils/rootIframe";
import { useSearchParams } from "react-router";

interface PaymentIframeProps {
  type: "card" | "account";
  onSuccess: (data: any) => void; // handleSaveDetails
  oneTimePayment?: any;
  invoiceId?: string;
}

const PaymentIframe: FC<PaymentIframeProps> = ({
  type = "card",
  onSuccess,
  oneTimePayment = null,
  // invoiceId,
}) => {
  const [searchParams] = useSearchParams();

  const invoiceId = searchParams.get("id");

  const [iframeLoading, setIframeLoading] = useState(true);
  const { accountLoading, paymentProcessorDetails } = useSelector(
    (state: RootState) => state?.Account
  );
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const { paymentRequiredKeyDetails } = useSelector(
    (state: RootState) => state?.Account
  );
  const dispatch = useDispatch();
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
      console.log("Received message from iframe:", event.data);
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
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const [worldpayDetails, setWorldpayDetails] = useState<any>({});
  console.log(worldpayDetails, "worldpayDetails");
  const companyInfo = useSelector(
    (state: RootState) => state.Account.companyInfo
  );
  useEffect(() => {
    if (curentProcessor?.includes("worldpay")) {
      const formdata = new FormData();

      formdata.append("acl_role_id", stored?.body?.acl_role_id ?? "4");
      formdata.append(
        "customer_id",
        stored?.body?.customer_id ?? companyInfo?.company?.id
      );

      formdata.append("card_pay", "worldpay");
      formdata.append("invoice_id", invoiceId || "0");
      if (companyInfo?.company?.id) {
        formdata.append("is_one_time_pay", "1");
      }

      dispatch(
        getWorldPlayPaymentDetails(stored?.body?.token, formdata, (res) => {
          setWorldpayDetails(res);
        })
      );
    }
  }, [curentProcessor]);

  useEffect(() => {
    if (
      curentProcessor?.includes("worldpay") &&
      worldpayDetails?.transaction_setup_id
    ) {
      console.log("rendered", "renderIframeRoot");

      // Render iframe in its own root
      renderIframeRoot(
        <iframe
          id="worldpayIframe"
          name="worldpayIframe"
          src={`https://certtransaction.hostedpayments.com?TransactionSetupID=${worldpayDetails?.transaction_setup_id}`}
          frameBorder="0"
          scrolling="yes"
          title="ICG Payment"
          style={{
            width: "600px", // or "100%"
            height: "500px", // or "100%"
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
          onLoad={() => setIframeLoading(false)}
        />
      );
    }

    return () => {
      // cleanup
      unmountIframeRoot();
    };
  }, [curentProcessor, worldpayDetails]);

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
          ⚠️ WARNING! Only click Continue ONCE!
        </Typography>
      )}
      {curentProcessor?.includes("worldpay") ? (
        worldpayDetails?.transaction_setup_id ? (
          <iframe
            id="worldpayIframe"
            name="worldpayIframe"
            src={`https://certtransaction.hostedpayments.com?TransactionSetupID=${worldpayDetails?.transaction_setup_id}`}
            // frameborder="0"
            scrolling="yes"
            // style="width: 100% !important; height: 250px;"
            frameBorder="0"
            title="ICG Payment"
            onLoad={() => setIframeLoading(false)}
          ></iframe>
        ) : null
      ) : (
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
      )}

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
