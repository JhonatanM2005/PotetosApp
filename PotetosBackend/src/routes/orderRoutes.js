const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware('admin', 'mesero'), orderController.createOrder);
router.get('/active', orderController.getActiveOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;