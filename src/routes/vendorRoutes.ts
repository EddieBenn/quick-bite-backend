import express from "express";
import {
  authForVerifiedVendor,
  auth,
  vendorauth,
} from "../middleware/authorizations";
import { upload } from "../middleware/upload";
import {
  vendorcreatesFood,
  vendorLogin,
  vendorGetsProfile,
  vendorChangePassword,
  vendorEditProfile,
  vendorgetsAllHisFood,
  vendorGetsSingleFood,
  verifyVendor,
  registerVendor,
  vendorGetsOrderCount,
  vendorGetHisPopularFoods,
  vendorTotalRevenue,
  vendorAvailability,
  singleOrderDetails,
  DeleteAllFood,
  DeleteSingleFood,
  orderByFood,
  vendorTotalEarnings,
  changeStatus,
  updateFood,
  earningsAndRevenue,
  DeleteSingleOrder
} from "../controllers/vendorControllers";

const router = express.Router();

router.post("/verifyvendor", verifyVendor);
router.post(
  "/registervendor",
  authForVerifiedVendor,
  upload.single("cover_image"),
  registerVendor
);
router.post(
  "/createfood",
  vendorauth,
  upload.single("food_image"),
  vendorcreatesFood
);
router.get("/getallfood", vendorauth, vendorgetsAllHisFood);
router.get("/getsinglefood", vendorauth, vendorGetsSingleFood);
router.post("/login", vendorLogin);
router.post("/passwordchange", vendorauth, vendorChangePassword);
router.put(
  "/editprofile",
  vendorauth,
  upload.single("cover_image"),
  vendorEditProfile
);
router.put("/editfood/:id", vendorauth, updateFood);
router.put("/:foodID/ready", vendorauth, changeStatus);
router.get("/getsingleprofile", vendorauth, vendorGetsProfile);
router.delete("/deletefood/:foodid", vendorauth, DeleteSingleFood);
router.delete("/", vendorauth, DeleteAllFood);
router.get("/vendororders", vendorauth, vendorGetsOrderCount);
router.get("/revenuevendor", vendorauth, vendorTotalRevenue);
router.put("/availablevendor", vendorauth, vendorAvailability);
router.get("/singleorder/:id", singleOrderDetails);
router.get("/popularfoods", vendorauth, vendorGetHisPopularFoods);
router.get("/totalearnings", vendorauth, vendorTotalEarnings);
router.get("/orderbyfood", vendorauth, orderByFood);
router.get("/earningsandrevenue", vendorauth, earningsAndRevenue);
router.delete('/deleteorder/:orderid', vendorauth, DeleteSingleOrder)
export default router;

// vendorauth,
