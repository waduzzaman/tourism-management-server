
const express = require( 'express' );
const cors = require( 'cors' );
require( 'dotenv' ).config();
const { MongoClient, ServerApiVersion, ObjectId } = require( 'mongodb' );

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use( cors() );
app.use( express.json() );

const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.nrvepld.mongodb.net`;

async function run ()
{
  const client = new MongoClient( uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  } );

  try
  {
    // Connect the client to the server
    await client.connect();
    console.log( "Connected to MongoDB!" );

    const spotsCollection = client.db( 'spotsDB' ).collection( 'spots' );

    // Define routes after connecting to the database
    app.get( '/spots', async ( req, res ) =>
    {
      const cursor = spotsCollection.find();
      const result = await cursor.toArray();
      res.send( result );
    } );

    // Post / add spots in the database 
    app.post( '/spots', async ( req, res ) =>
    {
      const newSpots = req.body;
      console.log( newSpots );
      const result = await spotsCollection.insertOne( newSpots );
      res.send( result );
    } )

    // find one  spot by id and return it as json
    app.get( '/spots/:id', async ( req, res ) =>
    {
      const id = req.params.id;
      const query = { _id: new ObjectId( id ) }
      const result = await spotsCollection.findOne( query );
      res.send( result );
    } )



    // // Find spot by email and return it as JSON
    // app.get( '/spots/:email', async ( req, res ) =>    {   
    //   console.log(req.params.email);
    //   const result = await spotsCollection.find({email:
    //   req.params.email} ).toArray;
    //   res.send( result );
    // } );


    // Find spot by email and return it as JSON
    app.get( '/spots/email/:email', async ( req, res ) =>
    {
      try
      {
        const email = req.params.email;
        const result = await spotsCollection.find( { email: email } ).toArray();
        res.send( result );
      } catch ( error )
      {
        console.error( 'Error fetching spots by email:', error );
        res.status( 500 ).send( { error: 'Internal server error' } );
      }
    } );

    // Update  a spot by its ID. Requires the data in the body of the PUT request to contain
    // at least an `updatedAt` timestamp. Returns the updated document as JSON.
    app.put( "/spots/:id", async ( req, res ) =>
    {
      if ( !req.body.updatedAt )
      {
        return res.status(400).send({ error: "Missing `updatedAt` timestamp in request body" });
      }

      const note = req.body;  
      let updatedDocument = {};

      try
      {
        updatedDocument = await spotsCollection.findOneAndUpdate(
          { _id: req.params.id },
          { $set: note, updatedAt: new Date() },
          { returnOriginal: false }
        );
      } catch ( e )
      {
        console.log(e);
        return res.status(400).send({ error: "Could not update note"});
      }
      
      res.send( updatedDocument.value );
    } );

  




    // Delete a spot by id
    app.delete( '/spots/:id', async ( req, res ) =>
    {
      const id = req.params.id;
      const query = { _id: new ObjectId( id ) };
      const result = await spotsCollection.deleteOne( query );
      res.send( result );
    } );


    // Start the server after setting up routes
    app.listen( port, () =>
    {
      console.log( `Tourism Management Server is running on port: ${ port }` );
    } );
  } catch ( err )
  {
    console.error( "Error connecting to MongoDB:", err );
  }
}

run().catch( console.error );
