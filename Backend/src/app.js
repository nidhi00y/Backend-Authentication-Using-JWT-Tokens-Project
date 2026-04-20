import express from "express"
import morgan from "morgan"
import authrouter from "./routes/user.router.js"
import cors from "cors"
import cookie from "cookie-parser"

const app = express()

app.use(express.json())
app.use(morgan("dev"))

app.use(cors({
  origin: "http://localhost:5173", // your React (Vite) URL
  credentials: true
}));

app.use(cookie())

app.use("/api/auth",authrouter)

export default app;