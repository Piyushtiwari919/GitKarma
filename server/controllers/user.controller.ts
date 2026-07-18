const getUserInfo = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(500).json({ message: "No username present" });
    }
    const url = `https://api.github.com/users/${username}`;
    const response = await fetch(url);
    // console.log(response);

    if (!response.ok) {
      if (response.status === 404) {
        console.error("User not found.");
      } else {
        console.error(`API Error: ${response.statusText}`);
      }
      return null;
    }
    const data = await response.json();
    if (!data) {
      throw new Error("Data is not a json");
    }
    return res.status(200).json({ data: data });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error occured in getting user info" });
  }
};

export { getUserInfo };
