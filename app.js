const express = require("express");
const request = require("request");
const shortid = require("shortid");
const getRawBody = require("raw-body");
const contentType = require("content-type");

const app = express();

const db = require("./db");

const rawBodyMid = function(req, res, next) {
  getRawBody(
    req,
    {
      length: req.headers["content-length"],
      limit: "1mb",
      encoding: contentType.parse(req).parameters.charset
    },
    function(err, string) {
      if (err) return next(err);
      req.text = string;
      next();
    }
  );
};

app.get("/api/share/:id", (req, res) => {
  db.getShareById(req.params.id, (err, row) => {
    if (err) {
      res.status(500).json({ err: err.message });
      return;
    }
    res.json(row);
  });
});
app.post("/api/share", rawBodyMid, (req, res) => {
  const id = shortid.generate();
  const data = req.text;
  db.createShare({ id, data }, err => {
    if (err) {
      res.status(500).json({ err: err.message });
      return;
    }
    res.json({ id });
  });
});

app.post("/api/proxy", rawBodyMid, (req, res) => {
  let data;
  try {
    data = JSON.parse(req.text);
  } catch (err) {
    res.status(400).json({ err: "Wrong request body" });
    return;
  }
  if (!data.body) {
    delete data.body;
  }
  const acceptEncoding = data.headers["accept-encoding"] || data.headers["Accept-Encoding"];
  if (/gzip/.test(acceptEncoding)) {
    data.gzip = true;
  }
  request({ ...data, timeout: 15000 }, function(err, resp, body) {
    if (err) {
      res.status(500).json({ err: err.message });
      return;
    }
    const status = resp.statusCode;
    const headers = resp.headers;
    res.json({ status, headers, body });
  });
});

module.exports = app;
