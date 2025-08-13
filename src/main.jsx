
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(<><App /><Toaster position="bottom-center" /></>);
