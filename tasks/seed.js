//This will be the seed file to add stuff to the database
import { ObjectId } from 'bson';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import items from '../data/items.js';
import dms from '../data/dms.js';
import trades from '../data/trades.js';
import objectList from './seedData.json' assert { type: "json" };


const db = await dbConnection();
await db.dropDatabase();

//add dummy data here
const userid1 = new ObjectId();
const userid2 = new ObjectId();
const dm1 = await dms.create(userid1.toString(), userid2.toString());
let msg1 = undefined;
let msg2 = undefined;
msg1 = await dms.writeMsg(dm1._id, userid1.toString(), "this is the first message!");
msg2 = await dms.writeMsg(dm1._id, userid2.toString(), "this is the second message!");

console.log(await dms.getById(dm1._id));

console.log('Done seeding database');
await closeConnection();
