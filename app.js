const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

const indexRouter = require("./routes/indexRouter");

const app = express();
const appHTTP = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
dotenv.config();

appHTTP.get("*", function(req, res, next) {
  res.redirect("https://" + req.headers.host + "/" + req.path);
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, "public")));

// app.use("/config", configRouter);
app.use("/", indexRouter);


// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("404", { title: "404 | Page Not Found", error: err});
});

/**
 * Create HTTPS server.
 */

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "assets/ssl", "privkey1.pem")),
  cert: fs.readFileSync(path.join(__dirname, "assets/ssl", "cert1.pem")),
  ca: fs.readFileSync(path.join(__dirname, "assets/ssl", "fullchain1.pem"))
};

const server = https.createServer(httpsOptions, app);
const serverHTTP = https.createServer(appHTTP);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}!`)
);

serverHTTP.listen(80, () =>
  console.log(`HTTP Redirect Server listening on port 80!`)
);

module.exports = app;
