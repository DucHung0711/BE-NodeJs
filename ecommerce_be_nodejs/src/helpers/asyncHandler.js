const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            console.error('DEBUG - Caught error in asyncHandler:', err)
            next(err)
        })
    }
}

module.exports = {
    asyncHandler
}