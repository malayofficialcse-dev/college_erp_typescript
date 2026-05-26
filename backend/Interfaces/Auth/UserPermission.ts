import { Document, Types } from "mongoose";

export interface IUserPermission extends Document {
  user: Types.ObjectId;
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
