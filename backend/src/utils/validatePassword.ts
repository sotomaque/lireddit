export const validatePassword = (password: string) => {
  if (password.length <= 5) {
    return [
      {
        field: "password",
        message: "length must be greater than five",
      },
    ];
  }

  return null;
};
