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
import ElavonAddCard from "./ElavonPaymentModal";
import ElavonBankIframe from "./ElavonBankIframe";
import { CustomerInfo } from "@/utils";

interface PaymentIframeProps {
  type: "card" | "account";
  onSuccess: (data: string | unknown) => void; // handleSaveDetails
  oneTimePayment?: { accountNo: string; name: string; street: string } | null;
  invoiceId?: string;
  convenience_fee?: string;
  amount?: string;
  amountRequired?: boolean;
  customerDetails?: { id?: string | number } | null;
}

const PaymentIframe: FC<PaymentIframeProps> = ({
  type = "card",
  onSuccess,
  oneTimePayment = null,
  convenience_fee = 0,
  amount = 0,
  amountRequired = false,
  customerDetails,
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
  interface ProcessorDetails {
  processor?: "worldpay" | "elavon" | "stripe" | string;
  iframe_url?: string;
  token?: string;
  merchant_id?: string;
  public_key?: string;
  [key: string]: unknown;
}

interface DecryptedDetails {
  card_token?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  bank_account_number?: string;
  account_type?: string;
  [key: string]: unknown;
}
  const [processorDetails, setProcessorDetails] = useState<ProcessorDetails>({});
  const [decryptedDetails, setDecryptedDetails] = useState<DecryptedDetails>({});
  const [iframeDynamicUrl, setIframeDynamicUrl] = useState("");
  console.log(processorDetails, "processorDetails");
  const CustomerInfo: CustomerInfo = dashBoardInfo?.body?.customer
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
      // console.log("Received message from iframe:", event.data);
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
   interface WorldpayDetails {
  iframeUrl?: string;
  sessionId?: string;
  merchantId?: string;
  paymentMethod?: "card" | "bank";
  amount?: string;
  currency?: string;
  [key: string]: unknown; // allow backend extensions safely
}
  const [worldpayDetails, setWorldpayDetails] = useState<WorldpayDetails | null>(null);
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
      if (!companyInfo?.company?.id) {
        formdata.append("pay_without_save", "1");
      }
      if (companyInfo?.company?.id) {
        formdata.append("is_one_time_pay", "1");
      }
      if (amountRequired) {
        formdata.append("convenience_fee", String(convenience_fee));
        formdata.append("amount", String(amount));
      }

      dispatch(
        getWorldPlayPaymentDetails(stored?.body?.token, formdata, (res) => {
          setWorldpayDetails(res);
        })
      );
    }
  }, [curentProcessor, amountRequired]);

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
    curentProcessor?.includes("achworks") ||
    curentProcessor?.includes("elavon_ach")
  ) {
    return (
      <NachaIframe
        onSuccess={(data) => {
          const newData = {
            ...data,
          };
          if (curentProcessor?.includes("elavon_ach")) {
            newData.expiration = "";
          }
          onSuccess(newData);
        }}
      />
    );
  }
  // if (curentProcessor?.includes("elavon_ach")) {
  //   return (
  //     <ElavonBankIframe
  //       type={type}
  //       onSuccess={onSuccess}
  //       customerDetails={customerDetails}
  //     />
  //   );
  // }
  if (curentProcessor?.includes("elavon")) {
    return (
      <ElavonAddCard
        type={type === "account" ? "bank" : type}
        onSuccess={onSuccess}
        customerDetails={customerDetails}
      />
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      {iframeLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "100%",
            height: 450, // reasonable height
            border: "1px solid #ccc",
            mb: 2,
          }}
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
            id={
              curentProcessor?.includes("worldpay")
                ? "worldpayIframe"
                : type === "account"
                ? "iFrameBA"
                : "iFrameCC"
            }
            name={
              curentProcessor?.includes("worldpay")
                ? "worldpayIframe"
                : type === "account"
                ? "iFrameBA"
                : "iFrameCC"
            }
            src={
              curentProcessor?.includes("worldpay")
                ? `https://certtransaction.hostedpayments.com?TransactionSetupID=${worldpayDetails?.transaction_setup_id}`
                : iframeUrl
            }
            scrolling={curentProcessor?.includes("worldpay") ? "yes" : "no"}
            frameBorder="0"
            title="ICG Payment"
            onLoad={() => setIframeLoading(false)}
            style={{
              width: "100%",
              minHeight: 600, // match the loading box
              border: "0",
              display: iframeLoading ? "none" : "block",
              overflowY: "scroll",
            }}
          />
        ) : null
      ) : (
        <iframe
          id={
            curentProcessor?.includes("worldpay")
              ? "worldpayIframe"
              : type === "account"
              ? "iFrameBA"
              : "iFrameCC"
          }
          name={
            curentProcessor?.includes("worldpay")
              ? "worldpayIframe"
              : type === "account"
              ? "iFrameBA"
              : "iFrameCC"
          }
          src={
            curentProcessor?.includes("worldpay")
              ? `https://certtransaction.hostedpayments.com?TransactionSetupID=${worldpayDetails?.transaction_setup_id}`
              : iframeUrl
          }
          scrolling={curentProcessor?.includes("worldpay") ? "yes" : "no"}
          frameBorder="0"
          title="ICG Payment"
          onLoad={() => setIframeLoading(false)}
          style={{
            width: "100%",
            minHeight: 600, // match the loading box
            border: "0",
            display: iframeLoading ? "none" : "block",
            overflowY: "scroll",
          }}
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
