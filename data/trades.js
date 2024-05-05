import {trades} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'

/**
 * Gets a trade from the trade collection using an ObjectId
 * @param {string} id the ObjectID of the trade as a string
 * @returns A singular trade document
 */

const get = async (id) => {
    id = helper.checkIdString(id);

    const tradeCollection = await trades();
    const trade = await tradeCollection.findOne({_id: new ObjectId(id)});
    if (trade === null) throw 'No trade with provided id';

    trade._id = trade._id.toString();
    trade.senderId = trade.senderId.toString();
    trade.receiverId = trade.receiverId.toString();
    return trade;
};

/**
 * Creates a new trade in the trades collection
 *
 * @param {string} senderId ObjectId of the sender
 * @param {string} receiverId ObjectId of the receiver
 * @param {Array<string>} senderItems Array of ObjectIds representing items from the sender
 * @param {Array<string>} receiverItems Array of ObjectIds representing items from the receiver
 * @return {Object} The newly created trade document
 */

const create = async (senderId, receiverId, senderItems, receiverItems) => {
    const tradeCollection = await trades();

    const newTrade = {
        senderId: new ObjectId(senderId),
        receiverId: new ObjectId(receiverId),
        senderItems: senderItems.map(id => new ObjectId(id)),
        receiverItems: receiverItems.map(id => new ObjectId(id)),
        status: 'requested'
    };

    const insertInfo = await tradeCollection.insertOne(newTrade);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Failed to create trade';

    return await get(insertInfo.insertedId.toString());
};

/**
 * Swaps sender and receiver roles and their items in a trade
 * @param {string} id the ObjectID of the trade as a string
 * @returns {Object} The updated trade document after swap
 */

const swap = async (id) => {
    id = helper.checkIdString(id);

    const tradeCollection = await trades();
    const trade = await tradeCollection.findOne({_id: new ObjectId(id)});
    if (!trade) throw 'No trade with provided id';

    const tempSenderId = trade.senderId;
    const tempSenderItems = trade.senderItems;

    trade.senderId = trade.receiverId;
    trade.senderItems = trade.receiverItems;
    trade.receiverId = tempSenderId;
    trade.receiverItems = tempSenderItems;

    const updateInfo = await tradeCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: { 
            senderId: trade.senderId, 
            senderItems: trade.senderItems,
            receiverId: trade.receiverId,
            receiverItems: trade.receiverItems 
        }}
    );

    if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw 'Failed to update trade';

    return await get(id);
};


/**
 * Gets all the trades for whcih the userId is one of the actors
 * @param {string} id the ObjectID of the user
 * @returns {Array[Object]} All of the user's trades
 */
const getAll = async (userId) => { 
    const tradesCollection = await trades();
    userId = helper.checkIdString(userId);
    let tradesList = await tradesCollection
        .find({ $or: [{senderId: new ObjectId(userId)},{receiverId: new ObjectId(userId)}]})
        .toArray();
    tradesList = tradesList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return tradesList;
  };

const update = async (id, updateObject) => {
    id = helper.checkIdString(id);
    if (Object.keys(updateObject).length === 0) {
        throw `Must supply at least one key/value pair to updateObject.`
    }
    if (!Object.keys(updateObject).includes('senderId')
        && !Object.keys(updateObject).includes('recieverId')
        && !Object.keys(updateObject).includes('status')
        && !Object.keys(updateObject).includes('senderItems')
        && !Object.keys(updateObject).includes('receiverItems')) {
        throw `Must supply at least one of these: stats, senderId, recieverId, senderItems, receiverItems`
    }
    const trade = await get(id);
    trade.senderId = new ObjectId(trade.senderId);
    trade.receiverId = new ObjectId(trade.receiverId);

    let updatedTrade = {
        senderId: (updateObject.hasOwnProperty('senderId'))
            ? helper.checkIdString(updateObject.senderId, 'senderId')
            : trade.senderId,
        receiverId: (updateObject.hasOwnProperty('receiverId'))
            ? helper.checkIdString(updateObject.recieverId, 'receiverId')
            : trade.receiverId,
        senderItems: (updateObject.hasOwnProperty('senderItems'))
            ? helper.checkIdArray(updateObject.senderItems, 'senderItems')
            : trade.senderItems,
        receiverItems: (updateObject.hasOwnProperty('receiverItems'))
            ? helper.checkArray(updateObject.receiverItems, 'receiverItems')
            : trade.receiverItems,
        status: (updateObject.hasOwnProperty('status'))
            ? helper.checkString(updateObject.status, 'status')
            : trade.status,
    };

    const tradesCollection = await trades();
    const updateInfo = await tradesCollection.updateOne(
        {_id: new ObjectId(id)}, 
        {$set: updatedTrade},
        {returnDocument: 'after'}
    );

    if (!updateInfo) throw `Update failed, could not find an item with id of ${id}`;
    return updateInfo;
};

const remove = async (id) => {
    id = helper.checkIdString(id);

    const tradeCollection = await trades();
    const removalInfo = await tradeCollection.findOneAndDelete({
        _id: new ObjectId(id),
    });
    
    if (!removalInfo) {
        throw `Error: Could not delete trade with id of ${id}`;
    }

    return {_id: new Object(id), deleted: true}
}

export default {
    remove,
    getAll,
    get,
    create,
    swap,
    update,
};