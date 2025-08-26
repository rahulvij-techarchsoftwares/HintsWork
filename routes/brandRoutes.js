const express = require("express");
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const { addBrand, editBrand, deleteBrand, getAllBrands } = require("../controllers/brandController");

router.post("/add-brands", authenticate, addBrand);
router.put("/edit-brands/:id", authenticate, editBrand);
router.delete("/delete-brands/:id", authenticate, deleteBrand);
router.get("/get-all-brands", authenticate, getAllBrands);

module.exports = router;
