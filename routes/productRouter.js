import express from 'express';
import {
  saveProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  getProductById,
  searchProducts
} from '../controllers/productController.js';

const productRouter = express.Router();

// search must come before dynamic :productId
productRouter.get("/search/:searchQuery", searchProducts);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/", getProducts);
productRouter.put("/:productId", updateProduct);
productRouter.get("/:productId", getProductById);

export default productRouter;
