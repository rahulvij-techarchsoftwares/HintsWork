const Sponsor = require("../models/SponsorModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");

const normalize = (s = "") => String(s).replace(/\s+/g, "").toLowerCase();

async function isAdminOrSuperAdmin(userId) {
  const user = await User.findById(userId).select("role");
  if (!user || !user.role) return false;

  const role = await Role.findById(user.role).select("roleName");
  if (!role) return false;

  const roleName = normalize(role.roleName);
  return roleName === "admin" || roleName === "superadmin";
}

exports.addSponsor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can add sponsors." });
    }
    const { name, tier, website, associatedBrands = [], status = true } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Sponsor name is required." });
    }
    if (!tier?.trim()) {
      return res.status(400).json({ message: "Tier is required." });
    }
    const existing = await Sponsor.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "Sponsor already exists." });
    }
    const sponsor = await Sponsor.create({
      name: name.trim(),
      tier: tier.trim(),
      website: website?.trim(),
      associatedBrands,
      status: Boolean(status),
    });
    return res.status(201).json({ message: "Sponsor added successfully.", sponsor });
  } catch (error) {
    console.error("addSponsor error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.editSponsor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can edit sponsors." });
    }
    const { id } = req.params;
    const { name, tier, website, associatedBrands, status } = req.body;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found." });
    }
    if (name) sponsor.name = name.trim();
    if (tier) sponsor.tier = tier.trim();
    if (website) sponsor.website = website.trim();
    if (associatedBrands) sponsor.associatedBrands = associatedBrands;
    if (status !== undefined) sponsor.status = Boolean(status);
    await sponsor.save();
    return res.status(200).json({ message: "Sponsor updated successfully.", sponsor });
  } catch (error) {
    console.error("editSponsor error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can delete sponsors." });
    }
    const { id } = req.params;
    const sponsor = await Sponsor.findByIdAndDelete(id);
    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found." });
    }
    return res.status(200).json({ message: "Sponsor deleted successfully." });
  } catch (error) {
    console.error("deleteSponsor error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getAllSponsors = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!(await isAdminOrSuperAdmin(userId))) {
      return res.status(403).json({ message: "Access denied. Only Admin/SuperAdmin can view sponsors." });
    }
    const sponsors = await Sponsor.find()
      .populate("associatedBrands")
      .sort({ createdAt: -1 });
    return res.status(200).json({ sponsors });
  } catch (error) {
    console.error("getAllSponsors error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
