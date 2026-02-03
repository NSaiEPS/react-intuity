export {};

declare global {
  interface Window {
    PayWithConverge?: {
      close: any;
      open: (
        paymentData: Record<string, any>,
        callbacks: {
          onReady?: () => void;
          onError?: (error: unknown) => void;
          onCancelled?: () => void;
          onDeclined?: (response: unknown) => void;
          onApproval?: (response: unknown) => void;
        },
        options?: Record<string, any>
      ) => void;
    };
  }
}
