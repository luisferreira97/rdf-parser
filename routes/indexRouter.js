const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", function(req, res, next) {
  res.render("index", { title: "Rules" });
});

router.get("/rules", function(req, res, next) {
  res.render("rules", { title: "Rules" });
});

router.post("/semantic", function(req, res, next) {
  console.log(JSON.stringify(req.body))
  const headers = {
    'Content-Type': 'application/json',
    'charset': 'utf-8'
  }
  axios.post("http://fox.cs.uni-paderborn.de:4444/fox", JSON.stringify(req.body), {
    headers: headers
  })
    .then(response => {
      console.log(response);
      res.json(response.json);
    })
    .catch(error => {
      console.error(error);
    });
});

module.exports = router;

