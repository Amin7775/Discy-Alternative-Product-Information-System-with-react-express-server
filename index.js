const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

// mongodb-start

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@clusterpherob9.3leb5bl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPheroB9`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("DiscyDB");
    // collections
    const userCollection = database.collection("users");
    const queriesCollection = database.collection("queries");
    const recommendationsCollection = database.collection("recommendations");

    // user related apis
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // load single user information
    app.get("/user/queryUser", async (req, res) => {
      let query = {};
      // console.log(req.query);
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const requestedInfo = req.body;
      // checking if user already exist
      const { email } = requestedInfo;
      const existingUser = await userCollection.findOne({ email: email });
      if (existingUser) {
        return res.send({ message: "User already Exits" });
      }
      const result = await userCollection.insertOne(requestedInfo);
      res.send(result);
    });
    // user related api end

    // increment related apis - start
    // recommend user -> when a user recommends update user info
    app.patch("/users", async (req, res) => {
      const requestedInfo = req.body;
      // checking if user exist
      const { email } = requestedInfo;
      // operations
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $inc: { totalRecommendations: 1 },
      };
      // update
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    // query update user -> when a user adds a query,  update user info
    app.patch("/users/query", async (req, res) => {
      const requestedInfo = req.body;
      const { email } = requestedInfo;
      // operations
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $inc: { totalQueries: 1 },
      };
      // update
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    // query recommendations increment -> to count how many users recommended
    app.patch("/queries", async (req, res) => {
      const requestedInfo = req.body;
      // checking if user exist
      const { email } = requestedInfo;
      // operations
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $inc: { recommendationCount: 1 },
      };
      // update
      const result = await queriesCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    // increment related apis - end

    // query related api - start
    app.get("/queries", async (req, res) => {
      const result = await queriesCollection.find().toArray();
      res.send(result);
    });

    app.post("/queries", async (req, res) => {
      const newQuery = req.body;
      const result = await queriesCollection.insertOne(newQuery);
      res.send(result);
    });

    // load limited queries for home
    app.get("/limitedQueries", async (req, res) => {
      const options = {
        sort: {
          _id: -1,
        },
        limit: 3,
      };
      const result = await queriesCollection.find({}, options).toArray();
      // console.log(result)
      res.send(result);
    });
    // load single query information
    app.get("/queries/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await queriesCollection.findOne(query);
      res.send(result);
    });
    // query related api - end

    // Recommendation related api - start
    app.get("/recommendations", async (req, res) => {
      const result = await recommendationsCollection.find().toArray();
      res.send(result);
    });

    app.post("/recommendations", async (req, res) => {
      const info = req.body;
      const result = await recommendationsCollection.insertOne(info);
      res.send(result);
    });
    // Recommendation related api - end

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongodb-end

app.get("/", (req, res) => {
  res.send("Discy Server is running");
});

app.listen(port, () => {
  console.log("Running on port : ", port);
});
