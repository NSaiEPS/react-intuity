import { BASE_URL } from "@/api/axios";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import React, { useState } from "react";
import { useSelector } from "react-redux";

const ElavonAddCard = () => {
  const [loading, setLoading] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;

  const generateTokenUrl = `${BASE_URL}settings/front/elavon-generate-token`;
  const addCardUrl = `${BASE_URL}/api/add-card`;

  const invoiceId = 54305;

  // 🧩 STEP 0: Load the Elavon script conditionally
  const loadElavonSDK = async () => {
    return new Promise<void>((resolve, reject) => {
      if (window.PayWithConverge) {
        setSdkLoaded(true);
        resolve();
        return;
      }

      const scriptUrl =
        "https://api.demo.convergepay.com/hosted-payments/PayWithConverge.js";

      const existingScript = document.querySelector(
        `script[src="${scriptUrl}"]`
      );
      if (existingScript) {
        setSdkLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        console.log("✅ Elavon SDK loaded successfully");
        setSdkLoaded(true);
        resolve();
      };
      script.onerror = () => {
        console.error("❌ Failed to load Elavon SDK");
        reject(new Error("Elavon SDK failed to load"));
      };

      document.body.appendChild(script);
    });
  };

  // 🧩 STEP 1: Get session token from backend
  const getSessionTokenAddCard = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);

      const response = await fetch(generateTokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("🔑 Token response data:", data);

      if (!data?.token && !data?.ssl_txn_auth_token)
        throw new Error("Token not found in response");

      const sessionToken = data?.token || data?.ssl_txn_auth_token;
      return sessionToken;
    } catch (error) {
      console.error("❌ Failed to generate token:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 🧩 STEP 2: Open Elavon Lightbox with token
  const openLightboxAddCard = async (sessionToken: string) => {
    if (!window.PayWithConverge) {
      alert("Elavon SDK not loaded yet");
      return;
    }

    const paymentData = {
      ssl_first_name: "Dummy",
      ssl_last_name: "User",
      ssl_description: "Add Card Flow",
      ssl_invoice_number: invoiceId,
      ssl_txn_auth_token: sessionToken,
      ssl_verify: "Y",
      ssl_add_token: "Y",
    };

    console.log("📤 Opening Elavon Lightbox with data:", paymentData);

    const callbacks = {
      onReady: () => {
        console.log("✅ Lightbox ready");
        setIframeVisible(true);
      },
      onError: (error) => {
        console.error("❌ Elavon error:", error);
        showResultAddCard("error", error);
      },
      onCancelled: () => {
        console.warn("⚠️ User cancelled payment");
        showResultAddCard("cancelled", "");
      },
      onDeclined: (response) => {
        console.warn("❌ Payment declined:", response);
        showResultAddCard("declined", JSON.stringify(response, null, 2));
      },
      onApproval: (response) => {
        console.log("✅ Payment approved:", response);
        showResultAddCard("approval", response);
      },
    };

    const options = {
      frame: document.getElementById("id_payment_add_card"),
      cssOverride:
        "html, body { background-color: rgba(244,246,246,1.0) } " +
        ".hpm-content { box-shadow:unset; margin-top:unset; } " +
        ".hpm-input-short { margin-bottom:0px; } " +
        "md-card { box-shadow:unset; background-color:#f4f6f6; }",
    };

    window.PayWithConverge.open(paymentData, callbacks, options);
  };

  // 🧩 STEP 3: Handle Elavon callback results
  const showResultAddCard = async (status: string, msg: any) => {
    console.log("txn_status_add_card:", status);
    console.log("txn_response_add_card:", msg);

    if (status === "approval") {
      const elavonResData = JSON.parse(msg);
      setLoading(true);

      try {
        const response = await fetch(addCardUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            customer_id: stored?.body?.customer_id,
            pay_now_hidden: 0,
            is_one_time: 0,
            is_card: 1,
            credit_card_number: elavonResData.ssl_card_number,
            card_type: elavonResData.ssl_card_short_description,
            expiration: elavonResData.ssl_exp_date,
            token: elavonResData.ssl_token,
          }),
        });

        const result = await response.json();
        console.log("✅ Card saved:", result);
        alert("Card successfully added!");
      } catch (error) {
        console.error("❌ Failed to save card:", error);
      } finally {
        setLoading(false);
      }
    } else {
      alert("This payment was not approved or cancelled.");
    }
  };

  // 🧩 STEP 4: Combined flow
  const handleAddCard = async () => {
    try {
      setLoading(true);
      await loadElavonSDK(); // ✅ load SDK first
      const token = await getSessionTokenAddCard(); // ✅ get token from backend
      await openLightboxAddCard(token); // ✅ open Elavon lightbox
    } catch (error) {
      console.error("Error in add-card flow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-3">Add Card (Elavon)</h2>

      <button
        onClick={handleAddCard}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Add Card"}
      </button>

      {/* Lightbox Container */}
      <div
        id="id_payment_add_card"
        style={{
          display: iframeVisible ? "block" : "none",
          width: "100%",
          height: "500px",
          marginTop: "1rem",
        }}
      />

      {loading && (
        <div className="mt-4 text-gray-600 text-sm">Please wait...</div>
      )}
    </div>
  );
};

export default ElavonAddCard;
