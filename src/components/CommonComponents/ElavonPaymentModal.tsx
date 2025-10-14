import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "@/api/axios";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { useSearchParams } from "react-router";

const ElavonAddCard = ({ type = "card", onSuccess }) => {
  const [searchParams] = useSearchParams();
  const companyInfo = useSelector(
    (state: RootState) => state.Account.companyInfo
  );
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [iframeVisible, setIframeVisible] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // 🔹 Redux + Local Storage user info
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;

  // 🔹 API endpoints
  const generateTokenUrl = `${BASE_URL}settings/front/elavon-generate-token`;
  const addCardUrl = `${BASE_URL}/api/add-card`;
  const invoiceId = id; // dummy invoice

  // 🧩 STEP 0: Load Elavon SDK only when needed
  const loadElavonSDK = async (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (window.PayWithConverge) {
        console.log("✅ Elavon SDK already loaded");
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
        console.log("⚠️ Script already in DOM");
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
  const getSessionTokenAddCard = async (): Promise<string> => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (token) {
        formData.append("acl_role_id", roleId);
        formData.append("customer_id", userId);
      } else {
        formData.append("acl_role_id", roleId);
        formData.append("company_id", companyInfo?.company?.id);
        formData.append("company_alias", companyInfo?.company?.alias);
        formData.append("acl_role_id", "4");
      }
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

      if (!data?.body?.elavon_token)
        throw new Error("Elavon token not found in response");

      return data.body.elavon_token;
    } catch (error) {
      console.error("❌ Failed to generate token:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  console.log("Elavon SDK:", window.PayWithConverge);
  console.log("window.PayWithConverge:", window.PayWithConverge);

  // 🧩 STEP 2: Open Elavon Lightbox
  const openLightboxAddCard = async (sessionToken: string) => {
    if (!window.PayWithConverge) {
      alert("Elavon SDK not loaded yet");
      return;
    }
    console.log("🚀 Opening Elavon Lightbox with token:", sessionToken);
    const frameEl = document.getElementById("id_payment_add_card");
    if (!frameEl) {
      console.error("❌ Frame element not found in DOM!");
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
      ssl_transaction_type: type == "card" ? "ccaddtoken" : "ecsale",
      ssl_amount: "1.00",
    };

    console.log("📤 Opening Elavon Lightbox with data:", paymentData);

    const callbacks = {
      onReady: () => {
        console.log("✅ Lightbox ready");
        setIframeVisible(true);
      },
      onError: (error: any) => {
        console.error("❌ Elavon error:", error);
        showResultAddCard("error", error);
      },
      onCancelled: () => {
        console.warn("⚠️ User cancelled payment");
        showResultAddCard("cancelled", "");
      },
      onDeclined: (response: any) => {
        console.warn("❌ Payment declined:", response);
        showResultAddCard("declined", JSON.stringify(response, null, 2));
      },
      onApproval: (response: any) => {
        console.log("✅ Payment approved:", response);
        showResultAddCard("approval", response);
      },
    };

    const options = {
      frame: frameEl,
      cssOverride:
        "html, body { background-color: rgba(244,246,246,1.0) } " +
        ".hpm-content { box-shadow:unset; margin-top:unset; } " +
        ".hpm-input-short { margin-bottom:0px; } " +
        "md-card { box-shadow:unset; background-color:#f4f6f6; }",
    };

    try {
      console.log("Opening Elavon Lightbox...", sessionToken);
      // (window as any).PayWithConverge?.open(paymentData, callbacks, options);
      (window as any).PayWithConverge?.open({
        ssl_txn_auth_token: sessionToken,
        ssl_transaction_type: "ccaddtoken",
        ssl_invoice_number: invoiceId,
        ssl_first_name: "Test",
        ssl_last_name: "User",
        ssl_add_token: "Y",
        ssl_verify: "Y",
        ssl_amount: "1.00",
      });

      console.error(
        "Trying to open Elavon Lightbox...",
        paymentData,
        callbacks,
        options
      );

      // (window as any).PayWithConverge.open(paymentData, callbacks, options);
      (window as any).PayWithConverge?.open(
        {
          ssl_txn_auth_token: sessionToken,
          ssl_transaction_type: type == "card" ? "ccaddtoken" : "ecsale",

          ssl_invoice_number: invoiceId,
          ssl_first_name: "Test",
          ssl_last_name: "User",
          ssl_add_token: "Y",
          ssl_verify: "Y",
          ssl_amount: "1.00",
        },
        callbacks,
        options
      );
    } catch (err) {
      console.error("❌ Elavon open() failed:", err);
    }
  };

  // 🧩 STEP 3: Handle Elavon callback results
  const showResultAddCard = async (status: string, msg: any) => {
    console.log("txn_status_add_card:", status);
    console.log("txn_response_add_card:", msg);

    if (status === "approval") {
      const elavonResData = msg;
      setLoading(true);
      onSuccess(elavonResData);
      // try {
      //   const response = await fetch(addCardUrl, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       user_id: userId,
      //       customer_id: stored?.body?.customer_id,
      //       pay_now_hidden: 0,
      //       is_one_time: 0,
      //       is_card: 1,
      //       credit_card_number: elavonResData.ssl_card_number,
      //       card_type: elavonResData.ssl_card_short_description,
      //       expiration: elavonResData.ssl_exp_date,
      //       token: elavonResData.ssl_token,
      //     }),
      //   });

      //   const result = await response.json();
      //   console.log("✅ Card saved:", result);
      //   alert("Card successfully added!");
      // } catch (error) {
      //   console.error("❌ Failed to save card:", error);
      // } finally {
      //   setLoading(false);
      //   const frameEl = document.getElementById("id_payment_add_card");
      //   if (frameEl) {
      //     frameEl.innerHTML = "";
      //   }
      //   setIframeVisible(false);

      //   // 🔹 Close SDK session if still open
      //   if ((window as any).PayWithConverge?.close) {
      //     (window as any).PayWithConverge.close();
      //   }

      //   console.log("🔁 Elavon SDK reset — ready for next open()");
      // }
    } else {
      alert("This payment was not approved or cancelled.");
      const frameEl = document.getElementById("id_payment_add_card");
      if (frameEl) {
        frameEl.innerHTML = "";
      }
      setIframeVisible(false);

      // 🔹 Close SDK session if still open
      if ((window as any).PayWithConverge?.close) {
        (window as any).PayWithConverge.close();
      }

      console.log("🔁 Elavon SDK reset — ready for next open()");
    }
  };

  // 🧩 STEP 4: Full flow trigger
  const handleAddCard = async () => {
    try {
      setLoading(true);
      await loadElavonSDK(); // load SDK
      const token = await getSessionTokenAddCard(); // fetch token
      await openLightboxAddCard(token); // open lightbox
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
        {loading ? "Processing..." : sdkLoaded ? "Add Card" : "Load & Add Card"}
      </button>

      {/* Lightbox Frame */}
      <div
        id="id_payment_add_card"
        style={{
          // display: iframeVisible ? "block" : "none",
          width: "100%",
          height: "600px",
          marginTop: "1rem",
          backgroundColor: "#f4f6f6",
        }}
      />

      {loading && (
        <div className="mt-4 text-gray-600 text-sm">Please wait...</div>
      )}
    </div>
  );
};

export default ElavonAddCard;
