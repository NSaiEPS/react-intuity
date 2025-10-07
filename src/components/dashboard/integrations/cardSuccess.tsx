import { useEffect } from "react";
import { getLocalStorage, removeLocalStorage } from "@/utils/auth";
import { Box, CircularProgress, Typography } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { oneTimePayment } from "@/state/features/accountSlice";
import { useDispatch } from "react-redux";

const CardSuccess = ({ isOneTimePayment = false }) => {
  //   useEffect(() => {
  //     const timer = setTimeout(() => {

  //       navigate(-1); // navigate back
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }, [navigate,searchParams]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // helper to clean params
  const sanitize = (val: string | null) => {
    if (!val) return null;
    // decode URI, remove quotes and trim extra dots
    const cleaned = decodeURIComponent(val)
      .replace(/['"]/g, "") // remove quotes
      .replace(/^\.|\.$/g, ""); // remove leading/trailing dots
    return cleaned;
  };
  const convenienceFee = sanitize(searchParams.get("convenience_fee"));
  let stored: any = getLocalStorage("intuity-user");
  const worldPlayDetails = getLocalStorage("worldplay-details");
  console.log("worldPlayDetails", worldPlayDetails);
  useEffect(() => {
    const id = sanitize(searchParams.get("id"));
    const amount = sanitize(searchParams.get("amount"));
    const transId = sanitize(searchParams.get("transId"));
    const card_id = sanitize(searchParams.get("card_id"));

    if (!isOneTimePayment) {
      const timer = setTimeout(() => {
        if (amount || convenienceFee || transId) {
          // extract company slug => /cape-royale1/dashboard/card-redirect
          const segments = location.pathname.split("/");
          const company = segments[1]; // cape-royale1

          // build new search params
          const query = new URLSearchParams({
            ...(id ? { id } : {}),
            ...(amount ? { amount } : {}),
            ...(convenienceFee ? { convenience_fee: convenienceFee } : {}),
            ...(transId ? { transId } : {}),
          });
          const token = stored?.body?.token;
          if (convenienceFee || amount) {
            const target = `/${company}/dashboard/payment-details?${query.toString()}`;
            navigate(target);
          } else {
            navigate(-1); // fallback
          }
        } else {
          navigate(-1); // fallback
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      const segments = location.pathname.split("/");
      const company = segments[1]; // cape-royale1

      // build new search params
      const query = new URLSearchParams({
        ...(id ? { id } : {}),
        ...(amount ? { amount } : {}),
        ...(convenienceFee ? { convenience_fee: convenienceFee } : {}),
        ...(transId ? { transId } : {}),
      });
      const paymentData = new FormData();
      const worldPlayDetails: any = getLocalStorage("worldplay-details");
      console.log("worldPlayDetails", worldPlayDetails);
      paymentData.append("account_number", worldPlayDetails.account_number);
      paymentData.append("invoice_amount", worldPlayDetails.invoice_amount);
      paymentData.append("company_id", worldPlayDetails.company_id);
      paymentData.append("company_alias", worldPlayDetails.company_alias);
      paymentData.append("customer_id", worldPlayDetails.customer_id);
      paymentData.append(
        "success_authenticate",
        worldPlayDetails.success_authenticate
      );
      paymentData.append("name", worldPlayDetails.name);
      paymentData.append("email", worldPlayDetails.email);
      paymentData.append("billing_id", worldPlayDetails.billing_id);
      paymentData.append("token", transId);
      paymentData.append("is_one_time", worldPlayDetails.is_one_time);
      paymentData.append("is_card", worldPlayDetails.is_card);
      paymentData.append("amount", worldPlayDetails.amount);
      paymentData.append("is_card_one_time", "1");
      paymentData.append("convenienceFee", worldPlayDetails.convenienceFee);
      paymentData.append("totalPayment", worldPlayDetails.totalPayment);
      paymentData.append("paymentType", worldPlayDetails.paymentType);
      paymentData.append("card_id", card_id);

      dispatch(
        oneTimePayment(paymentData, () => {
          console.log("One time payment success callback");
          // removeLocalStorage("worldplay-details");
          // navigate(-1); // fallback
        })
      );
    }
  }, [navigate, location, searchParams]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      gap={2}
    >
      <Helmet key={"Card Redirect"}>
        <title>Card Redirect</title>
      </Helmet>
      <CheckCircle size={80} weight="fill" color="#2e7d32" />
      {/* Phosphor success icon (filled green) */}

      <Typography variant="h5" fontWeight={600}>
        {convenienceFee
          ? "Transaction Initiated..."
          : "Card added successfully"}
      </Typography>

      <Box display="flex" alignItems="center" gap={1} mt={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Redirecting back...
        </Typography>
      </Box>
    </Box>
  );
};

export default CardSuccess;
