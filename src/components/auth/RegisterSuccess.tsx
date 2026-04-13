import { Box, Typography } from "@mui/material";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
import { paths } from "@/utils/paths";

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const slugMatch = pathname.startsWith("/register-success-")
    ? pathname.replace("/register-success-", "")
    : null;

  const handleBackToLogin = () => {
    if (slugMatch) {
      navigate(paths.auth.newLogin(slugMatch));
    } else {
      navigate(paths.auth.newLogin());
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="50vh"
      textAlign="center"
    //   gap={2}
    //   px={3}
    >
      <Helmet key={"Register Success"}>
        <title>Registration Successful</title>
      </Helmet>

      <CheckCircle size={80} weight="fill" color="#2e7d32" />

      <Typography variant="h5" fontWeight={600} mt={1}>
        Registration Successful!
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 460, lineHeight: 1.7 }}
      >
        An email has been sent to the notification email you provided. Please
        follow the instructions in that email to finish activating your account.
      </Typography>

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
      </Button>
    </Box>
  );
};

export default RegisterSuccess;