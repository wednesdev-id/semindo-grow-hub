import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new MarketplaceController();

// Public routes
router.get('/products', controller.findAllProducts);
router.get('/products/:slug', controller.findProductBySlug);

// Protected routes
router.use(authenticate);
router.post('/products', controller.createProduct); // Seller only? For now, any auth user
router.post('/orders', controller.createOrder);
router.get('/orders', controller.getMyOrders);
router.get('/orders/:id', controller.getOrder);
router.patch('/orders/:id/status', controller.updateOrderStatus); // Admin/Seller only? Add middleware later

// Product Management
router.get('/my-products', controller.getMyProducts);
router.patch('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

export const marketplaceRouter = router;
