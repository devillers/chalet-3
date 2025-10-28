export interface AdapterUser {
  [key: string]: any;
}

export interface AdapterAccount {
  [key: string]: any;
}

export interface AdapterSession {
  [key: string]: any;
}

export type Adapter = {
  createUser?: (...args: any[]) => Promise<AdapterUser>;
  getUser?: (...args: any[]) => Promise<AdapterUser | null>;
  getUserByEmail?: (...args: any[]) => Promise<AdapterUser | null>;
  getUserByAccount?: (...args: any[]) => Promise<AdapterUser | null>;
  updateUser?: (...args: any[]) => Promise<AdapterUser>;
  deleteUser?: (...args: any[]) => Promise<void>;
  linkAccount?: (...args: any[]) => Promise<AdapterAccount | null>;
  unlinkAccount?: (...args: any[]) => Promise<void>;
  createSession?: (...args: any[]) => Promise<AdapterSession>;
  getSessionAndUser?: (...args: any[]) => Promise<{ session: AdapterSession; user: AdapterUser } | null>;
  updateSession?: (...args: any[]) => Promise<AdapterSession | null>;
  deleteSession?: (...args: any[]) => Promise<void>;
  [key: string]: any;
};
