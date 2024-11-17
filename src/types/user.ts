export interface User {
  _id?: string;
  email: string;
  name: string;
  username?: string;
  password?: string;
  authType: 'credentials' | 'google' | 'both';
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    defaultSequenceLength: number;
  };
}

export interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

export interface SignInCredentials {
  username: string;
  password: string;
}
