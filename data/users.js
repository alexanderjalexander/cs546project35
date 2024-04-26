import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import bcrypt from 'bcrypt';
const saltRounds = 16;




/**
 * Gets a review from the user collection by a user
 * @param {string} reviewerId the user's ID as a string
 * @returns one review that belongs to that userId
 */
const getReviewByUserId = async (reviewerId) => {
    reviewerId = helper.checkIdString(reviewerId);
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({reviewerId: new ObjectId(reviewerId)});
    if (item == null) throw 'Error: review with userId not found';
    review._id=review._id.toString();
    return review;

}

/**
 * creates a new review in the users collection
 * @returns {string} Objectid of the reviews collection
 */

const createReview = async () => {
    const userCollection = await users();
    const newReview = {
      temp: []
    };
    const insertInfo = await userCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add dm';
    const newId = insertInfo.insertedId.toString();
    const product = await get(newId);
    return product;
  };

/**
 * adds a review to the user collection
 * @param {string} id objectid from the user
 * @param {string} reviewerId user's ID as a string
 * @param {string} comm the user's comments
 * @param {number} rate the user's rating 
 * @returns a new review in the user collection
 */
const addReview = async (id, reviewerId, comm, rate) => {
    id = helper.checkIdString(id);
    reviewerId = helper.checkIdString(reviewerId);
    comm = helper.checkString(comment);
    rate=helper.makeRate(rate); 

    const userCollection = await users();

    let time = new Date(Date.now());
    const newReview = {  
        _id: new ObjectId(),
        userId: new ObjectId(reviewerId),
        comment: com,
        rating: rate,   
        timestamp: time
    };
    review.temp.push(newReview);

    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: user},
        {returnDocument: 'after'}
    );
    if (!updatedInfo) {
        throw 'could not update product successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
   
}
/**
 * gets a user by id
 *
 * @param   {[type]}  id  user's stringid
 *
 * @return  {[type]}      user JSON (id's converted to strings)
 */
const getUserById = async(id) =>{
    id = helper.checkIdString(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user === null) throw 'No user with that id';

    //make these assignments so it returns plain strings instead of objectids
    user._id = user.id.toString();
    user.items = user.items.map((element) =>{
        element = element.toString();
    })
    user.followers = user.followers.map((element) =>{
        element = element.toString();
    })
    user.following = user.following.map((element) =>{
        element = element.toString();
    })
    return user;
}


const createUser = async(
    firstName,
    lastName,
    email,
    username,
    password,
    themePreference
) => {

    const userCollection = await users();
    password = helper.checkPassword(password);
    const hashed = await bcrypt.hash(password, saltRounds);
    const newUser = {
        firstName: helper.checkName(firstName),
        lastName: helper.checkName(lastName),
        email: helper.checkEmail(email),
        username: helper.checkUsername(username),
        hashedPassword: hashed,
        themePreference: helper.checkTheme(themePreference),
        followers: [],
        following: [],
        avgRating: 0.0,
        reviews: []
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add user';
    const newId = insertInfo.insertedId.toString();
    const user = await getUserById(newId);
    return user;

}


export default {
    // updateUser,
    createUser,
    getUserById,
    // getUserItems,
    getReviewByUserId,
    addReview, 
    createReview
}























/* 
async function getAllReviews()
{
    const reviewCollection = await getAllReviews();
    const reviewList = await reviewCollection.find({}).toArray();
    return reviewList;
}

async function getReviewById(id)
{
    id = helper.checkId(id);
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({_id: new ObjectId(id)});
    if (!review) throw 'Error: review not found';
    return review;

}

async function addReview (comment, rating, reviewId, timestamp) {
    comment = helper.checkString(comment, 'Comment');
    rating = helper.checkString(rating, 'Rating'); 
    reviewId = helper.checkString(reviewId, 'Review ID');
    timestamp = helper.checkString(rating, 'Timestamp');

    const newReview = {
        comment: comment,
        rating: rating, 
        review: {
            id: new ObjectId(reviewId),

        }
    };

}

export {getAllReviews, getReviewById, addReview} */