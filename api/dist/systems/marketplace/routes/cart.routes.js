"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All cart routes require auth
router.get('/cart', cart_controller_1.cartController.getCart);
router.post('/cart/items', cart_controller_1.cartController.addToCart);
router.patch('/cart/items/:id', cart_controller_1.cartController.updateCartItem);
router.delete('/cart/items/:id', cart_controller_1.cartController.removeCartItem);
router.delete('/cart', cart_controller_1.cartController.clearCart);
exports.cartRouter = router;
