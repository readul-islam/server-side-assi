const express = require('express');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const cors= require('cors');
const productRoutes = require('./routes/Products')
app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bcfms.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run =async()=>{
    try{
        await client.connect();
        const productCollection = client.db("manufacture").collection("products");
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


    }
    catch(e){

    }


}

run().catch(console.dir);



app.use('/user',productRoutes)


app.listen(port,()=>{
    
});