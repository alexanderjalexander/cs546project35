import {trades} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'

/**
 * Gets a trade from the trade collection using an ObjectId
 * @param {string} id the ObjectID of the trade as a string
 * @returns A singular trade document.
 */

const get = async (id) => {

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

};

/**
 * Swaps the sender and receiver roles and their items in a trade.
 * @param {string} id the ObjectID of the trade as a string
 * @returns {Object} The updated trade document after swap
 */

const swap = async (id) => {

};

export default {
    get,
    create,
    swap
};