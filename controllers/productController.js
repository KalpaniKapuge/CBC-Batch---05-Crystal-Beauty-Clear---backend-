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

export async function getProducts(req,res){
    try{
        if(isAdmin(req)){
            const products = await Product.find();
            res.status(200).json(products);
        }else{
            const products = await Product.find({isAvailable: true});
            res.status(200).json(products);
        }
    }catch(err){
        res.status(500).json({
            message: "Failed to get products",
            error: err
        });
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to delete a product"
        })
        return
    }
    try{
        await Product.deleteOne({productId: req.params.productId});
        res.status(200).json({
            message: "Product deleted successfully"
        });
    }catch(err){
        res.status(500).json({
            message: "Failed to delete product",
            error: err
        });
    }
    
}