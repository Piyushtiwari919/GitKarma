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
        throw new Error("User not found.");
      } else {
        throw new Error(`API Error: ${response.statusText}`);
      }
    }
    const data = await response.json();
    if (!data) {
      throw new Error("Data is not a json");
    }
    return res.status(200).json({ data: data });
  } catch (err: any) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message });
  }
};

export { getUserInfo };
