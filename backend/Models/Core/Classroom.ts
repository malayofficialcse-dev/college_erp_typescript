import mongoose, { Schema } from "mongoose";
import type { IClassroom } from "../../Interfaces/Core/ClassrRoom.ts";

const classroomSchema = new Schema<IClassroom>(
  {
    roomNumber: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    floor: { type: Number },
    capacity: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

classroomSchema.index({ building: 1, roomNumber: 1 }, { unique: true });

export default mongoose.model<IClassroom>("Classroom", classroomSchema);
