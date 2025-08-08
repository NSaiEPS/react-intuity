// withSkeleton.tsx
import React, { useEffect, useState } from "react";

import { Skeleton } from "@mui/material";

const WithSkeleton = (Component: React.ComponentType<any>) => {
  return function WrappedComponent(props: any) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Simulate delay — replace with your API call
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }, []);

    if (loading) return <Skeleton variant="rounded" width={210} height={60} />;
    return <Component {...props} />;
  };
};

export default WithSkeleton;
