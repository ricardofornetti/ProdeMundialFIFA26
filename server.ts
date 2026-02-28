import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "gallery_persistence.json");

// Aumentar el límite para permitir base64 grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Inicializar archivo de persistencia si no existe
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

// API: Obtener imágenes guardadas
app.get("/api/gallery", (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Error al leer los datos de la galería" });
  }
});

// API: Guardar una imagen
app.post("/api/gallery", (req, res) => {
  try {
    const { year, index, url } = req.body;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    
    if (!data[year]) data[year] = {};
    data[year][index] = url;
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar la imagen" });
  }
});

// Vite middleware para desarrollo
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "dist/index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
