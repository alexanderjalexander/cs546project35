import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

app.use(express.json());

configRoutes(app);

app.listen(3000, () => {
    console.log("BarterBuddy Active!");
    console.log('Routes are running on http://localhost:3000');
});