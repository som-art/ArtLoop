export const signup = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;

    //Checking valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // If doesnot match with given regex
      return res.status(400).json({ error: "Invalid email format" });
    }
  } catch (err) {}
};
