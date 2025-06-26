export interface User {
  _id?: string;
  email: string;
  password?: string;
  role?: string;
  store?: string;
  firstName?: string;
  lastName?: string;
}

export interface Token {
  token: string;
}
