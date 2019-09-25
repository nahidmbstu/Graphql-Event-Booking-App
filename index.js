"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphqlHttp = require("express-graphql");
var cors = require("cors");

require("dotenv").config();

const eventSchema = require("./schemas/index");
const Resolvers = require("./resolvers/index");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb+srv://nahid:mbstu2019@cluster0-xdrfl.mongodb.net/event?retryWrites=true&w=majority";

app.get("/hello", (req, res) => {
  return res.send("hello world");
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: eventSchema, // define the schema
    rootValue: Resolvers, // resolve the schema
    graphiql: true
  })
);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send(JSON.stringify(err.stack));
});

try {
  mongoose.connect(uri, { useNewUrlParser: true }, err => {
    if (err) {
      console.log(err);

      throw new Error("Database Connection Error");
    }

    app.listen(process.env.PORT, () => console.log(`app started on port ${process.env.PORT}`));
  });
} catch (error) {
  console.log(`error`, error);
}
