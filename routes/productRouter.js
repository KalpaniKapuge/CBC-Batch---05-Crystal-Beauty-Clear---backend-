import express from 'express';
import { saveProduct , deleteProduct, getProducts, updateProduct} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/", getProducts);
productRouter.put("/:productId", updateProduct); // Assuming you want to update the product with the same route

export default productRouter;