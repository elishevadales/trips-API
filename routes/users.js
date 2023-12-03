const express = require("express");
const bcrypt = require("bcrypt");
const { auth } = require("../middleware/auth");
const { UserModel, userValid, loginValid, createToken } = require("../models/userModel")
const router = express.Router();


//get all users
router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 5;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await UserModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.json(data)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err1", err })
  }
})

//get one user
router.get("/single/:userId", async (req, res) => {

  let userId = req.params.userId;

  try {
    let user = await UserModel.findOne({ _id: userId });
    if (user.trips.length > 0) {

      await user.populate("trips")
    }

    res.json(user)

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }

})



//add new user
router.post("/", async (req, res) => {

  let valdiateBody = userValid(req.body);

  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let user = new UserModel(req.body);

    user.password = await bcrypt.hash(user.password, 10)
    await user.save();
    user.password = "*********";
    res.status(201).json(user)
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({ msg: "Email already in system try login", code: 11000 })
    }
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

})


//login
router.post("/login", async (req, res) => {
  let valdiateBody = loginValid(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "User and password not match code 1 " })
    }
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "User and password not match code 2" })
    }
    let token = createToken(user._id, user.role);
    res.json({ token });
  }
  catch (err) {

    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


//delete user
router.delete("/:delId", auth, async (req, res) => {
  if (req.tokenData.role == "admin") {
    let delId = req.params.delId;
    let data = await UserModel.deleteOne({ _id: delId });
    res.json(data);
  }
  else {
    res.json({ msg: "only admin can delete a user" });
  }


})

module.exports = router;