import "dotenv/config";
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import postsRouter from "./routes/posts";

const app = express();

app.use(express.json());

// Assignment-only authentication stub. Replace it with real auth before deployment.
const stubAuth: RequestHandler = (req, _res, next) => {
  req.user = { id: 1 };
  next();
};

app.use(stubAuth);
app.use("/posts", postsRouter);

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  console.error("Unhandled request error:", error);
  res.status(500).json({ error: "internal server error" });
};

app.use(errorHandler);

export default app;

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  app.listen(port, () => {
    console.log(`Threadbase API listening on http://localhost:${port}`);
  });
}
