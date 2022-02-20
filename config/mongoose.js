const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("connected DB");
  } catch (err) {
    console.log(err);
  }
};

connect();
