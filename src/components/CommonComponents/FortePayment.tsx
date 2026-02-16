import { FC, useEffect, useState } from "react";

interface FortePaymentProps {
  onSuccess: (data: any) => void;
}

declare global {
  interface Window {
    onTokenCreated?: (res: any) => void;
    onTokenFailed?: (err: any) => void;
    Forte?: any;
  }
}

const FORTE_LOGIN_ID = "7B0A10728C"; // move to env later

const FortePayment: FC<FortePaymentProps> = ({ onSuccess }) => {
  const [ready, setReady] = useState(false);

  // 1️⃣ Load Forte Script
  useEffect(() => {
    if (document.getElementById("forte-js")) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "forte-js";
    script.src = "https://sandbox.forte.net/api/js/v1";
    script.defer = true;
    script.setAttribute("forte-api-login-id", FORTE_LOGIN_ID);

    script.onload = () => {
      console.log("✅ Forte Loaded");
      setReady(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Forte");
    };

    document.head.appendChild(script);

    return () => {
      // optional cleanup
    };
  }, []);

  // 2️⃣ Register Callbacks
  useEffect(() => {
    window.onTokenCreated = (response: any) => {
      console.log("Forte token success:", response);

      onSuccess({
        token: response.onetime_token,
        last4: response.last_4,
        brand: response.card_type,
        expMonth: response.expire_month,
        expYear: response.expire_year,
      });
    };

    window.onTokenFailed = (error: any) => {
      console.error("Forte error:", error);
      alert(error?.response_description || "Payment failed");
    };
  }, [onSuccess]);

  // 3️⃣ Submit Handler
  const handleSubmit = () => {
    if (!window.Forte) {
      alert("Forte not loaded yet");
      return;
    }

    window.Forte.createToken({
      formId: "forte-payment-form",
    });
  };

  return (
    <form id="forte-payment-form" action="javascript:void(0)">
      <h3>Credit / Debit Card</h3>

      <label>Card Number</label>
      <input type="text" forte-data="card_number" />

      <label>Exp Month</label>
      <select forte-data="expire_month">
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>

      <label>Exp Year</label>
      <select forte-data="expire_year">
        {[...Array(12)].map((_, i) => {
          const year = new Date().getFullYear() + i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>

      <label>CVV</label>
      <input type="text" forte-data="cvv" />

      <button
        type="button"
        forte-api-login-id={FORTE_LOGIN_ID}
        forte-callback-success="onTokenCreated"
        forte-callback-error="onTokenFailed"
        onClick={handleSubmit}
        disabled={!ready}
      >
        Submit Payment
      </button>
    </form>
  );
};

export default FortePayment;
