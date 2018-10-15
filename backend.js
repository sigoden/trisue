const express = require("express");
const app = express();
const request = require("request");
const shortid = require("shortid");

const db = require("./db");

app.post("/share", (req, res) => {
  const id = shortid.generate();
  const data = req.data;
  db.createShare({ id, data }, err => {
    if (err) {
      res.status(500).json({ err: err.message });
      return;
    }
    res.json({ id });
  });
});

app.post("/proxy", (req, res) => {
  let data;
  try {
    data = JSON.parse(req.body.data);
  } catch (err) {
    res.status(400).json({ err: "Bad request body" });
    return;
  }
  request(data, function(err, resp, body) {
    if (err) {
      res.status(500).json({ err: err.message });
      return;
    }
    const headers = resp.getHeaders();
    return { headers, body };
  });
});

module.exports = app;
