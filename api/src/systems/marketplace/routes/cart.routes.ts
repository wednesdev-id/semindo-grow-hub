import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // All cart routes require auth

router.get('/cart', cartController.getCart);
router.post('/cart/items', cartController.addToCart);
router.patch('/cart/items/:id', cartController.updateCartItem);
router.delete('/cart/items/:id', cartController.removeCartItem);
router.delete('/cart', cartController.clearCart);

export const cartRouter = router;
