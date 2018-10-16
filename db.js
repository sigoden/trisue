const sqlite = require("sqlite3");

const db = new sqlite.Database(process.env.DB_FILE || "trisue.db", err => {
  if (err) throw err;
  db.run("CREATE TABLE IF NOT EXISTS share (id CHAR(6), data TEXT)");
});

exports.createShare = function({ id, data }, cb) {
  db.run("INSERT INTO share VALUES(?, ?)", id, data, err => {
    if (err) {
      return cb(err);
    }
    cb();
  });
};

exports.getShareById = function(id, cb) {
  db.get("SELECT * FROM share WHERE id = ?", id, (err, row) => {
    if (err) {
      return cb(err);
    }
    cb(null, row);
  });
};
