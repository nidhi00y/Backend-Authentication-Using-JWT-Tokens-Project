import {Router} from 'express';
import { register,login,logout,refresh,getProfile } from '../controller/user.controller.js';

const authrouter = Router()

authrouter.post("/register",register)
authrouter.get("/get-me",getProfile)
authrouter.get("/refresh",refresh)
authrouter.get("/logout",logout)
authrouter.post("/login",login)


export default authrouter;