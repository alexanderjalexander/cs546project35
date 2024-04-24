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

const getAll = async (userId) => { 
    const tradesCollection = await trades();
    userId = helper.checkIdString();
    let tradesList = await tradesCollection
        .find({senderId: new ObjectId(userId)})
        .project({status: 1, receiverId: 1})
        .toArray();
    let secondTradesList = await tradesCollection
    .find({receiverId: new ObjectId(userId)})
    .project({status: 1, senderId: 1})
    .toArray();
    if (!tradesList || !secondTradesList) throw 'Could not get all trades';
    tradesList.push(...secondTradesList);
    tradesList = tradesList.map((element) => {
      element._id = element._id.toString();
      return element;
    });
    return tradesList;
  };

export default {
    get,
    create,
    swap
};