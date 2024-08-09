import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  //Create a token using JWT use the userId as payload to understand which user has this token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  //Set the token as cookie
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //expires in ms
    httpOnly: true, //prevent xss attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
};
