import bcrypt from "bcrypt";

export const createHash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const compareHash = async (
  reqPassword: string,
  userPassword: string,
) => {
  return await bcrypt.compare(reqPassword, userPassword);
};
