import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { environment } from "./config/environment";

import productRoutes from "./products/routes/productRoutes";
import categoryRoutes from "./products/routes/categoryRoute";
import { extractUserFromHeader } from "./products/middleware/userExtractor";

const app: Express = express();

app.use(express.json({ type: ["application/json", "text/plain"] }));

app.use(
  cors({
    origin: environment.CORS_ORIGIN,
    credentials: true,
  })
);

mongoose
  .connect(environment.DB_URI || "")
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.use(extractUserFromHeader);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

interface ErrorWithMessage extends Error {
  status?: number;
}

app.use((err: ErrorWithMessage, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: "Une erreur est survenue",
    error: err.message,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route non trouvée" });
});

export default app;
