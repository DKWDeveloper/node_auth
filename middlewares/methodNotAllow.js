// Middleware to handle unsupported HTTP methods
const methodNotAllowed = (req, res, next) => {
    res.status(405).send({ success: false, message: 'Method not allowed' });
};

export default methodNotAllowed;