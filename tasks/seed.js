//This will be the seed file to add stuff to the database
import { ObjectId } from 'bson';
import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import users from '../data/users.js';
import items from '../data/items.js';
import dms from '../data/dms.js';
import trades from '../data/trades.js';
// import objectList from './seedData.json' assert { type: "json" };
import * as fs from 'fs';
import {fileURLToPath} from 'url';
import * as path from 'path';
import { log } from 'console';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const jsonFilePath = path.join(__filename, '../seedData.json');
// Read users.json file 
let objectList = undefined;
try {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    objectList = JSON.parse(data);
} catch (err) {
    console.error('Error reading file:', err);
}

const db = await dbConnection();
await db.dropDatabase();

const people = {};


for (const user of objectList.users){
    //add each user to the database
    people[user.username] = await users.createUser(
        user.firstName,
        user.lastName,
        user.email,
        user.username,
        user.password,
        user.themePreference
    );
    //need to add items in their wishlist
    for (const wish of user.wishlist){
        await users.addWish(people[user.username]._id, wish);
    }
}
console.log("added all the users. Now updating user data...");
for(const user of objectList.users){
    for(const review of user.reviews){ //add reviews
        await users.addReview(
            people[user.username]._id,
            people[review.reviewer]._id,
            review.comment,
            review.rating
        );
    }
    for(const follower of user.followers){ //add followers
        await users.addFollower(people[user.username]._id, people[follower]._id);
    }
}
const stuff = {}
for(const item of objectList.items){ //items
    stuff[item.name] = await items.create(
        people[item.user]._id, 
        item.name, 
        item.description, 
        item.price, 
        item.image);
}

for(const trade of objectList.trades){ //adding trades
    trade.senderItems = trade.senderItems.map((el)=>stuff[el]._id);
    trade.receiverItems = trade.receiverItems.map((el)=>stuff[el]._id);
    const currentTrade = await trades.create(people[trade.sender]._id, people[trade.receiver]._id, trade.senderItems, trade.receiverItems);
    await trades.update(currentTrade._id, {'status': trade.status});
}

for(const dm of objectList.DMS){
    let currentDM = await dms.create(people[dm.actor1]._id, people[dm.actor2]._id);
    for(const message of dm.messages){
        await dms.writeMsg(currentDM._id, people[message.sender]._id, message.content)
    }
}

console.log('Done seeding database');
await closeConnection();
