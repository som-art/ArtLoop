import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;

    //Checking valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // If doesnot match with given regex
      return res.status(400).json({ error: "Invalid email format" });
    }

    //Checking if userName exists
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    //Checking if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Account already exists for this e-mail id" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be atleast 6 character long" });
    }
    //Hash Password for privacy
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      userName: userName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      //For a valid user generate a token
      generateTokenAndSetCookie(newUser._id, res);
      //Save user information in data base
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        userName: newUser.userName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { userNameOrEmail, password } = req.body;

    // Find the user by either username or email
    const user = await User.findOne({
      $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
    });
    //compare with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    //console.log(user.password);
    //console.log(isPasswordCorrect);
    //Checking if user is invalid
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }
    //Generate token for a valid user login
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const google = async (req, res) => {
  const { email, name } = req.body;
  let { googlePhotoUrl } = req.body;

  // Regex for validating email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // Generate token for existing user and respond with user data
      generateTokenAndSetCookie(user._id, res);
      const { password, ...rest } = user._doc;
      return res.status(200).json(rest);
    }

    // Generate a random password for new Google user
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create a unique username
    const userName =
      name.toLowerCase().split(" ").join("") +
      Math.random().toString(36).slice(-4);

    //Upload picture in cloudinary
    if (googlePhotoUrl) {
      //upload image in cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(googlePhotoUrl);
      //store the modified url to update in database
      googlePhotoUrl = uploadedResponse.secure_url;
    }

    // Create new user
    const newUser = new User({
      userName: userName,
      fullName: name,
      email,
      password: hashedPassword,
      profilePicture: googlePhotoUrl,
    });

    // Save new user in the database
    await newUser.save();

    // Generate token for the new user
    generateTokenAndSetCookie(newUser._id, res);
    const { password, ...rest } = newUser._doc;
    res.status(201).json(rest);
  } catch (error) {
    console.log("Error in Google signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    //Set the JWT cookie with an empty value and immediately expires it by setting maxAge: 0.
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out Succesfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
