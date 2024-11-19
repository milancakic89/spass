const express = require('express');
const session = require("express-session");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const csurf = require('csurf');



const { MONGO_URL } = require("./utils/db.js");

//ROUTES
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require("./routes/dashboard.js");
const { isAuthenticated } = require("./middleware/isAuthenticated.js");
const { preventIfAuthenticated } = require("./middleware/authPreventSigningPage.js");
const bodyParser = require('body-parser');

const app = express();
const csrfProtect = csurf({ cookie: true });

app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());
app.use("",express.static(__dirname));
app.use(session({
    cookieName: "mustafa",
    secret: process.env.SESSION_SECRET || "developmentsecret",
    resave: false,
    saveUninitialized: true,
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);

app.post('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/auth/login');
})

app.use("/auth", csrfProtect, preventIfAuthenticated, authRoutes);
app.use("/dashboard", csrfProtect, isAuthenticated, dashboardRoutes);

app.use('*', (req, res) => {
    res.redirect('/auth/login');
});

const PORT = process.env.PORT || 8080;

async function run(){
    mongoose.set("strictQuery", false);
    await  mongoose.connect(MONGO_URL);
    app.listen(
      PORT,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log("connected")
    );
    
}

run().catch(err => console.log(err));