import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import MenuPage from "@/pages/public/Menu";
import About from "@/pages/public/About";
import Layout from "@/components/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/about" element={<About />} />
        {/* Rutas públicas adicionales */}
      </Route>

      {/* Rutas privadas (dashboard, etc) */}
      {/* <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route> */}
    </Routes>
  );
}
