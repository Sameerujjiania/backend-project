const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
                      .catch((err)=>next(err))
    }
}


// both are same 


// const asyncHandler = (fn) => async (req,res,next)=>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(err){
//         res.status(err.code).json({
//             message: err.message,
//             success: false
//         })
//     }
// } 

export {asyncHandler};