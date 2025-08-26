const express = require("express");
const router = express.Router();
const { authenticate } = require("../controllers/userController");
const { addSponsor, editSponsor, deleteSponsor, getAllSponsors } = require("../controllers/sponsorController");

router.post("/add-sponsors", authenticate, addSponsor);
router.put("/edit-sponsors/:id", authenticate, editSponsor);
router.delete("/delete-sponsors/:id", authenticate, deleteSponsor);
router.get("/get-all-sponsors", authenticate, getAllSponsors);

module.exports = router;
