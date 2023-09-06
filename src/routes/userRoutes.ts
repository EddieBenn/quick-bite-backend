import {
  userGetsAllFoods,
  userGetsAllFoodByAVendor,
  userGetPopularFoods,
  getAllVendors,
  registerUser,
  userLogIn,
  verifyOtp,
  userGetsNewFoods,
  userGetPopularVendors,
  reSendOtp,
  userChangePassword,
  userGetFulfilledOrders,
  userGetsReadyOrders,
  userGetsPendingOrders,
  userMakeOrder,
  userChangeOrderStatus,
  userEditProfile,
  userGetsAllOrders,
  getSingleVendor,
} from "../controllers/userControllers";
import { Router } from "express";
import { auth } from "../middleware/authorizations";

const router = Router();

router.post("/register", registerUser);
router.post("/login", userLogIn);
router.post("/verify", auth, verifyOtp);
router.post("/makeorder", auth, userMakeOrder);
router.post("/changestatus", auth, userChangeOrderStatus);
router.get("/resend", auth, reSendOtp);
router.get("/allfoods", userGetsAllFoods);
router.get("/allvendorfoods", userGetsAllFoodByAVendor);
router.get("/popularfoods", userGetPopularFoods);
router.get("/getVendors", getAllVendors);
router.get("/getPopularVendors", userGetPopularVendors);
router.get("/getFulfilledOrders", auth, userGetFulfilledOrders);
router.get("/readyOrders", auth, userGetsReadyOrders);
router.get("/getNewFoods", userGetsNewFoods);
router.get("/pendingOrders", auth, userGetsPendingOrders);
router.put("/editprofile", auth, userEditProfile);
router.post("/changePassword", auth, userChangePassword);
router.get("/userGetsAllOrders", auth, userGetsAllOrders);
router.get('/getSingleVendor/:id', getSingleVendor)
export default router;
