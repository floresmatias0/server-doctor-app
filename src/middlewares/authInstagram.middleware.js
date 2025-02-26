const jwt = require("jsonwebtoken");

const verifyBasicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return res.status(401).json({ message: "No credentials provided" });
  }

  // Decodificar el usuario y contraseña
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");

  // Verificar las credenciales (reemplaza con tu lógica real)
  const validUser = process.env.BASIC_AUTH_USER || "admin";
  const validPassword = process.env.BASIC_AUTH_PASSWORD || "1234";

  if (username !== validUser || password !== validPassword) {
    return res.status(403).json({ message: "Invalid credentials" });
  }

  next(); // Permite continuar con la petición
};
module.exports = {verifyBasicAuth}