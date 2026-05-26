import mongoose, { Schema } from "mongoose";
import type { ITimetable } from "../../Interfaces/Core/Timetable.ts";

const timetableSchema = new Schema<ITimetable>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom" },
    semester: { type: Schema.Types.ObjectId, ref: "Semester" },
    section: { type: Schema.Types.ObjectId, ref: "Section" },
    dayOfWeek: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      required: true,
    },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

timetableSchema.index(
  { course: 1, dayOfWeek: 1, startTime: 1, classroom: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model<ITimetable>("Timetable", timetableSchema);
