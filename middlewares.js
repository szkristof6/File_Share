const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const morgan = require("morgan");

require("dotenv").config();

const passport = require("./auth");

const app = express();

app.use(express.json());

// Static Middleware
app.set("view engine", "ejs"); // Set the view engine to EJS

app.use(express.static("public"));

app.use(morgan("tiny"));

app.use(
  cors({
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(fileUpload());

// Disable X-Powered-By header
app.disable("x-powered-by");

// Use express-session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a secure key
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user in Passport.js
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(express.json());

module.exports = app;
