require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.get('/', (req, res) => {
  res.send('Hello Manufacturer!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp60m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run(){
  try{
        await client.connect();
        const usersCollection = client.db("manufacturer").collection("users");
        const productCollection = client.db("manufacturer").collection("products");
        const orderCollection = client.db("manufacturer").collection("orders");
        const reviewCollection = client.db("manufacturer").collection("review");

         console.log("Connected successfully to server");


        // Create User 
        app.put('/user/:email', async(req, res)=>{ 
             const email = req.params.email;
            const newUser = req.body;  
            const filter = {email};
            const options = { upsert: true }; 
            const updateDoc = {
              $set: newUser,
            }; 
            const result = await usersCollection.updateOne(filter, updateDoc, options );
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        // Display User 
        app.get('/user/:email', async(req, res)=>{ 
            const email = req.params.email;
            // const newUser = req.body;  
           const query = {email};  
           const user = await usersCollection.findOne(query);
            res.send(user);
        })

        // Update User 
        app.put('/user/update/:email', async(req, res)=>{ 
            const email = req.params.email;
            const newUser = req.body;  
            const filter = {email};
            const options = { upsert: true }; 
            const updateDoc = {
              $set: newUser,
            }; 
            const result = await usersCollection.updateOne(filter, updateDoc, options ); 
            res.send(result);
        })


        // Create product  
        app.post('/product', async(req, res)=>{ 
            const newProduct = req.body; 
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            console.log(`A product was inserted with the _id: ${result.insertedId}`);
            res.send(result); 
        })

        // View products 
        app.get('/products', async (req, res)=>{
            const query = { }; 
            const cursor = productCollection.find(query);
            const products =   await cursor.toArray();
            res.send(products);
        })

        //Load Single Product
        app.get('/product/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        // Create Order 
        app.post('/order', async(req, res)=>{ 
            const newOrder = req.body; 
            const result = await orderCollection.insertOne(newOrder);
            console.log(`A order was inserted with the _id: ${result.insertedId}`);
            res.send(result); 
        })

        // View Orders (My Orders) 
        app.get('/orders', async (req, res)=>{  
                const email = req.query.email;  
                console.log(email);
                const query = {customerEmail: email}; 
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);  
        })

        //Load Single Order
        app.get('/order/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
        })

        //make payment
        app.put('/order/payment/:id', async(req, res)=>{ 
            const id = req.params.id;  
            const orderInfo = req.body; 
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }; 
            const updateDoc = {
              $set: {
                 payment: orderInfo.payment,
              },
            }; 
            const result = await orderCollection.updateOne(filter, updateDoc, options );
            res.send(result); 
        })


        //Delete Order
        app.delete('/order/delete/:id', async (req, res)=>{
            const id = req.params.id; 
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        // Create product review 
        app.post('/review', async(req, res)=>{ 
            const newProduct = req.body; 
            console.log(newProduct);
            const result = await reviewCollection.insertOne(newProduct);
            console.log(`A review was inserted with the _id: ${result.insertedId}`);
            res.send(result); 
        })

     
        // View product review  
        app.get('/reviews', async (req, res)=>{
            const query = { }; 
            const cursor = reviewCollection.find(query);
            const reviews =   await cursor.toArray();
            res.send(reviews);
        })

  }
  finally{


  }
}

run().catch(console.dir);


app.listen(port, () => {
  console.log(`Manufacturer app listening on port ${port}`)
})