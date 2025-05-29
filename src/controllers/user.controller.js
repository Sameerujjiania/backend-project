import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"
import {ApiError} from "../utils/apiError.js"
import { error } from "console";

// yehbohut baar kaam aayega isliye iska ek alag function bana liya.
//  Internal function koi web request handle nahi kar rahe hai isliya asynchandler nahi use kiya
const generateAccessAndRefreshTokens = async (userId)=>{
    try{
        const user = await User.findById(userId)
        // console.log()
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        // You're updating a single field (like refreshToken) and don't want Mongoose
        //  to re-validate the whole document.thats why we are using validationBeforeSave: false
        await user.save({validationBeforeSave:false})
        return {accessToken,refreshToken}
    }
    catch(err){
        throw new ApiError(501,"problem while generating tokens")
    }
}




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
// jab koi existing user register karne ki koshish karega tab uski files to save ho jayegi public/temp me
// lekin existing user ki error aa jayegi and coudinary upload wala code nahi chalega jiski vajha se files
// delete nahi hogi or files public/temp me hi jama hoti rahegi,
// par esa nahi ho raha kyonki
// Jab user already exist kar raha h to multer ki processing(files ko parse karna) khatam hone se phle hi 
// yeh error throw kar de raha h user already exist wali isliye files save nahi horhi  
// agar abhi to kaam chal raha h lekin user exist check karne wali condintion me hi return karne se phle 
// manully unlink kardo fs.unLinkSync();
/*
if (existedUser) {
    // Delete uploaded files
    if (req.files?.avatar) {
        fs.unlinkSync(req.files.avatar[0].path);
    }
    if (req.files?.coverImage) {
        fs.unlinkSync(req.files.coverImage[0].path);
    }

    throw new ApiError(409, "User already exists");
}

*/


    if (existedUser) {
        throw new ApiError(409, "User already exist with the following username or email")
    }

    // curiosity
    console.log(req.files)

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

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

const loginUser = asyncHandler(async(req,res)=>{
    // sabse phle frontend se userdetails lenge
    // unko validate karenge 
    // user ko find karenge database me exist karta h ya nhi
    // exist karta h to password compare karenge
    // access and refresh token 
    // cookies send karenge
    const {email,password,username} = req.body

    if(!(email || username)){
        throw new ApiError(400,"username or email is required")
    }

    let user = await User.findOne({$or: [{username},{email}]})

    if(!user){
        throw new ApiError(404,"Username not found")
    }
    
    // custom methods can be called on document instances retrieved from the database.
    // isme jo method hum khud define karte h use document ke instance se call karte h
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"wrong password")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    // user = await User.findById(user._id).select("-password")
    const userObject = user.toObject()
    delete userObject.password

    const options = {
        httpOnly: true,     ///Only the server can access this cookie.Prevents JavaScript from accessing the cookie via document.cookie.
        secure: true       ///Ensures the cookie is only sent over HTTPS.
    }

    res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .send(
        new ApiResponse(200,{
            user: userObject,
            refreshToken,
            accessToken
        },
        "user logged in successfully"
    )
    )


})

const logoutUser = asyncHandler(async(req,res)=>{

    // await User.updateOne({_id:  userId},{$set: {refreshToken: ""}});

    // MongoDB ignores undefined values in updates. isliye  refreshToken: undefined nahi set karenge
    // set empty string
    // await User.findByIdAndUpdate(req.user._id,{$set: {refreshToken: ""}}) 

    //remove the field
    await User.findByIdAndUpdate(req.user._id,{$unset: {refreshToken: 1}})  // can pass extra object {new: true} for updatede object return


    const options = {
        httpOnly: true,     ///Only the server can access this cookie.Prevents JavaScript from accessing the cookie via document.cookie.
        secure: true       ///Ensures the cookie is only sent over HTTPS.
    }
    
    res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully"))

})
export { registerUser , loginUser, logoutUser}