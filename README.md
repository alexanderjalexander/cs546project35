# cs546project35
CS 546-A Spring 2024 Project Group 35
https://github.com/alexanderjalexander/cs546project35

**Authors**: Vivian Yam, Kian Holden, Alexander Jansiewics, Andrew Krasinki, and Clare O'Brien  

## Description:
BarterBuddy is a revolutionary trading platform targeted towards college students that allows people to trade items for other items. In other words, it is an attempt to forgo currency and bring back older practices of trading and bartering!
Whereas ecommerce and selling platforms like Ebay and Craigslist involve cash for items, students can post listings for individual items and trade one or more items with each other. It creates a fantastic way to not only get items you want faster, but also get rid of items quicker, all within your local college community!

## Dependencies

- "bcrypt": "^5.1.1",
  - Password hashing and account security
- "cookie-parser": "^1.4.6",
  - Parsing cookies from each user, helpful for user session
- "express": "^4.19.2",
  - Web Server Engine
- "express-handlebars": "^7.1.2",
  - Handlebars Engine for HTML
- "express-session": "^1.18.0",
  - Saving User Sessions in a 
- "mongodb": "^6.5.0",
  - Database powering the server
- "multer": "^1.4.5-lts.1",
  - For file uploads and saving user-submitted images to the web server.
- "xss": "^1.0.15"
  - Cross Site Scripting Attack Prevention

## How to Use:

1. Download and unzip the project code.
2. Open the project up in your favorite IDE. 
3. in the root directory of the project run `npm install` to install all dependencies.
4. Run `npm run seed`.
5. Then run `npm start`.
6. If it's not already there, ensure that a new `/server_images` folder appears in the server directory. If the server directory doesn't take care of this for you(it should), then create this folder. This directory is vital for public image uploading/hosting.
