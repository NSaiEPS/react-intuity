import { useEffect, useLayoutEffect } from "react";
import { getLocalStorage, removeLocalStorage } from "@/utils/auth";
import { Box, CircularProgress, Typography } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { oneTimePayment } from "@/state/features/accountSlice";
import { useDispatch } from "@/hooks/redux";
import { colors, WorldPlayDetails } from "@/utils";
import { Button } from "nsaicomponents";
import { paths } from "@/utils/paths";

const CardSuccess = ({ isOneTimePayment = false, successPage = false }) => {
  useLayoutEffect(() => {
    document.title = successPage ? "Payment Confirmation" : "Card Redirect";
  }, [successPage]);
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
  let stored: { body?: { token?: string } } | null = getLocalStorage("intuity-user") as { body?: { token?: string } } | null;
  const worldPlayDetails = getLocalStorage("worldplay-details");
  //console.log("worldPlayDetails", worldPlayDetails);
  useEffect(() => {
    const id = sanitize(searchParams.get("id"));
    const amount = sanitize(searchParams.get("amount"));
    const transId = sanitize(searchParams.get("transId"));
    const card_no = sanitize(searchParams.get("card_no"));
    const card_type = sanitize(searchParams.get("card_type"));
    const expiration = sanitize(searchParams.get("expiration"));
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
            ...(card_no ? { card_no } : {}),
            ...(card_type ? { card_type } : {}),
            ...(expiration ? { expiration } : {}),

            paywithoutsave: "true", // add this
            type: "card",
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
      const worldPlayDetails: WorldPlayDetails = getLocalStorage("worldplay-details") as WorldPlayDetails;
      //console.log("worldPlayDetails", worldPlayDetails);
      paymentData.append("account_number", String(worldPlayDetails.account_number));
      paymentData.append("invoice_amount", String(worldPlayDetails.invoice_amount));
      paymentData.append("company_id", String(worldPlayDetails.company_id));
      paymentData.append("company_alias", String(worldPlayDetails.company_alias));
      paymentData.append("customer_id", String(worldPlayDetails.customer_id));
      paymentData.append(
        "success_authenticate",
        String(worldPlayDetails.success_authenticate)
      );
      paymentData.append("name", String(worldPlayDetails.name));
      paymentData.append("email", String(worldPlayDetails.email));
      paymentData.append("billing_id", String(worldPlayDetails.billing_id));
      paymentData.append("token", String(transId));
      paymentData.append("is_one_time", String(worldPlayDetails.is_one_time));
      paymentData.append("is_card", String(worldPlayDetails.is_card));
      paymentData.append("amount", String(worldPlayDetails.amount));
      paymentData.append("is_card_one_time", "1");
      paymentData.append("convenienceFee", String(worldPlayDetails.convenienceFee));
      paymentData.append("totalPayment", String(worldPlayDetails.totalPayment));
      paymentData.append("paymentType", String(worldPlayDetails.paymentType));
      paymentData.append("card_id", String(card_id));

if(!successPage){
      dispatch(
        oneTimePayment(paymentData, () => {
          //console.log("One time payment success callback");
          removeLocalStorage("worldplay-details");
          handleCallBack();
        }, () => {
          handleCallBack();
        })
      );}
    }
  }, [navigate, location, searchParams]);
  const handleCallBack = () => {
    setTimeout(() => {
      navigate(-1); // navigate back
    }, 1000);
  };






//console.log(location.state);
  const handleBackToLogin = () => {
   const alias = location.state?.email;
      navigate(paths.auth.newLogin(alias));
    
  };
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
      <CheckCircle size={80} weight="fill" color="#2e7d32" />
      {/* Phosphor success icon (filled green) */}

      <Typography variant="h5" fontWeight={600}>
        {
        successPage ?'Payment Successful!':
        convenienceFee
          ? "Transaction Initiated..."
          : "Card added successfully"}
      </Typography>
      {
     successPage ?   
         <Button
              onClick={handleBackToLogin}
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors["blue.3"]}
              hoverColor="white"
              style={{ borderRadius: "12px", height: "41px", marginTop: "8px", minWidth: "160px" }}
            >
              Back to Login
            </Button>:

      <Box display="flex" alignItems="center" gap={1} mt={2}>

        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Redirecting back...
        </Typography>
      </Box>}
    </Box>
  );
};

export default CardSuccess;
