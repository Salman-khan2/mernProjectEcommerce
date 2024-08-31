// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Calculate expiration time in milliseconds
  const expiresInMilliseconds = process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000;

  // options for cookie
  const options = {
    expires: new Date(Date.now() + expiresInMilliseconds),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
