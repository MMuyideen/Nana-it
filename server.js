const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { error } = require('console')
const { MongoClient } = require('mongodb');
const {isInvalidEmail, isEmptyPayload} = require('./validator')

const { DB_USER, DB_PASS, DEV } = process.env
const dbAddress = '127.0.0.1:27017'
const url = DEV ? `mongodb://${dbAddress}` : `mongodb://${DB_USER}:${DB_PASS}@${dbAddress}?authSource=company_db`;

// const url = `mongodb://${DB_USER}:${DB_PASS}@127.0.0.1:27017?authSource=company_db`;
const client = new MongoClient(url);
const dbName = 'company_db'
const collName = 'employees'

app.use(bodyParser.json())
app.use('/', express.static(__dirname + '/dist'))

app.get('/get-profile', async function(req, res) {


    // connnects to db 
    await client.connect()
    console.log('Connected successfully to server')

    // get the db and collection
    db = client.db(dbName)
    const collection = db.collection(collName)

    // get data from db
    const result = await collection.findOne({id: 1});
    console.log(result)
    client.close()

    response = {}

    if (result != null) {
       response = {
            name: result.name,
            email: result.email,
            interests: result.interests
        }

    }
    
    res.send(response)
})

app.post('/update-profile', async function(req, res) {
    const payload = req.body
    console.log(payload)

    if (isEmptyPayload(payload) || isInvalidEmail(payload)) {
        res.status(400).send({error: "Invalid payload. Couldn't update user profile"})
    } else{
        // connect to mongodb database
        await client.connect()
        console.log('Connected successfully to database server')

        // initiates the db
        const db = client.db(dbName)
        const collection = db.collection(collName)

        // save payload data to the data
        payload['id'] = 1;
        const updatedValues = { $set: payload }
        await collection.updateOne({id: 1}, updatedValues, {upsert: true});

        // close connection to db
        client.close()
        console.log('Closed connection to database server')

        // updating user profile
        res.status(200).send({info: "User profile updated successfully"})
    }

   
})

const server = app.listen(3000, function () {
    console.log("app Listening on port 3000")
})

module.exports = {
    app,
    server
};