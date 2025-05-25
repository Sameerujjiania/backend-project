import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get data from frontned
    // validate data
    // check if user already exist 
    // chek for images and avtar
    // upload them to cloudinary
    // create the user
    // remove pass and refresh token from response
    // send response to client 

    const { fullName, username, email, password } = req.body

    if ([fullName, username, email, password].some((item) => item.trim() === "")) {
        throw new ApiError(400, "all fields are mandatary")
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
        throw new ApiError(409, "User already exist with the following username or email")
    }

    // curiosity
    console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        email,
        fullName,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // checking if the user is really created and extracting
    // the password and refresh token before senting it in response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "somthing went wrong while registering the user")
    }

    res.status(200).json(new ApiResponse(200,createdUser,"User registered successfully"))

})

export { registerUser }