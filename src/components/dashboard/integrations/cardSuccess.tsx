import { useEffect } from 'react';
import { getLocalStorage } from '@/utils/auth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const CardSuccess = ({ oneTimePayment = false }) => {
  //   useEffect(() => {
  //     const timer = setTimeout(() => {

  //       navigate(-1); // navigate back
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }, [navigate,searchParams]);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // helper to clean params
  const sanitize = (val: string | null) => {
    if (!val) return null;
    // decode URI, remove quotes and trim extra dots
    const cleaned = decodeURIComponent(val)
      .replace(/['"]/g, '') // remove quotes
      .replace(/^\.|\.$/g, ''); // remove leading/trailing dots
    return cleaned;
  };
  const convenienceFee = sanitize(searchParams.get('convenience_fee'));
  let stored: any = getLocalStorage('intuity-user');
  useEffect(() => {
    const timer = setTimeout(() => {
      const id = sanitize(searchParams.get('id'));
      const amount = sanitize(searchParams.get('amount'));
      const transId = sanitize(searchParams.get('transId'));

      if (amount || convenienceFee || transId) {
        // extract company slug => /cape-royale1/dashboard/card-redirect
        const segments = location.pathname.split('/');
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
      <Helmet key={'Card Redirect'}>
        <title>Card Redirect</title>
      </Helmet>
      <CheckCircle size={80} weight="fill" color="#2e7d32" />
      {/* Phosphor success icon (filled green) */}

      <Typography variant="h5" fontWeight={600}>
        {convenienceFee ? 'Transaction Initiated...' : 'Card added successfully'}
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
