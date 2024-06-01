const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const User = require('./../models/user');
const Candidate = require('./../models/candidate');


const checkAdminRole= async(userID)=>{
    try {
        const user=await User.findById(userID);
        if(user.role==="admin"){
            return true;
        };
    } catch (error) {
        console.error("Error checking admin role:", error);
        return false;
    }
    return false;
};

router.post('/',jwtAuthMiddleware,async (req,res)=>{

  try{
    if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({message:"user does not have admin rights"})
    }
    const data=req.body;
    const newCandidate= new Candidate(data);
    const response=await newCandidate.save();
    console.log("data saved");
    res.status(200).json({response:response});
  }catch(err){
    console.log(err);
    res.status(500).json({err:"internal server error"});
    }

});







router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({message:"user does not have admin rights"})
        }

        const candidateID=req.params.candidateID;
        const updatedCandidate=req.body;

        const response= await Candidate.findByIdAndUpdate(candidateID,updatedCandidate,{
            new:true,
            runValidators:true
        });

        if(!response){
            res.status(404).json({error:"candidate not found"});
        }
        res.status(200).json(response);
        console.log("candidate data updated")
       
       

    }
    catch(err){
        console.log(err);
         res.status(500).json({err:"internal server error"});
    }
})



router.delete('/:candidateID',jwtAuthMiddleware ,async(req,res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({message:"user does not have admin rights"})
        }

        const candidateID=req.params.candidateID;

        const response= await Candidate.findByIdAndDelete(candidateID);
        if(!response){
            res.status(404).json({error:"candidate not found"});
        }
        res.status(200).json({message:"candidate deleted"});
        console.log("candidate deleted")
       
       

    }
    catch(err){
        console.log(err);
         res.status(500).json({err:"internal server error"});
    }
})


router.post('/vote/:candidateID',jwtAuthMiddleware,async (req,res)=>{

    const candidateID=req.params.candidateID;
    const userId=req.user.id;

    try{
        const candidate= await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json('Candidate not found');

        }

        const user = await User.findById(userId);
        if(!user){
             return res.status(404).json('user not found');
        }

        if(user.isVoted){
             return res.status(400).json(' user already voted');

        }

        if(user.role==="admin"){
             return res.status(403).json('admin not allowed to vote');

        }

        candidate.votes.push({user:userId});
        candidate.voteCount++;
        await candidate.save();

        user.isVoted=true;
        await user.save();


        res.status(200).json({message:"vote recorded successfully"});



    }catch(error){
        
        console.log(error);
        res.status(500).json({error:"internal server error"});
    }
})


router.get('/vote/count',async(req,res)=>{
    try {
        const candidate=await Candidate.find().sort({voteCount:'desc'});


        const voteRecord=candidate.map((data)=>{
            return {
                party:data.party,
                count:data.voteCount
            }
        })

        return res.status(200).json(voteRecord);
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"internal server error"});
    }
})

router.get('/candidateList',async(req,res)=>{

    try {
        
        const response= await Candidate.find();

        const candidateList= response.map((data)=>{
            return {
                name:data.name,
                party:data.party
            }
        })

        res.status(200).json(candidateList);


    } catch (error) {

        console.log(error);
        res.status(500).json({error:"internal server error"});
        
    }
})

router
module.exports=router;

    



