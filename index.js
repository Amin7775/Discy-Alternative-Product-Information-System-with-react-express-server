const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json());


// mongodb-start

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@clusterpherob9.3leb5bl.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPheroB9`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("DiscyDB")
    // collections
    const userCollection = database.collection("users")
    const queriesCollection = database.collection("queries")
    
    // user related apis
    app.get('/users' , async (req,res)=>{
        const result = await userCollection.find().toArray();
        res.send(result)
    })

    app.post('/users', async(req,res)=>{
        const requestedInfo = req.body;
        // checking if user already exist
        const {email} = requestedInfo
        const existingUser = await userCollection.findOne({email : email})
        if(existingUser){
            return res.send({message : "User already Exits"})
        }
        const result = await userCollection.insertOne(requestedInfo)
        res.send(result)
    })

    // query related api
    app.get('/queries', async(req,res)=>{
        const result = await queriesCollection.find().toArray()
        res.send(result)
    })  

    app.post('/queries' , async(req,res)=>{
        const newQuery = req.body;
        const result = await queriesCollection.insertOne(newQuery)
        res.send(result)
    })

    // load limited queries for home
    app.get('/limitedQueries' , async(req,res)=>{
      const options = {
        sort: {
          _id : -1
        },
        limit : 3
      }
      const result = await queriesCollection.find({},options).toArray()
      console.log(result)
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongodb-end


app.get('/', (req,res)=>{
    res.send('Discy Server is running')
})

app.listen(port,()=>{
    console.log("Running on port : ", port)
})