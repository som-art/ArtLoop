import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    //Find the notifications send to that user by matching the userId to the 'to' field
    // Find the notifications sent to that user, sorting by latest first
    const notifications = await Notification.find({ to: userId })
      .populate({
        path: "from",
        // Select only the username and profile image fields to display
        select: "userName profileImg",
      })
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    //After opening the notification mark the new ones as read
    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
