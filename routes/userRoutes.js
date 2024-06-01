const express=require('express');
const router=express.Router();
const Person=require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const User = require('./../models/user');


router.post('/signup',async (req,res)=>{

  try{

    const data=req.body;
    const newUser= new User(data);
    const response=await newUser.save();
    console.log("data saved");

    const payload={
      id:response.id
    }
    const token=generateToken(payload);
    console.log(`token is: ${token}`);
    res.status(200).json({response:response,token:token});
  }catch(err){
    console.log(err);
    res.status(500).json({err:"internal server error"});
    }

});

router.post('/login', async(req,res)=>{
  try {
    const {aadharCardNumber,password}=req.body;

  const user= await User.findOne({aadharCardNumber:aadharCardNumber});

  if(!user || !(await user.comparePassword(password))){
    return res.status(401).json({error:"invalid username or password"});

  }

  const payload={
    id:user.id,
  }

  const token=generateToken(payload);

  res.status(200).json({token:token});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"internal server error"});
    
  }

})



router.get('/profile',jwtAuthMiddleware, async (req,res)=>{
  try {
     const userData=req.user;
    const userid=userData.id;

    const user=await User.findById(userid);
    res.status(200).json(user);
    } catch (error) {
      console.log(error)
      res.status(500).json({error:"internal server error"});
    
  }
   
})



router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId=req.user;
        const {currentPassword,newPassword}=req.body;

        const user= await User.findById(userId);

        if(!(await user.comparePassword(currentPassword))){
         return res.status(401).json({error:"invalid username or password"});
        }
        
        user.password=newPassword;
        await user.save();

        console.password('password updated')
        res.status(200).json({message:"password updated"});

    }
    catch(err){
        console.log(err);
         res.status(500).json({err:"internal server error"});
    }
})


module.exports=router;

    



