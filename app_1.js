
let express = require('express');
let app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
//const mongoUrl = "mongodb://localhost:27017"
//const mongoUrl = "mongodb+srv://mango:mango123@cluster0.km6ui.mongodb.net/zomatoTest?retryWrites=true&w=majority"
//const mongoUrl = "mongodb+srv://mango:mango123@cluster0.f8vmc.mongodb.net/augintern?retryWrites=true&w=majority"
const mongoUrl="mongodb+srv://mango:mango12345@cluster0.km6ui.mongodb.net/oyoTest?retryWrites=true&w=majority"
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser')
const cors = require('cors')
let port = process.env.PORT || 8210;
var db;
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())


//get 
app.get('/',(req,res) => {
    res.send("Welcome to express")
})
// location
app.get('/location',(req,res) => {
    db.collection('location').find().toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

// hotel wrt location
app.get('/hotel/:id',(req,res) => {
    let restId  = Number(req.params.id)
    console.log(">>>>restId",restId)
    db.collection('hotelData').find({state_id:restId}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

// category
app.get('/category',(req,res) => {
    db.collection('category').find().toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})
// details
app.get('/details/:id',(req,res) => {
    let restId  = Number(req.params.id)
    // let restId = mongo.ObjectId(req.params.id)
    db.collection('hotelData').find({hotel_id:restId}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})
// menu wrt hotel
app.get('/menu/:id',(req,res) => {
    let restId  = Number(req.params.id)
    db.collection('hotelData').find({hotel_id:restId}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})


//filters
app.get('/filter/:stateId',(req,res) => {
    let sort = {cost:1}
    let stateId = Number(req.params.stateId)
    
    
    let categoryId =  Number(req.query.category)
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    let query = {}
    if(req.query.sort){
        sort = {cost:req.query.sort}
    }
    
    if(categoryId&lcost&hcost){
        query = {
            "categories.category_id":categoryId,
            "state_id":stateId,
            $and:[{cost:{$gt:lcost,$lt:hcost}}]
        }
    }
    else if(categoryId){
        query = {"categories.category_id":categoryId,"state_id":stateId}
    }
    else if(lcost&hcost){
        query = {$and:[{cost:{$gt:lcost,$lt:hcost}}],"state_id":stateId}
    }

    db.collection('hotelData').find(query).sort(sort).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//place order
app.post('/placeOrder',(req,res) => {
    //console.log(req.body)
    db.collection('booking').insertOne(req.body,(err,result) =>{
        if(err) throw err;
        res.send('Booking Done')
    })
})
//delete order
app.delete('/deleteOrder',(req,res) => {
    db.collection('orders').remove({},(err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})



// get orders
app.get('/orders',(req,res) => {
    let email  = req.query.email
    let query = {};
    if(email){
        query = {"email":email}
    }
    db.collection('booking').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})
//post menu
app.post('/menuItem',(req,res) => {
    console.log(req.body)
    db.collection('hotelData').find({menu_id:{$in:req.body}}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})
app.put('/updateOrder/:id',(req,res) => {
    let oId = mongo.ObjectId(req.params.id)
    let status = req.query.status?req.query.status:'Pending'
    db.collection('booking').updateOne(
        {_id:oId},
        {$set:{
            "status":status,
            "bank_name":req.body.bank_name,
            "bank_status":req.body.bank_status
        }},(err,result)=>{
            if(err) throw err;
            res.send(`Status Updated to ${status}`)
        }
    )
})
MongoClient.connect(mongoUrl, (err,client) => {
    if(err) console.log("Error While Connecting");
    db = client.db('oyoTest');
    app.listen(port,()=>{
        console.log(`listening on port no ${port}`)
    });
})
