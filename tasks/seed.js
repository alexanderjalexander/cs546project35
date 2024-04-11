//This will be the seed file to add stuff to the database
import { ObjectId } from 'bson';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
// import users from '../data/users.js';
// import items from '../data/items.js';
import dms from '../data/dms.js';
// import trades from '../data/trades.js';

const db = await dbConnection();
await db.dropDatabase();

//add stuff here
const userid1 = new ObjectId();
const userid2 = new ObjectId();
const dm1 = await dms.create(userid1.toString(), userid2.toString());

console.log('Done seeding database');
await closeConnection();
