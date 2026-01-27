import {Router} from 'express';
import {authRouter} from './auth.routes';
import emailRouter from './email.routes';


const router = Router();

router.use('/auth', authRouter);
router.use('/emails', emailRouter);

export default router;