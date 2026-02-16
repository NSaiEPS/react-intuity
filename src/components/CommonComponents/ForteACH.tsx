import { FC, useEffect, useState } from "react";

interface ForteACHProps {
  onSuccess: (data: any) => void;
  invoiceId?: string | null;
  amount: string;
  convenience_fee: string;
}

declare global {
  interface Window {
    Forte?: any;
    onACHTokenCreated?: (res: any) => void;
    onACHTokenFailed?: (err: any) => void;
  }
}

const FORTE_LOGIN_ID = "7B0A10728C";

const ForteACH: FC<ForteACHProps> = ({
  onSuccess,
}) => {
  const [ready, setReady] = useState(false);

  // Load Forte Script
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
      setReady(true);
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    window.onACHTokenCreated = (response: any) => {
      onSuccess({
        token: response.onetime_token,
        accountNumber: response.last_4,
        routingNumber: response.routing_number,
        accountType: response.account_type,
      });
    };

    window.onACHTokenFailed = (error: any) => {
      alert(error?.response_description || "ACH Payment failed");
    };
  }, [onSuccess]);

  const handleSubmit = () => {
    if (!window.Forte) {
      alert("Forte not loaded");
      return;
    }

    window.Forte.createToken({
      formId: "forte-ach-form",
    });
  };

  return (
    <form id="forte-ach-form" action="javascript:void(0)">
      <h3>Bank Account Payment</h3>

      <label>Routing Number</label>
      <input type="text" forte-data="routing_number" />

      <label>Account Number</label>
      <input type="text" forte-data="account_number" />

      <label>Account Type</label>
      <select forte-data="account_type">
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
      </select>

      <button
        type="button"
        forte-api-login-id={FORTE_LOGIN_ID}
        forte-callback-success="onACHTokenCreated"
        forte-callback-error="onACHTokenFailed"
        onClick={handleSubmit}
        disabled={!ready}
      >
        Submit Bank Payment
      </button>
    </form>
  );
};

export default ForteACH;
