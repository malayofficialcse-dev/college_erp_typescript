import Classroom from "../../Models/Core/Classroom.ts";

export const createClassroomService = async (data: {
  roomNumber: string;
  building: string;
  floor?: number;
  capacity: number;
  isActive?: boolean;
}) => {
  const existing = await Classroom.findOne({
    building: data.building,
    roomNumber: data.roomNumber,
  });
  if (existing) {
    throw new Error("Classroom already exists");
  }
  return Classroom.create(data);
};

export const getAllClassroomsService = async () => {
  return Classroom.find().sort({ building: 1, roomNumber: 1 });
};

export const getClassroomByIdService = async (id: string) => {
  const classroom = await Classroom.findById(id);
  if (!classroom) {
    throw new Error("Classroom not found");
  }
  return classroom;
};

export const updateClassroomService = async (
  id: string,
  data: Partial<{
    roomNumber: string;
    building: string;
    floor: number;
    capacity: number;
    isActive: boolean;
  }>
) => {
  const classroom = await Classroom.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!classroom) {
    throw new Error("Classroom not found");
  }
  return classroom;
};

export const deleteClassroomService = async (id: string) => {
  return Classroom.findByIdAndDelete(id);
};
