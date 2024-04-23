import dmRoutes from './dms.js';
import itemRoutes from './items.js';
import tradeRoutes from './trades.js';
import userRoutes from './users.js';
import authRoutes from './auth_routes.js';


const constructorMethod = (app) => {
    app.use('/', authRoutes);
    app.use('/dms', productRoutes);
    app.use('/profiles', reviewRoutes);
    app.use('/items', itemRoutes);
    app.use('/users', userRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
    });
};

export default constructorMethod;
