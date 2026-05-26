import mongoose, { Schema } from "mongoose";
import type { IUserPermission } from "../../Interfaces/Auth/UserPermission.ts";

const userPermissionSchema = new Schema<IUserPermission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
    },
    moduleName: { type: String, required: true, trim: true },
    canView: { type: Boolean, default: false },
    canCreate: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userPermissionSchema.index({ user: 1, moduleName: 1 }, { unique: true });

export default mongoose.model<IUserPermission>(
  "UserPermission",
  userPermissionSchema
);
