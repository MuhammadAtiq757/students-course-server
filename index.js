const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytvhn6h.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const userCollection = client.db('sports').collection('users')
    const popularClassCollection = client.db('sports').collection('popular')

    const popularInsCollection = client.db('sports').collection('popularins')

    const addingCollection = client.db('sports').collection('addclass')

    const selectedCollection = client.db('sports').collection('selected')


    app.delete('/deletedata/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: (id )}
      const result = await selectedCollection.deleteOne(query);
      res.send(result);
    })


    app.get('/popular', async (req, res) => {
      const result = await popularClassCollection.find().toArray();
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      console.log('usereee')
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/myclass', async (req, res) => {
      console.log(req.query.email);
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await addingCollection.find(query).toArray();
      console.log(result)
      res.send(result);
    })



    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists' })
      }
      const result = await userCollection.insertOne(user);
      res.send(result)

    })



    app.post('/addclass', async (req, res) => {
      const adding = req.body;
      const result = await addingCollection.insertOne(adding)
      res.send(result)
      // console.log(adding);
    })


    app.get('/selectedClassData', async (req, res) => {
     
      const result = await selectedCollection.find().toArray();
      res.send(result);
    })


    app.post('/selectedClassData', async (req, res) => {
      const user = req.body;
      const result = await selectedCollection.insertOne(user);
      res.send(result);
    })


    app.get('/popular/instructor/:email', async (req, res) => {
      const email = req.params.email;
      console.log();
      const query = { instructorEmail: email }
      const user = await popularClassCollection.find(query).toArray();
      const result = { email: user?.role === 'approved' }
      res.send(result)
    })


    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result)
    })



    app.get('/users/instructor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' }
      res.send(result)
    })


    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })







    app.patch('/users/approve/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'approved'
        },
      };

      const result = await popularClassCollection.updateOne(filter, updateDoc);
      res.send(result);
    })





    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })



    app.get('/popular', async (req, res) => {
      try {
        const popularInstructors = await popularInsCollection.aggregate([
          {
            $group: {
              _id: "instructorEmail",
              totalStudents: { $sum: "$students" },
              instructor: { $first: "$ROOT" },
            },
          },
          { $sort: { totalStudents: -1 } },
          { $limit: 6 },
          {
            $project: {
              _id: 0,
              name: "$instructor.instructorName",
              email: "$instructor.instructorEmail",
              totalStudents: 1,
              img: "$instructor.img"
            }
          }

        ])
          .toArray();
        res.json(popularInstructors);
      }
      catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'internal server error' })
      }

   


     app.get("/classStatus/:status", async (req, res) => {
      const status = req.params.status;
      // console.log(email);
      const query = { status: status };
      const result = await popularClassCollection.find(query).toArray();
      res.send(result);
    });



   

    
      // const result = await popularInsCollection.find().toArray();
      //  res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Sports is running')
})


app.listen(port, () => {
  console.log(`Sports is running on port ${port}`);
})
