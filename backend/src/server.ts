import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRouter from "./routers/auth";
import pollsRouter from "./routers/polls";
import usersRouter from "./routers/users";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/auth", authRouter);
app.use("/polls", pollsRouter);
app.use("/users", usersRouter);

app.get("/ping", (req: Request, res: Response) => {
  res.send({ status: "ok", message: "pong" });
});

app.get("/", (req: Request, res: Response) => {
  console.log(req.cookies);
  res.status(404).send("no link matched!");
});

export default app;
