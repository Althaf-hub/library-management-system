export const notFound = (req, res) =>
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || 'Server error';

    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    } else if (err.code === 11000) {
        status = 409;
        message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`;
    }

    if (status === 500) console.error(err);
    res.status(status).json({ message });
};

// Small helper so controllers can throw with a status code
export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}