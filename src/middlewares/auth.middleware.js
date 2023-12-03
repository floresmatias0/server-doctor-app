const isAuthenticated = (req, res, next) => {
    // if (req.isAuthenticated()) {
    //   return next();
    // }
    
    // throw new Error("Unauthorized")
    return next();
}

module.exports = {
    isAuthenticated
}