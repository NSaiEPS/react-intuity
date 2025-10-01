import ReactDOM from "react-dom/client";

let iframeRoot: ReactDOM.Root | null = null;

export const renderIframeRoot = (node: React.ReactNode) => {
  console.log("rendered", "renderIframeRoot");
  const container = document.getElementById("iframe-root");
  if (!container) return;

  if (!iframeRoot) {
    iframeRoot = ReactDOM.createRoot(container);
  }
  iframeRoot.render(node);
};

export const unmountIframeRoot = () => {
  const container = document.getElementById("iframe-root");
  if (iframeRoot && container) {
    iframeRoot.unmount();
    iframeRoot = null;
  }
};
