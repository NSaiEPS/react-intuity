// withSkeleton.tsx
import React, { ReactNode } from "react";
import { Skeleton } from "@mui/material";
import { useLoading } from "./skeletion-context";

interface WithSkeletonProps {
  children?: ReactNode;
}
export const SkeletonWrapper = withSkeleton(({ children }) => <>{children}</>);

export default function withSkeleton<P>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P & WithSkeletonProps) {
    const { contextLoading } = useLoading();

    if (contextLoading) {
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <Skeleton variant="rectangular" height={50} />
          <Skeleton variant="text" />
          <Skeleton
            variant="rectangular"
            height={500}
            style={{ marginTop: 16 }}
          />
        </div>
      );
    }

    return <Component {...props}>{props.children}</Component>;
  };
}
