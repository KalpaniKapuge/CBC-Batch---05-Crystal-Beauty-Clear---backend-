import Order from '../models/order.js';
import Product from '../models/product.js'; 

export async function createOrder(req, res) {
    if (!req.user) {
        return res.status(403).json({
            message: "Please login and try again"
        });
    }

    const orderInfo = req.body;

    // Auto-fill name if not provided
    if (!orderInfo.name) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName;
    }

    let orderId = "CRY00001";

    try {
        const lastOrder = await Order.find().sort({ date: -1 }).limit(1);

        if (lastOrder.length > 0) {
            const lastOrderId = lastOrder[0].orderId;
            const lastOrderNumberString = lastOrderId.replace("CRY", "");
            const lastOrderNumber = parseInt(lastOrderNumberString);
            const newOrderNumber = lastOrderNumber + 1;
            const newOrderNumberString = String(newOrderNumber).padStart(5, '0');
            orderId = "CRY" + newOrderNumberString;
        }

        let total = 0;
        let labelledTotal = 0;
        const products = [];

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId: orderInfo.products[i].productId });

            if (!item) {
                return res.status(404).json({
                    message: `Product with ID ${orderInfo.products[i].productId} not found`
                });
            }

            if (item.isAvailable === false) {
                return res.status(404).json({
                    message: `Product with ID ${orderInfo.products[i].productId} is not available`
                });
            }

            const quantity = orderInfo.products[i].quantity;

            products.push({
                productId: item.productId,
                name: item.name,
                altNames: item.altNames,
                description: item.description,
                images: item.images,
                labelledPrice: item.labelledPrice,
                price: item.price,
                quantity: quantity
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
            total: total,
            labelledTotal: labelledTotal,
            products: products
        });

        const createdOrder = await order.save();

        return res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to create order",
            error: err.message
        });
    }
}
