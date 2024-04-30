
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

    // To Update  a spot by its ID create a method. Requires the data in the body of the PUT request to contain
    // at least an `updatedAt` timestamp. Returns the updated document as JSON.
    app.get( "/spots/:id", async ( req, res ) =>
    {
      console.log( req.params.id );
      const result = await spotsCollection.findOne( {
        _id: new ObjectId( req.params.id ),
      } );

      console.log( result );
      res.send( result );
    } )

    // Update a  specific spot based on its ID. 
    app.put( "/updateSpots/:id", async ( req, res ) =>
    {
      console.log( req.params.id );
      const query = { _id: new ObjectId( req.params.id ) };
      const data = {
        $set: {
          tourists_spot_name: req.body.tourists_spot_name,
          country_name: req.body.country_name,
          location: req.body.location,
          short_description: req.body.short_description,
          average_cost: req.body.average_cost,
          seasonality: req.body.seasonality,
          travel_duration: req.body.travel_duration,
          total_visitors_per_year: req.body.total_visitors_per_year,
          image: req.body.image
        }
      }

      const result = await spotsCollection.updateOne( query, data )
      console.log( result );
      res.send( result )

    } )



    // Delete a spot by id
    app.delete( '/delete/:id', async ( req, res ) =>
    {

      const result = await spotsCollection.deleteOne( { _id: new ObjectId( req.params.id ) } );
      console.log( result );
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
