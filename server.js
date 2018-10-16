const next = require("next");
const app = require("./app");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const db = require("./db");

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  app.get("/", (req, res) => {
    if (req.query.shareId) {
      db.getShareById(req.query.shareId, (err, share) => {
        nextApp.render(req, res, "/", { shareData: share && share.data });
      });
    } else {
      nextApp.render(req, res, "/", {});
    }
  });
  app.get("*", (req, res) => {
    handle(req, res);
  });
  app.listen(PORT, err => {
    if (err) throw err;
  });
});
