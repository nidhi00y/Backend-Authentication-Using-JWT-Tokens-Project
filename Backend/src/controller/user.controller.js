import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import cookie from 'cookie-parser';
import https from 'https';
import axios from 'axios';

async function register(req, res) {
    const {username, email, password} = req.body;
    if(!username || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }
    
    const alreadyExists = await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(alreadyExists) {
        return res.status(400).json({message: "Username or email already exists"});
    }

    try {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const user = new User({username, email, password:hashedPassword});
        const accessToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '15m'});
        const refreshToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        user.refreshtoken = refreshToken;
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60  
        });
        await user.save();
        res.status(201).json({message: "User registered successfully",user,accessToken});
    } catch (error) {
        res.status(500).json({message: "Registration failed", error: error.message});
    }

}

async function login(req, res) {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({message: "Email and password are required"});
    }
    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isMatch = crypto.createHash('sha256').update(password).digest('hex') === user.password;
        if(!isMatch) {
            return res.status(400).json({message: "Invalid email or password"});
        }
        const accessToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '15m'});
        const refreshToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        user.refreshtoken = refreshToken;
        await user.save();
        res.status(200).json({message: "Login successful",user, accessToken});
    } catch (error) {
        res.status(500).json({message: "Login failed", error: error.message});
    }

}

async function getProfile(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }
    console.log("Received token:", token);
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshtoken == null) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            try {
                const response = await axios.get(
                    'http://localhost:8080/api/auth/refresh',
                    { withCredentials: true }
                );

                return res.json({
                    message: "Token refreshed",
                    token: response.data.accessToken
                });

            } catch (refreshErr) {
                return res.status(401).json({ message: "Refresh failed" });
            }
        }

        return res.status(401).json({ message: "Invalid token " });
    }
}

async function refresh(req, res) {
    const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return res.status(401).json({message: "Refresh token not found"});
        }
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if(!user || user.refreshtoken !== refreshToken) {
                return res.status(401).json({message: "Invalid refresh token"});
            }
            const newAccessToken = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '15m'});
            res.status(200).json({accessToken: newAccessToken});
        } catch (error) {
            res.status(401).json({message: "Invalid refresh token", error: error.message});
        }
}

async function logout(req, res){
    const token = req.cookies.refreshToken;
    if(!token) {
        return res.status(400).json({message: "Refresh token not found"});
    }
    try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if(!user) {
                return res.status(401).json({message: "Invalid refresh token"});
            }
            user.refreshtoken = null;
            await user.save();
            res.status(200).json({message: "Logout successful"});
        } catch (error) {
            res.status(401).json({message: "Invalid refresh token", error: error.message});
        }

}
  
export {register, login, getProfile, refresh, logout};