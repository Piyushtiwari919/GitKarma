const validateUserName = (username: any) => {
  if (
    !username ||
    typeof username !== "string" ||
    !/^[a-zA-Z0-9-]{1,39}$/.test(username.trim())
  ) {
    return false;
  }
};

export {validateUserName};
