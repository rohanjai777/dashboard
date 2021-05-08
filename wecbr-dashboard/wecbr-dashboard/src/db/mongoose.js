const mongoose = require("mongoose");
const { mongoUri } = require("../config/keys");

mongoose
  .connect(mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log("Database Error ", e);
  });
