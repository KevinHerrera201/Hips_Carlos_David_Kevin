import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { register } from "./auth";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 🔥 IMPORTANTE: API REGISTER
app.post("/register", async (req, res) => {
  console.log("BODY:", req.body);

  const { usuario, password, rol } = req.body;

  const result = await register(usuario, password, rol);

  res.json(result);
});

// 🔥 TEST para verificar backend activo
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});