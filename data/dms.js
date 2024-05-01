import {dms} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'


/**
 * retrives the DM json by either user's Objectid
 * @param   {string}  id  the objectid of the user
 * @return  {Array[Object]}      array of json of the DMs
 */
const getByUserId = async (id) => {
  id = helper.checkIdString(id);
  const dmCollection = await dms();
  const dms = await dmCollection.find({$or: [{actor1: new ObjectId(id)},{actor2: new ObjectId(id)}]}).toArray();
  //make these assignments so it returns plain strings instead of objectids
  return dms;
};

/**
 * retrives the DM json by it's Objectid
 * @param   {string}  id  the objectid of the DM
 * @return  {Object}      the json of the DM
 */
const getById = async (id) => {
    id = helper.checkIdString(id);
    const dmCollection = await dms();
    const dm = await dmCollection.findOne({_id: new ObjectId(id)});
    if (dm === null) throw 'No product with that id';

    //make these assignments so it returns plain strings instead of objectids
    dm._id = dm._id.toString();
    dm.actor1 = dm.actor1.toString();
    dm.actor2 = dm.actor2.toString();

    return dm;
  };

/**
 * Creates a new Direct Message in the dms collection
 *
 * @param   {string}  actor1  Objectid of one messager
 * @param   {string}  actor2  Objectid of other messager
 *
 * @return  {string}          Object of the direct message
 */
const create = async (actor1, actor2) => {
    const dmCollection = await dms();
    const newDM = {
      actor1: new ObjectId(actor1),
      actor2: new ObjectId(actor2),
      messages: []
    };
    const insertInfo = await dmCollection.insertOne(newDM);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add dm';
    const newId = insertInfo.insertedId.toString();
    const dm = await getById(newId);
    return dm;
  };

/**
 * adds a message to the dm found by id
 *
 * @param   {string}  id  objectid of the dm
 * @param   {string}  senderid  objectid of the sender
 * @param   {string}  msg  sender's message
 *  
 * @return  {[type]}      [return description]
 */
const writeMsg = async (id, senderid, msg) => {
    id = helper.checkIdString(id);
    senderid = helper.checkIdString(senderid);
    msg = helper.checkString(msg);
    const dmsCollection = await dms();
    //first we will find the product we need for the new review
    let dm = await dmsCollection.findOne({_id: new ObjectId(id)});

    //we need to first find the product, then edit it's contents to include the review
    let time = new Date(Date.now());
    const newMsg = {  
        _id: new ObjectId(),
        sender: new ObjectId(senderid),
        content: msg,
        timestamp: time
    };
    
    dm.messages.push(newMsg);
    
    //then we will findOneAndUpdate that same product again but replace it with the new product
    const updatedInfo = await dmsCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: dm},
        {returnDocument: 'after'}
    );
    if (!updatedInfo) {
        throw 'could not update product successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
}


export default {
    getByUserId,
    getById,
    create,
    writeMsg
};