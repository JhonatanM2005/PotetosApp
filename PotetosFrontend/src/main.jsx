/**
 * PotetosApp - Sistema de Gestión para Restaurantes
 *
 * Copyright (c) 2025 Jhonatan Mendez
 *
 * This software is licensed under the MIT License.
 * See the LICENSE file in the root directory for full license text.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans antialiased">
      <App />
      <Toaster position="top-right" />
    </div>
  </StrictMode>
);
