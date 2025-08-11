// withSkeleton.tsx
import React, { ReactNode } from "react";
import { Skeleton } from "@mui/material";
import { useLoading } from "./LoadingProvider";

interface WithSkeletonProps {
  children?: ReactNode;
}

export default function withSkeleton<P>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P & WithSkeletonProps) {
    const { contextLoading } = useLoading();

    if (contextLoading) {
      return (
        <div style={{ width: "100%" }}>
          <Skeleton variant="rectangular" height={50} />
          <Skeleton variant="text" />
          <Skeleton
            variant="rectangular"
            height={200}
            style={{ marginTop: 16 }}
          />
        </div>
      );
    }

    return <Component {...props}>{props.children}</Component>;
  };
}
