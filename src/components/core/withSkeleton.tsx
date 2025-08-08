// withSkeleton.tsx
import React from "react";
import { Skeleton } from "@mui/material";
import { useLoading } from "./LoadingProvider";

export default function withSkeleton<P>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    const { loading } = useLoading();

    if (loading) {
      return (
        <>
          <Skeleton variant="rectangular" height={50} />
          <Skeleton variant="text" />
        </>
      );
    }

    return <Component {...props} />;
  };
}
