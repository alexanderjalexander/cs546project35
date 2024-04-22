const constructorMethod = (app) => {
    app.use('/', (req, res) => {
        res.status(200).json({});
    });
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not Found'});
    });
};

export default constructorMethod;