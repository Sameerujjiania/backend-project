import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req,_,next)=>{
    const accessToken = req.cookies?.accessToken || req.header('Autorization')?.replace("bearer ","")

    if(!accessToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid Access Token")
    }
    
    req.user = user
    next()
})