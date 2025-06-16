import express from 'express';
import { createBase, getAllBases, getBaseById, updateBase, deleteBase } from '../controllers/base.Controller.js';
import { createAsset, getAllAssets,getAssetById , updateAsset, deleteAsset} from '../controllers/asset.Controller.js';
import { verifyAccessToken } from '../middleware/verifyToken.js';

const router = express.Router();

// asset.routes.js
router.post('/assets/create', createAsset);
router.get('/assets/get', getAllAssets);
router.get('/assets/get/:id', getAssetById);
router.put('/assets/update/:id', updateAsset);
router.delete('/assets/delete/:id', deleteAsset);

// base.routes.js
router.post('/bases/create', createBase);
router.get('/bases/get', getAllBases);
router.get('/bases/get/:id', getBaseById);
router.put('/bases/update/:id', updateBase);
router.delete('/bases/delete/:id', deleteBase);


export default router;
