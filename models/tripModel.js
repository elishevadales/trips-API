const mongoose = require("mongoose");
const Joi = require("joi")

let tripSchema = new mongoose.Schema({
  name:String,
  info:String,
  category:String,
  img_url:String,
  price:Number,
  date_created:{
      type : Date , default : Date.now()
  },
  user_id:String
})


exports.TripModel = mongoose.model("trips",tripSchema);


exports.tripValid = (_bodyValid) =>{
  let joiSchema = Joi.object({
      name: Joi.string().min(2).max(99).required(),
      info:Joi.string().min(2).max(99).required(),
      category:Joi.string().min(2).max(99).required(),
      img_url:Joi.string().min(2).max(10000).allow(null,""),
      price:Joi.number().min(1).max(100000).required()
  })
  return joiSchema.validate(_bodyValid);
}