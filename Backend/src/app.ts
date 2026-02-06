import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import router from "./routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use( cors({
    origin: [
      "http://localhost:3000",
      "https://email-job-schedulers.vercel.app"
    ],
    credentials: true,
  }),
);

app.use(passport.initialize());

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use("/api/v1", router);

export default app;
