import { Router } from "express";

import {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDetails
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)
// router.post("/register",registerUser)

router.route("/login").post(loginUser)


// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refreshAccessToken").post(refreshAccessToken)

router.route("/changchangeCurrentPassword").post(verifyJWT, changeCurrentPassword)

router.route("/getCurrentUser").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateUserDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("avatar"), updateUserCoverImage)




export default router