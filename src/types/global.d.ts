export {};

declare global {
  interface Window {
    PayWithConverge?: {
      open: (
        paymentData: Record<string, any>,
        callbacks: {
          onReady?: () => void;
          onError?: (error: any) => void;
          onCancelled?: () => void;
          onDeclined?: (response: any) => void;
          onApproval?: (response: any) => void;
        },
        options?: Record<string, any>
      ) => void;
    };
  }
}
