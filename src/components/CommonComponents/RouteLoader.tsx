//

// import { useEffect, useState, useTransition } from 'react';
// import { usePathname } from 'next/navigation';

// export default function RouteLoader() {
//   const pathname = usePathname();
//   const [isPending, startTransition] = useTransition();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // When pathname changes, set loading true for a short period
//     setLoading(true);
//     const timeout = setTimeout(() => setLoading(false), 500); // Adjust delay as needed
//     return () => clearTimeout(timeout);
//   }, [pathname]);

//   if (!loading) return null;

//   return <div className="route-loader">Loading...</div>;
// }

import { useEffect, useState } from "react";

import { Backdrop, CircularProgress } from "@mui/material";
import { useLocation } from "react-router";

export default function RouteLoader() {
  const location = useLocation();
  const pathname = location.pathname;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When pathname changes => show loader briefly
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // adjust timing
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <Backdrop
      open={loading}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: "blue",
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
