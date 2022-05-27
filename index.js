require("dotenv").config();
const express = require('express');
var jwt = require('jsonwebtoken');



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const stripe = require("stripe")(process.env.STRIPE_KEY);



app.use(cors({origin:'https://assignment-12-8b5b3.web.app'}));
app.use(express.json());
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
//------------------------



var uri = "mongodb://admin:admin@cluster0-shard-00-00.bcfms.mongodb.net:27017,cluster0-shard-00-01.bcfms.mongodb.net:27017,cluster0-shard-00-02.bcfms.mongodb.net:27017/?ssl=true&replicaSet=atlas-q7vegm-shard-0&authSource=admin&retryWrites=true&w=majority";
MongoClient.connect(uri, function(err, client) {
  const collection = client.db("test").collection("devices");
  const productCollection = client.db("manufacture").collection("products");
    const orderCollection = client.db("manufacture").collection("orders");
    const reviewCollection = client.db("manufacture").collection("reviews");
    const userCollection = client.db("manufacture").collection("users");
    const paymentCollection = client.db("manufacture").collection("payments");

    //get all products
    app.get('/products', async (req, res) => {

      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
     // post product collection
    app.post('/products', async (req, res) => {

      const product = req.body;
      console.log(product);

      const result = await productCollection.insertOne(product);
      res.send(result);
    })

    // post product collection
    app.post('/products', async (req, res) => {

      const product = req.body;
      console.log(product);

      const result = await productCollection.insertOne(product);
      res.send(result);
    })

       // post product collection
    app.post('/products', async (req, res) => {

      const product = req.body;
      console.log(product);

      const result = await productCollection.insertOne(product);
      res.send(result);
    })
    
    //delete a products 
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);


      const query = { _id: ObjectId(id) }
      const result = await productCollection.deleteOne(query);
      res.send(result)

    })
    //get a product for order
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;


      const query = { _id: ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result)

    })
    //payment system
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

    // post review

    app.post('/review', async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      res.send(result);

    })
    //get all review
    app.get('/review', async (req, res) => {

      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
    })
    //   get order for current user
    app.get('/order/:id', async (req, res) => {
      const email = req.params.id

      const query = { email: email }
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)


    })
    //get all order for admin
    app.get('/order', async (req, res) => {
     

      const query = {}
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)


    })
    //delete order for user
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
      const result = await userCollection.findOne(query);




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

    

  
});


//-------------------------


app.get("/", async (req, res) => {

  res.send({ result: 'success' });

});




   









app.listen(port, () => {
console.log(port ,'is runn');
});