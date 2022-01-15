const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("app:startup");

const connectionString = `${config.get("db.protocall")}://${config.get("db.username")}:${config.get("db.password")}@${config.get("db.host")}/${config.get("db.name")}?${config.get("db.options")}`;
module.exports = function () {
    mongoose
      .connect(connectionString)
      .then(() => debug(`Connected to MongoDb at ${config.get("db.host")}`))
      .catch(error=>{
          console.log(error);
      });
    //mongoose.set("debug", true);
  };