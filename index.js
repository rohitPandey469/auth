require('dotenv').config();
const express = require("express");
const app = express();
const User = require("./models/user");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db_name = process.env.DB_NAME || "mongodb://127.0.0.1:27017/autho";
mongoose.set('strictQuery',false);
mongoose
  .connect(db_name, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO CONNECTION ERROR!!!!");
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "iloveshivi",
  })
);

const verifyLogin = (req, res, next) => {
  if (req.session.user_id) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      req.session.user_id = user.id;
      res.redirect("/home");
    } else {
      res.send("Invalid Credentials");
    }
  } catch (e) {
    res.send("Username or Password can not be empty");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try{
    const { username, password } = req.body;
    const oldUser=await User.findOne({username});
    if(!oldUser){
    const hashed_pw = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      password: hashed_pw,
    });
    await user.save();
    req.session.user_id = user.id;
    res.redirect("/home");
  }else{
    res.send("Username is already taken. Try with different one!")
  }
  }catch(e){
    res.send("Username or Password can not be empty");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/home", verifyLogin, (req, res) => {
  res.render("home");
});

app.get("/", (req, res) => {
  res.send("TO LOCALHOST");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("SERVING YOUR APP ON PORT ", port);
});
