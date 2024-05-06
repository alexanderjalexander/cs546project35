import {items, trades, users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'

/**@typedef {({
 * _id:ObjectId,
 * userId:ObjectId,
 * name:string,
 * desc:string,
 * price:number,
 * image:string})} item
 * Describes a trade-able item. _id and userId are strings that can be converted to ObjectId's
 */

/** 
 * @returns A complete list of items stored in the database
 */
const getAll = async () => {
    const itemCollection = await items();
    let itemList = await itemCollection.find({}).toArray();
    if (!itemList) throw 'Could not fetch all items.';
    return itemList.map(element => ({ ...element, _id: element._id.toString(), userId: element.userId.toString() }));
}

/**
 * Gets an item from the item collection using an ObjectId
 * @param {string} id the ObjectID of the item as a string
 * @returns A singular item.
 */
const getById = async (id) => {
    id = helper.checkIdString(id);

    const itemCollection = await items();
    const item = await itemCollection.findOne({_id: new ObjectId(id)});
    if (item === null) {
        throw `No item with that id has been found.`
    }
    item._id = item._id.toString();
    item.userId = item.userId.toString();
    return item;
}

/**
 * Finds all the items owned/listed by a user
 * @param {string} userId the user's ID as a string
 * @returns an array of items belonging to that userId
 */
const getAllByUserId = async (userId) => {
    userId = helper.checkIdString(userId);

    const userCollection = await users();
    const items = await userCollection.findOne(
        {_id: new ObjectId(userId)},
        {projection: {_id: 0, items: 1}}
    );

    if (!items) {
        throw `No items with that userId has been found.`
    }
    const itemList = [];
    for (let itemId of items.items) {
        let itemDetails = await getById(itemId.toString())
        itemList.push(itemDetails);
    }
    return itemList;
}

/**
 * Finds all the items owned/listed not from a specific user
 * @param {string} userId the user's ID as a string
 * @returns an array of items belonging to that userId
 */
const getAllExceptUserId = async (userId) => {
    userId = helper.checkIdString(userId);

    const itemCollection = await items();
    const itemList = await itemCollection.find(
        {$nor: [{userId: new ObjectId(userId)}]}
    ).toArray();

    if (!itemList) {
        throw `No items have been found.`
    }
    return itemList;
}

/**
 * Patch updates an item using at least one of the provided values in updateObject.
 * @param {string} id the ObjectID of the item as a string
 * @param {string} userId the ObjectID of the user owning it as a string
 * @param {{name?:string, desc?:string, price?:number, image?:string}} updateObject 
 * @returns 
 */
const update = async (id, userId, updateObject) => {
    id = helper.checkIdString(id);
    userId = helper.checkIdString(userId);
    if (Object.keys(updateObject).length === 0) {
        throw `Must supply at least one key/value pair to updateObject.`
    }
    if (!Object.keys(updateObject).includes('name')
        && !Object.keys(updateObject).includes('desc')
        && !Object.keys(updateObject).includes('price')
        && !Object.keys(updateObject).includes('image')) {
        throw `Must supply at least one of these: name, desc, price, image`
    }

    const item = await getById(id);
    if (item.userId !== userId) {
        throw `Error: only the item's owner may update this item.`
    }

    let updatedItem = {
        userId: item.userId,
        name: (updateObject.hasOwnProperty('name'))
            ? helper.checkItemName(updateObject.name)
            : item.name,
        desc: (updateObject.hasOwnProperty('desc'))
            ? helper.checkItemDesc(updateObject.desc)
            : item.desc,
        price: (updateObject.hasOwnProperty('price'))
            ? helper.checkPrice(updateObject.price, 'price')
            : item.price,
        image: (updateObject.hasOwnProperty('image'))
            ? helper.checkString(updateObject.image, 'image path')
            : item.image
    };

    const itemCollection = await items();
    const updateInfo = await itemCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: updatedItem},
        {returnDocument: 'after'}
    );

    if (!updateInfo) throw `Update failed, could not find an item with id of ${id}`;
    return updateInfo;
}

/**
 * Adds a new item to a User's page.
 * @param {string} userId User's ID represented as a string
 * @param {string} name The name of the item
 * @param {string} desc The description of the item
 * @param {number} price The item's price, must be > 0 with 2 decimal places only
 * @param {string} image server-side image pathname
 * @returns the item from the database on successful completion
 */
const create = async (userId, name, desc, price, image) => {
    userId = helper.checkIdString(userId);
    name = helper.checkString(name, "name");
    desc = helper.checkString(desc, "desc");
    price = helper.checkPrice(price, "price");
    image = helper.checkString(image, "image");

    const newItem = {
        userId: new ObjectId(userId), name, desc, price, image
    }

    const itemCollection = await items();
    const insertInfo = await itemCollection.insertOne(newItem);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw `Error: could not add item.`;
    }
    const itemId = await insertInfo.insertedId;

    const userCollection = await users();
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$push: {items: itemId}}
    );

    return await getById(insertInfo.insertedId.toString());
}

/**
 * Attempts to remove an item.
 * @param {string} id Item's ID as a string
 * @param {string} userId User's ID as a string
 * @returns Object with id and deleted:true on successful deletion
 */
const remove = async (id, userId) => {
    id = helper.checkIdString(id);
    userId = helper.checkIdString(userId);

    const item = await getById(id);
    if (item.userId !== userId) {
        throw `Error: only the item's owner may remove this item.`
    }

    const itemCollection = await items();
    const removalInfo = await itemCollection.findOneAndDelete({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
    });
    if (!removalInfo) {
        throw `Error: Could not delete item with id of ${id}`;
    }

    const userCollection = await users();
    await userCollection.updateOne(
        {_id: new ObjectId(userId)},
        {$pull: {items: new ObjectId(id)}}
    );

    // Remove item from any trades the item appears in
    const tradesCollection = await trades();
    const updateInfo1 = await tradesCollection.updateMany(
        {senderId: new ObjectId(userId)},
        {$pull: {senderItems: new ObjectId(id)}}
        //here we just need to set the recieverStatus to pending again
    );
    if (!updateInfo1) {
        throw `Error: Could not delete item with id of ${id}`;
    }
    const updateInfo2 = await tradesCollection.updateMany(
        {receiverId: new ObjectId(userId)},
        {$pull: {receiverItems: new ObjectId(id)}}
        //here we just need to set the senderStatus to pending again
    );
    if (!updateInfo2) {
        throw `Error: Could not delete item with id of ${id}`;
    }

    // If in the event there are no items left in the trade,
    // the trade should delete itself.
    const deleteInfo1 = await tradesCollection.deleteMany(
        {senderItems: []}
    )
    if (!deleteInfo1) {
        throw `Error: Could not delete item with id of ${id}`;
    }

    const deleteInfo2 = await tradesCollection.deleteMany(
        {receiverItems: []}
    )
    if (!deleteInfo2) {
        throw `Error: Could not delete item with id of ${id}`;
    }

    return {_id: new Object(id), deleted: true}
}

const exportedMethods = {
    getAll, getById, getAllByUserId, getAllExceptUserId, update, create, remove
}

export default exportedMethods