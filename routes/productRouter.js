import express from 'express';
import { saveProduct , deleteProduct, getProducts} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/", getProducts);

export default productRouter;