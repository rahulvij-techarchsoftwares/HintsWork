const express = require("express");
const router = express.Router();
const { contactForm } = require("../controllers/bookdemoformController");

router.post("/book-demo", contactForm);

module.exports = router;
