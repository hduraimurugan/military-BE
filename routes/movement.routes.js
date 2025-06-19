import express from 'express';
import { verifyAccessToken, verifyRefreshToken, verifyRole } from '../middleware/verifyToken.js';
import {
    getAllLogs,
} from '../controllers/movement.Controller.js';

const router = express.Router();

// ✅ For admins
router.get('/', verifyAccessToken, verifyRole(['admin']), getAllLogs); //verifyRole(['admin'])

export default router;
