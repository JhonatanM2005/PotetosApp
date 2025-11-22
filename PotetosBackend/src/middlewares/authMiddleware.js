const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user || !user.is_active) {
      console.log("❌ Usuario no encontrado o inactivo");
      return res
        .status(401)
        .json({ message: "Invalid token or user inactive" });
    }

    // Verificar que el token coincida con el session_token guardado
    console.log("🔐 Validando session_token...");
    console.log("  Token recibido:", token.substring(0, 30) + "...");
    console.log("  Session token en DB:", user.session_token ? user.session_token.substring(0, 30) + "..." : "NULL");
    console.log("  ¿Coinciden?", user.session_token === token);
    
    if (user.session_token && user.session_token !== token) {
      console.log("⚠️ SESIÓN RECHAZADA: Token no coincide con session_token en DB");
      return res.status(401).json({
        message: "Session closed from another device",
        code: "SESSION_REPLACED",
      });
    }
    
    console.log("✅ Token validado correctamente");

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = authMiddleware;
