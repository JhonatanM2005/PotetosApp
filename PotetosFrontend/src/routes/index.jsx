import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Layout from "@/components/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/* Rutas públicas adicionales */}
        {/* <Route path="/menu" element={<Menu />} /> */}
        {/* <Route path="/about" element={<About />} /> */}
      </Route>

      {/* Rutas privadas (dashboard, etc) */}
      {/* <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route> */}
    </Routes>
  );
}
