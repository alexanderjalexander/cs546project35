//This will be the seed file to add stuff to the database
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import items from '../data/items.js';
import dms from '../data/dms.js';
import trades from '../data/trades.js';

const db = await dbConnection();
await db.dropDatabase();

//add stuff here

console.log('Done seeding database');
await closeConnection();
