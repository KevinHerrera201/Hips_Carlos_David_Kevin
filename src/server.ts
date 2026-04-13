import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { login, register } from "./auth";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("src/public"));

// LOGIN
app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  const result = await login(usuario, password);
  res.json(result);
});

// REGISTRO
app.post("/register", async (req, res) => {
  const { usuario, password, rol } = req.body;

  const result = await register(usuario, password, rol);

  res.json(result);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});