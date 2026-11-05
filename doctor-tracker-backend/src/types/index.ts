import { Types } from 'mongoose';

export interface IAdminPayload {
  id: string;
  email: string;
  role: 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        role: 'admin';
      };
    }
  }
}

