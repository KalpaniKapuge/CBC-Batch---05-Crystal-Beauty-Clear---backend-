import Order from '../models/order.js';
import Product from '../models/product.js';
import { isAdmin } from './userController.js';

export async function createOrder(req, res) {
  if (!req.user) {
    return res.status(403).json({
      message: 'Please login and try again',
    });
  }

  const orderInfo = req.body;

  if (!Array.isArray(orderInfo.products) || orderInfo.products.length === 0) {
    return res.status(400).json({ message: 'No products provided in order.' });
  }

  // Auto-fill name if not provided
  if (!orderInfo.name) {
    orderInfo.name = `${req.user.firstName} ${req.user.lastName}`;
  }

  let orderId = 'CRY00001';

  try {
    const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].orderId; // e.g., "CRY00042"
      const lastOrderNumberString = lastOrderId.replace(/^CRY/, ''); // "00042"
      const lastOrderNumber = parseInt(lastOrderNumberString, 10);
      const newOrderNumber = lastOrderNumber + 1;
      const newOrderNumberString = String(newOrderNumber).padStart(5, '0');
      orderId = `CRY${newOrderNumberString}`;
    }

    let total = 0;
    let labelledTotal = 0;
    const products = [];

    for (const prod of orderInfo.products) {
      const item = await Product.findOne({ productId: prod.productId });

      if (!item) {
        return res.status(404).json({
          message: `Product with ID ${prod.productId} not found`,
        });
      }

      if (item.isAvailable === false) {
        return res.status(400).json({
          message: `Product with ID ${prod.productId} is not available`,
        });
      }

      const quantity = prod.quantity || 1;

      products.push({
        productId: item.productId,
        name: item.name,
        altNames: item.altNames,
        description: item.description,
        images: item.images,
        labelledPrice: item.labelledPrice,
        price: item.price,
        quantity,
      });

      total += item.price * quantity;
      labelledTotal += item.labelledPrice * quantity;
    }

    const order = new Order({
      orderId,
      name: orderInfo.name,
      email: req.user.email,
      phone: orderInfo.phone,
      address: orderInfo.address,
      total,
      labelledTotal,
      products,
      status: 'pending',
    });

    const createdOrder = await order.save();

    return res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to create order',
      error: err.message,
    });
  }
}

export async function getOrders(req, res) {
  if (!req.user) {
    return res.status(403).json({
      message: 'Please login and try again',
    });
  }

  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find();
    } else {
      orders = await Order.find({ email: req.user.email });
    }
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch orders',
      error: err.message || err,
    });
  }
}

export async function updateOrderStatus(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: 'You are not authorized to update order status',
    });
  }

  try {
    const orderId = req.params.orderId;
    // prefer status from body, fallback to param
    const rawStatus = req.body?.status || req.params.status || '';
    const status = String(rawStatus).toLowerCase();

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'completed', 'canceled', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await Order.updateOne(
      { orderId },
      { status }
    );

    if (updated.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({
      message: 'Order status updated successfully',
    });
  } catch (e) {
    return res.status(500).json({
      message: 'Failed to update order status',
      error: e.message || e,
    });
  }
}
