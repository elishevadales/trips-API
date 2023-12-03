const express = require("express");
const { UserModel } = require("../models/userModel")
const { TripModel, tripValid } = require("../models/tripModel")
const router = express.Router();
const { auth } = require("../middleware/auth")

//get all trips
router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await TripModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//search by name and info
router.get("/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let queryS = req.query.s;

  try {

    let searchReg = new RegExp(queryS, "i")
    let data = await TripModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })

    if (!data[0]) {
      res.json({ msg: "No result was found. This is the end of the list." })

    }
    else {
      res.json(data);
    }
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})


//search trips by category
router.get("/category/:catname", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let category = req.params.catname;

  try {

    let data = await TripModel
      .find({ category: category })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })

    if (!data[0]) {
      res.json({ msg: "category not found, or this is the end of the list." })

    }
    else {
      res.json(data);
    }

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})


//get single trip by its id
router.get("/single/:tripId", async (req, res) => {
  try{
      let tripId = req.params.tripId;
  let trip = await TripModel.findOne({ _id: tripId });
  res.json(trip);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }

})

//get trips by their price
router.get("/prices", async (req, res) => {
  let minPrice = req.query.min || 0;
  let maxPrice = req.query.max || 10000;
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;

  try {

    let data = await TripModel
      .find({ $and: [{ price: { $gte: minPrice } }, { price: { $lte: maxPrice } }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 });

    if (!data[0]) {
      res.json({ msg: "There is no item in this price, or this is the end of the list." })

    }
    else {
      res.json(data);
    }

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})


//get all trips that a spesific user created
router.get("/tripsByUserId/:userId", async (req, res) => {
  let userId = req.params.userId;

  try {

    let user = await UserModel
      .findOne({ _id: userId })
      .populate("trips")

    res.json(user.trips);

    if (!user) {
      return res.status(404).json({ user, msg: "User not found" });
    }

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }

})



//add new trip
router.post("/", auth, async (req, res) => {

  let valdiateBody = tripValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let trip = new TripModel(req.body);
    trip.user_id = req.tokenData._id;
    let userId = req.tokenData._id;
    let user = await UserModel.findOne({ _id: userId });
    user.trips.push(trip._id)
    await user.save()
    await trip.save();
    res.status(201).json(trip)
  }
  catch (err) {

    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

})


//edit trip
router.put("/:editId", auth, async (req, res) => {
  let validBody = tripValid(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let editId = req.params.editId;
    let data;
    if (req.tokenData.role == "admin") {
      data = await TripModel.updateOne({ _id: editId }, req.body)
    }
    else {
      let trip = await TripModel.findOne({ _id: editId, user_id: req.tokenData._id });
      if (!trip) {
        res.json({ msg: "item not found, or you can edit only your own trips" });
      }
      else {
        data = await TripModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)

      }
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})


//delete trip
router.delete("/:delId", auth, async (req, res) => {

  try {
    let delId = req.params.delId;
    let data;

    if (req.tokenData.role == "admin") {
      data = await TripModel.deleteOne({ _id: delId })
    }
    else {

      let trip = await TripModel.findOne({ _id: delId, user_id: req.tokenData._id });

      if (!trip) {
        res.json({ msg: "item not found, or you can delete only your own trips" });
      }
      else {
        data = await TripModel.deleteOne({ _id: delId })
      }
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }

})

module.exports = router;