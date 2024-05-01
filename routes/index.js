import dmRoutes from './dms.js';
import itemRoutes from './items.js';
import tradeRoutes from './trades.js';
import userRoutes from './users.js';
import authRoutes from './auth_routes.js';
import profileRoutes from './profile.js';


const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/directmsgs', dmRoutes);
    app.use('/profile', profileRoutes);
    app.use('/profiles', userRoutes);
    app.use('/items', itemRoutes);
    app.use('/trades', tradeRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};

export default constructorMethod;
