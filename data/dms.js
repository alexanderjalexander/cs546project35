import {dms} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'

const get = async (id) => {
    /**
     * retrives the DM json by it's Objectid
     *
     * @param   {Object}  id  the objectid of the DM
     *
     * @return  {Object}      the json of the DM
     */
    id = helper.checkIdString(id);
    const dmCollection = await dms();
    const dm = await dmCollection.findOne({_id: new ObjectId(id)});
    if (dm === null) throw 'No product with that id';
    dm._id = dm._id.toString();
    return dm;
  };

const create = async (actor1, actor2) => {
    /**
     * Creates a new Direct Message in the dms collection
     *
     * @param   {ObjectId}  actor1  Objectid of one messager
     * @param   {ObjectId}  actor2  Objectid of other messager
     *
     * @return  {ObjectId}          Objectid of the direct message
     */
    const dmCollection = await dms();
    const newDM = {'actor1':new ObjectId(actor1), 'actor2':new ObjectId(actor1), 'messages': []};
    const insertInfo = await dmCollection.insertOne(newDM);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add dm';
    const newId = insertInfo.insertedId.toString();
    const product = await get(newId);
    return product;
  };

export default {
    get,
    create
};