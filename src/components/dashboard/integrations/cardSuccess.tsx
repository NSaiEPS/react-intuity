import { useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useNavigate } from "react-router-dom";

const CardSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-1); // navigate back
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
