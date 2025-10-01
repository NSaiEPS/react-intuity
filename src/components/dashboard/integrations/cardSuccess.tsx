import { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useNavigate, useSearchParams } from "react-router-dom";

const CardSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // https://intuity-test-fe.pay.waterbill.com/cape-royale1/dashboard/card-redirect?transId=559622916&id=54305&amount=%27.1.25.%27&convenience_fee=%27.0.25.%27
  //   useEffect(() => {
  //     const timer = setTimeout(() => {

  //       navigate(-1); // navigate back
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }, [navigate,searchParams]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const amount = searchParams.get("amount");
      const convenienceFee = searchParams.get("convenience_fee");
      const id = searchParams.get("id");

      if (amount || convenienceFee) {
        // Extract company slug from pathname => /cape-royale1/dashboard/...
        const segments = location.pathname.split("/");
        const company = segments[1]; // cape-royale1

        // Build target URL
        const target = `/${company}/dashboard/payment-details?id=${id}&amount=${amount}&convenience_fee=${convenienceFee}`;
        navigate(target, { replace: true });
      } else {
        // Fallback to previous page
        navigate(-1);
      }
    }, 2000);

    return () => clearTimeout(timer);
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
      <CheckCircle size={80} weight="fill" color="#2e7d32" />
      {/* Phosphor success icon (filled green) */}

      <Typography variant="h5" fontWeight={600}>
        Card added successfully
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
