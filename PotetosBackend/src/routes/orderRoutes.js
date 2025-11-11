const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/', orderController.getAllOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/active', orderController.getActiveOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', roleMiddleware('admin', 'mesero'), orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', roleMiddleware('admin'), orderController.deleteOrder);

module.exports = router;