import express from "express"
import morgan from "morgan"
import authrouter from "./routes/user.router.js"
import cors from "cors"
import cookie from "cookie-parser"

const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use(cors())
app.use(cookie())

app.use("/api/auth",authrouter)

export default app;