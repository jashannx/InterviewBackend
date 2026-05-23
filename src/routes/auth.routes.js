import express from 'express';
const router = express.Router();
import {register ,login,logout,getUser } from '../controllers/auth.controller.js';
import authUser from '../middlewares/auth.middleware.js';
router.post('/register',register);

router.post('/login', login);
router.get('/logout', logout);
router.get('/verify', authUser, getUser);
export default router;