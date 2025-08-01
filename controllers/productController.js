import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

// save product
export function saveProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to add a product",
    });
  }

  const product = new Product(req.body);

  product
    .save()
    .then((savedProduct) => {
      res.status(201).json({
        message: "Product saved successfully",
        product: savedProduct,
      });
    })
    .catch((err) => {
      const response = {
        message: "Error saving product",
        error: err,
      };
      if (err.code === 11000) {
        response.message = "Product with that ID already exists";
      }
      res.status(500).json(response);
    });
}

// get products
export async function getProducts(req, res) {
  try {
    let products;
    if (isAdmin(req)) {
      products = await Product.find();
    } else {
      products = await Product.find({ isAvailable: true });
    }
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to get products",
      error: err,
    });
  }
}

// delete product
export async function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to delete a product",
    });
  }

  try {
    const result = await Product.deleteOne({ productId: req.params.productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: err,
    });
  }
}

// update product
export async function updateProduct(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "You are not authorized to update a product",
    });
  }

  const productId = req.params.productId;
  const updatingData = req.body;

  try {
    const result = await Product.updateOne({ productId }, updatingData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update product",
      error: err,
    });
  }
}

// get product by id
export async function getProductById(req, res) {
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({
      productId: productId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.isAvailable) {
      return res.status(200).json(product);
    } else {
      if (!isAdmin(req)) {
        return res.status(404).json({
          message: "Product not found",
        });
      } else {
        return res.status(200).json(product);
      }
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err,
    });
  }
}

export async function searchProducts(req, res) {
  const searchQuery = req.params.searchQuery || "";

  if (!searchQuery.trim()) {
    return res.status(200).json([]);
  }

  try {
    const products = await Product.find({
      isAvailable: true,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        {
          altNames: {
            $exists: true,
            $ne: null,
            $elemMatch: { $regex: searchQuery, $options: "i" },
          },
        },
      ],
    });

    return res.status(200).json(products);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
}
