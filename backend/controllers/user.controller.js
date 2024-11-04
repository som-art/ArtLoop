import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {
  const { userName } = req.params;
  try {
    const user = await User.findOne({ userName }).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  //get id of the user to follow/unfollow from the request parameter
  const { id } = req.params;
  //get details of both user to follow/unfollow and the current user
  const userToModify = await User.findById(id);
  const currentUser = await User.findById(req.user._id);
  try {
    //Check if both current user_id and the id of the user to modify is same
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    //Check if both user exists
    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    //Check if the user exists in the following list or not
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //if already follows then unfollow user

      //remove current user from the followers list of the user to unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

      //remove the user to unfollow from the following list of the current user
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      //follow user

      //add current user to the followers list of the user to follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

      //add the user to follow to the following list of current user
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification to user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });

      await newNotification.save();
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUserss = async (req, res) => {
  try {
    // Current user logged-in id
    const userId = req.user._id;

    // List of users whom the currently logged-in user follows
    const usersFollowedByMe = await User.findById(userId).select("following");

    // Fetch users that the current user is not following and have mutual followers
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude the current user
          followers: { $in: usersFollowedByMe.following }, // Mutual followers
        },
      },
      { $sample: { size: 10 } }, // Select a random sample of 10 users
    ]);

    // Exclude the users already followed by the current user
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    // Show only 4 users as suggestions
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove the password field from the user objects
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in suggestedUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // 1,2,3,4,5,6,
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { userName, fullName, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);

    //Check if user exists
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    //For changing password both current and new password required
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      //Match current password provided in body with the one retrieved from database
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });

      //Check if new passowrrd is atleast of length 6
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      //Hash new password and store it in user
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      //console.log(user.password);
    }

    //Update profile image
    if (profileImg) {
      //if user already has a profile image delete it from cloudinary
      if (user.profileImg) {
        // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      //upload image in cloudinary
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      //store the modified url to update in database
      profileImg = uploadedResponse.secure_url;
    }

    //Update cover image
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    //update required fields else keep original value
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.userName = userName || user.userName;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    //save updated values in the database
    user = await user.save();

    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
