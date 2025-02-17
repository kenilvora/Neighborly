import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer/store.ts";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";

const store = configureStore({
  reducer: rootReducer,
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
);
