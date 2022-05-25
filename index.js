const express = require('express');
var jwt = require('jsonwebtoken');
const stripe = require("stripe")('sk_test_51L1AL5E24HHvYt8NXQn1l7Wichrhs2EzUaMZxJkATi12Gdq2EEzFyZZ8YFMf8Pq5dXr1GdSgoOC2Do21V0VlcBDt00HtDXydNz');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors= require('cors');
const productRoutes = require('./routes/Products');
// const { default: Stripe } = require('stripe');

app.use(cors());
app.use(express.json());
require("dotenv").config();
const jwtToken = (req,res,next) => {
   const authHeader = req.headers.Authorization
   if(!authHeader){
       res.status(401).send('massage:Undathorized')
   }else{
       const [Breare,token] = authHeader.split(" ")
    jwt.verify(token, process.env.ACESS_TOKEN, function(err, decoded) {
        if(err){
            res.statue(401).send({massage:'forbidden access'})
        }else{
            decoded = req.decoded

            next()
        }
      });
   }
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bcfms.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run =async()=>{
    try{
        await client.connect();
        const productCollection = client.db("manufacture").collection("products");
        const orderCollection = client.db("manufacture").collection("orders");
        const reviewCollection = client.db("manufacture").collection("reviews");
        const userCollection = client.db("manufacture").collection("users");
        console.log('hellow worlkd');
        app.get('/products',async(req, res)=>{

            const query = {};
            const cursor = productCollection.find(query);
          const result = await cursor.toArray()
          res.send(result)
        })
       
        app.get('/products/:id',async(req, res)=>{
            const id = req.params.id;
            console.log(id);
           
            const query ={_id:ObjectId(id)}
            const result = await productCollection.findOne(query);
             res.send(result)

        })
        // app.put('/products/:id',async(req, res)=>{
        //     const id = req.params.id;
           
        //     const query ={_id:ObjectId(id)}
        //     const result = await productCollection.findOne(query);
        //      res.send(result)

        // })
        // -------------------
        app.post('/review',async(req, res)=>{
            const review =req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);

        })

        
           
           

    //    -------------------------------
    app.get('/order', async (req, res)=>{
        const query ={}
        const cursor = orderCollection.find(query);
          const result = await cursor.toArray()
          res.send(result)


    })
    app.delete('/order/:id', async (req, res)=>{
        const id = req.params.id;
           
            const query ={_id:ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
          res.send(result)
})
    app.get('/order/:id', async (req, res)=>{
        const id = req.params.id;
        // console.log(id);
           
            const query ={_id:ObjectId(id)}
            const result = await orderCollection.findOne(query);
          res.send(result)
})
app.patch('/order/:id', async (req, res)=>{
  const id = req.params.id;
  const filter ={_id:ObjectId(id)}
  const updateDoc = {
    $set: {
      paid:true,
      tran
    },
  };
  const result = await movies.updateOne(filter, updateDoc, options);
  
})
        
    app.post('/order',async(req, res)=>{
            const ordered = (req.body.orderInfo);
           
            const result = await orderCollection.insertOne(ordered);
            res.send(result);

        })




   
    




















// -----------------------------
app.post("/payment", async (req, res) => {
 
 const price = req.body
 const amount = price.total*100 

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },

  })
  res.send({
    clientSecret: paymentIntent.client_secret,
  });

  
 

 
})
















        
        // ---------------------------------
        app.put('/user/:id', async (req, res)=>{
            const userEmail = req.params.id;
            const filter = { email: userEmail };
            const options = { upsert: true };
            const user = {
                $set: {
                  email: userEmail
                },
              };
              const result = await userCollection.updateOne(filter, user, options);
            console.log(userEmail);
            const token = jwt.sign(userEmail, process.env.ACESS_TOKEN);
            res.send({token:token, result:result})

        })


    }
    catch(e){

    }


}

run().catch(console.dir);



app.use('/user',productRoutes)


app.listen(port,()=>{
    
});