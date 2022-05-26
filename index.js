const express = require('express');
var jwt = require('jsonwebtoken');

//stripe key 
const stripe = require("stripe")(process.env.STRIPE_KEY);

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');



app.use(cors());
app.use(express.json());
require("dotenv").config();
const jwtToken = (req, res, next) => {
  const authHeader = req.body.headers.Authorization;

  if (!authHeader) {
    res.send('massage:Undathorized')
  } else {
    const token = authHeader.split(' ')[1]


    jwt.verify(token, process.env.ACESS_TOKEN, function (err, decoded) {
      if (err) {
        res.send({ massage: 'forbidden access' })
      } else {
        decoded = req.decoded

        next()
      }
    });
  }
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bcfms.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
  try {
    await client.connect();
    const productCollection = client.db("manufacture").collection("products");
    const orderCollection = client.db("manufacture").collection("orders");
    const reviewCollection = client.db("manufacture").collection("reviews");
    const userCollection = client.db("manufacture").collection("users");
    const paymentCollection = client.db("manufacture").collection("payments");


    app.get("/", () => async (req, res) => {

res.send({result:success});

    });
    app.post('/products', async (req, res) => {

      const product = req.body;
      console.log(product);

      const result = await productCollection.insertOne(product);
      res.send(result);
    })
    app.get('/products', async (req, res) => {

      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;


      const query = { _id: ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result)

    })
    app.post("/payment-init", async (req, res) => {
      const price = req.body
      const amount = price.total * 100
      console.log(amount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_methods_type: ['card']

      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      });

    })

    // -------------------
    app.post('/review', async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      res.send(result);

    })
    app.get('/review', async (req, res) => {

      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    //    -------------------------------
    app.get('/order/:id', async (req, res) => {
      const email = req.params.id

      const query = { email: email }
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)


    })
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query);
      res.send(result)
    })
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;


      const query = { _id: ObjectId(id) }
      const result = await orderCollection.findOne(query);
      res.send(result)
    })
    app.patch('/order/:id', async (req, res) => {
      const id = req.params.id;
      const payment = req.body
      const filter = { _id: ObjectId(id) }


      const updateDoc = {
        $set: {
          paid: true,
          TransitionId: payment.transactionId
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      const result1 = await paymentCollection.insertOne(payment);
      res.send({ result: result, result1: result1 });

    })

    app.post('/order', async (req, res) => {
      const ordered = (req.body.orderInfo);

      const result = await orderCollection.insertOne(ordered);
      res.send(result);

    })


    // -----------------------------for payment--------------

    app.put('/user/:id', async (req, res) => {
      const userEmail = req.params.id;
      const filter = { email: userEmail };
      const options = { upsert: true };
      const user = {
        $set: {
          email: userEmail
        },
      };
      const result = await userCollection.updateOne(filter, user, options);

      const token = jwt.sign(userEmail, process.env.ACESS_TOKEN);
      res.send({ token: token, result: result })

    })
    app.get('/user', async (req, res) => {

      const query = {};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })

    app.patch('/user/admin/:id', async (req, res) => {
      const email = req.params.id;
      const query = { email: email }
      const result = await orderCollection.findOne(query);
      console.log(result);

    })

    app.put('/user/admin/:id', async (req, res) => {
      const email = req.params.id;
      const admin = req.body.admin

      const query = { email: email }
      const options = { upsert: true };
      const user = {
        $set: {
          rule: admin.rule
        },
      };
      const result = await userCollection.updateOne(query, user, options);
      res.send(result)
    })


    app.get('/user/:id', async (req, res) => {
      const email = req.params.id;

      const query = { email: email }
      const result = await userCollection.findOne(query);
      res.send(result)
    })

  }
  catch (e) {

  }


}

run().catch(console.dir);






app.listen(port, () => {

});