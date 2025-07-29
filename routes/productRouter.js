import express from 'express';
import { saveProduct , deleteProduct, getProducts, updateProduct, getProductById} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/", getProducts);
productRouter.put("/:productId", updateProduct); 
productRouter.get("/:productId",getProductById);

export default productRouter;