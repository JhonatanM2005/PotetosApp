import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import MenuPage from "@/pages/public/Menu";
import Layout from "@/components/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />
        {/* Rutas públicas adicionales */}
        {/* <Route path="/about" element={<About />} /> */}
      </Route>

      {/* Rutas privadas (dashboard, etc) */}
      {/* <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route> */}
    </Routes>
  );
}
