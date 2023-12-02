const express = require("express");
const {TripModel,tripValid} = require("../models/tripModel")
const router = express.Router();
const{auth} = require("../middleware/auth")


router.get("/",async(req,res) => {
  let perPage = Math.min(req.query.perPage,20) || 99;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await TripModel
    .find({})
    .limit(perPage)
    .skip((page - 1)*perPage)
    .sort({[sort]:reverse})
    res.json(data)
  }
  catch (err){
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.get("/search",async(req,res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1; 
    let queryS = req.query.s;
  
    try{
      
      let searchReg = new RegExp(queryS,"i")
      let data = await TripModel.find({$or:[{name:searchReg},{info:searchReg}]})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({_id:-1})
      
      if(!data[0]){
        res.json({msg:"No result was found. This is the end of the list."})
        
      }
      else{
        res.json(data);
      }
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })
  
  router.get("/category/:catname",async(req,res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1; 
    let category = req.params.catname;
  
    try{
  
      let data = await TripModel.find({category:category})
  
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({_id:-1})
  
      if(!data[0]){
        res.json({msg:"category not found, or this is the end of the list."})
        
      }
      else{
        res.json(data);
      }
  
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })
  
  
  router.get("/prices",async(req,res) => {
    let minPrice = req.query.min || 0;
    let maxPrice = req.query.max || 100000000;
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1; 
  
    try{
  
      let data = await TripModel.find({$and:[{price:{ $gte: minPrice }},{price:{ $lte: maxPrice }}]})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({_id:-1});
  
      if(!data[0]){
        res.json({msg:"There is no item in this price, or this is the end of the list."})
        
      }
      else{
        res.json(data);
      }
  
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"err",err})
    }
  })
  



router.post("/",auth, async(req,res) => {

  let valdiateBody = tripValid(req.body);
  if(valdiateBody.error){
    return res.status(400).json(valdiateBody.error.details)
  }
  try{
    let trip = new TripModel(req.body);
    trip.user_id = req.tokenData._id;
    await trip.save();
    res.status(201).json(trip)
  }
  catch(err){

    console.log(err)
    res.status(500).json({msg:"err",err})
  }
  
  })

  router.put("/:editId",auth, async(req,res) => {
    let validBody = tripValid(req.body);
    if(validBody.error){
      return res.status(400).json(validBody.error.details);
    }
    try{
      let editId = req.params.editId;
      let data;
      if(req.tokenData.role == "admin"){
        data = await TripModel.updateOne({_id:editId},req.body)
      }
      else{
         data = await TripModel.updateOne({_id:editId,user_id:req.tokenData._id},req.body)
         
      }
      res.json(data);
      
    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
  })
  


router.delete("/:delId",auth, async(req,res) => {

    try{
        let delId = req.params.delId;
        let data;
        if(req.tokenData.role == "admin"){
          data = await TripModel.deleteOne({_id:delId})
        }
        else{
          data = await TripModel.deleteOne({_id:delId,user_id:req.tokenData._id})
    
        }
        res.json(data);
      }
      catch(err){
        console.log(err);
        res.status(500).json({msg:"there error try again later",err})
      }

  })

module.exports = router;