import Product from '../models/product.js';
import { isAdmin } from './userController.js';  

export function saveProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to add a product"
        });
    }

    const product = new Product(req.body);

    product.save()
        .then(savedProduct => {
            res.status(201).json({
                message: "Product saved successfully",
                product: savedProduct
            });
        })
        .catch(err => {
            res.status(500).json({
                message: "Error saving product",
                error: err
            });
        });
}
