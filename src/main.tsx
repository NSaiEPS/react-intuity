import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./styles/global.css"; // global styles
import Layout from "./components/core/layout";
import { router } from "./App";
import { LoadingProvider } from "./components/core/skeletion-context";
import { UserProvider } from "./contexts/user-context";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <LoadingProvider>
        <Layout>
          <RouterProvider router={router} />
        </Layout>
      </LoadingProvider>
    </UserProvider>
  </React.StrictMode>
);
