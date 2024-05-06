import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js'
import bcrypt from 'bcrypt';
const saltRounds = 13;




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
 * @returns {string} ObjectId of the reviews collection
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
    const review = await get(newId);
    return review;
  };

/**
 * adds a review to the user collection
 * @param {string} id ObjectId of the user to be reviewed
 * @param {string} reviewerId reviewer's ID as a string
 * @param {string} comment the reviewer's comments
 * @param {number} rate the reviewer's rating 
 * @returns a new review in the user collection
 */
const addReview = async (id, reviewerId, comment, rate) => {
    id = helper.checkIdString(id);
    reviewerId = helper.checkIdString(reviewerId);
    comment = helper.checkString(comment, 'comment');
    rate=helper.checkRating(rate); 

    const userCollection = await users();

    let time = new Date(Date.now());
    const newReview = {  
        _id: new ObjectId(),
        userId: new ObjectId(reviewerId),
        comment: comment,
        rating: rate,   
        timestamp: time
    };

    //first we will find the user we need for the new review
    let user = await userCollection.findOne({_id: new ObjectId(id)});
  
    user.reviews.push(newReview);

    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: user},
        {returnDocument: 'after'}
    );
    if (!updatedInfo) {
        throw 'could not update user successfully';
    }
    await recalcAverageRating(id);
    user = await userCollection.findOne({_id: new ObjectId(id)});
    user._id = user._id.toString();
    return user;
}
/**
 * recalculates the average rating of a user
 * @param   {string}  userId  user's ObjectId string
 */
const recalcAverageRating = async (userId) => {
    userId = helper.checkIdString(userId);
    const userCollection = await users();
    let user = await getUserById(userId);
    let sum = 0;
    for (const rev of user.reviews){
      sum = sum + rev.rating;
    }
    let newAvg =  sum / user.reviews.length;
    if (user.reviews.length === 0)
      newAvg = 0;
    await userCollection.updateOne(
      {_id: new ObjectId(userId)},
      {$set: {avgRating: newAvg}},
      {returnDocument: 'after'}
    );
  }

/**
 * gets User By a string id
 * @param {string} id user's id as a string
 * @returns {Promise<*> | object}
 */
const getUserById = async (id) => {
    id = helper.checkIdString(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user === null) throw 'No user with that id';

    //make these assignments so, it returns plain strings instead of ObjectIds
    user._id = user._id.toString();
    return user;
}

/**
 * gets a user by their username
 * @return  {string} user id converted to string
 * @param username
 */
const getUserByUsername = async (username) => {
    username = helper.checkString(username);
    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (user === null) throw 'No user with that id';

    //make these assignments so, it returns plain strings instead of ObjectIds
    return user._id.toString();
}
/**
 * logs in the user with an email and password
 * @param {string} email email
 * @param {string} password plaintext password
 * @returns {Promise<{themePreference: (string|*), firstName: (string|*), lastName: (string|*), id: string, userName, email: *}>}
 */
const loginUser = async (email, password) => {
    email = helper.checkEmail(email);
    password = helper.checkPassword(password);
  
    const userCollection = await users();
    const foundUser = await userCollection.findOne({email: email});
    if (!foundUser) throw 'Either the username or password is invalid';
    const pswdMatch = await bcrypt.compare(password, foundUser.hashedPassword);
    if (!pswdMatch){
        throw 'Either the username or password is invalid';
    }
    return {
        _id: foundUser._id.toString(),
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        username: foundUser.username,
        email: foundUser.email,
        themePreference: foundUser.themePreference
    }
  };

/**
 * creates a new user in the database
 * @param {string} firstName user's first name
 * @param {string} lastName user's last name
 * @param {string} email user's email
 * @param {string} username user's username
 * @param {string} password raw password (plaintext)
 * @param {string} themePreference user's theme preference
 * @return  {Object}  new user json (ObjectId represented as a string)
 */
const createUser = async (
    firstName,
    lastName,
    email,
    username,
    password,
    themePreference
) => {

    firstName = helper.checkName(firstName);
    lastName = helper.checkName(lastName);
    username = helper.checkUsername(username);
    username = username.toLowerCase();
    email = helper.checkEmail(email);
    password = helper.checkPassword(password);
    themePreference = helper.checkTheme(themePreference);
  
    //check for duplicate username in the system first
    const userCollection = await users();
    const foundUsername = await userCollection.findOne({username: username});
    if (foundUsername) throw 'there is already a user with that username';
    const foundEmail = await userCollection.findOne({email: email});
    if (foundEmail) throw 'there is already a user with that email';


    password = helper.checkPassword(password);
    const hashed = await bcrypt.hash(password, saltRounds);
    const newUser = {
        firstName: helper.checkName(firstName, 'First Name'),
        lastName: helper.checkName(lastName, 'Last Name'),
        email: helper.checkEmail(email),
        username: helper.checkUsername(username),
        hashedPassword: hashed,
        items: [],
        wishlist: [],
        followers: [],
        following: [],
        reviews: [],
        avgRating: 0.0,
        themePreference: helper.checkTheme(themePreference)
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw 'Could not add user';
    const newId = insertInfo.insertedId.toString();
    const user = await getUserById(newId);
    return user;

}
/**
 * adds to their follower list of the object specified by userId.
 * Also adds to the following list of the object specified by followerId
 * @param   {string}  userId      string id of the followee
 * @param   {string}  followerId  string id of the follower
 */
const addFollower = async(userId, followerId) => {
    userId = helper.checkIdString(userId);
    followerId = helper.checkIdString(followerId);
    const userCollection = await users();

    let followee = await userCollection.findOne({_id: new ObjectId(userId)});
    followee.followers.push(new ObjectId(followerId));
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(userId)},
        {$set: followee},
        {returnDocument: 'after'}
    );
    if (!updatedInfo) {
        throw 'could not update user successfully';
    }

    let follower = await userCollection.findOne({_id: new ObjectId(followerId)});
    follower.following.push(new ObjectId(userId));
    const updatedInfo2 = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(followerId)},
        {$set: follower},
        {returnDocument: 'after'}
    );
    if (!updatedInfo2) {
        throw 'could not update user successfully';
    }
}


/**
 * adds a wish to the users wishlist
 * @param   {string}  userId  user's ObjectId as a string
 * @param   {string}  wish    item
 */
const addWish = async(userId, wish) => {
    userId = helper.checkIdString(userId);
    wish = helper.checkString(wish);
    const userCollection = await users();

    let user = await userCollection.findOne({_id: new ObjectId(userId)});
    user.wishlist.push(wish);
    const updatedInfo = await userCollection.findOneAndUpdate(
        {_id: new ObjectId(userId)},
        {$set: user},
        {returnDocument: 'after'}
    );
    if (!updatedInfo) {
        throw 'could not update user successfully';
    }
}

const updateUser = async (id, updateData) => {
    const userCollection = await users();
    if (updateData.password) {
        updateData.hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        delete updateData.password;
    }
    const updateInfo = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );

    if (updateInfo.modifiedCount === 0) {
        throw new Error('Could not update user');
    }
    return getUserById(id);
}

export default {
    addWish,
    getUserById,
    getUserByUsername,
    getReviewByUserId,
    createUser,
    createReview,
    addReview,
    addFollower,
    loginUser,
    updateUser,
}