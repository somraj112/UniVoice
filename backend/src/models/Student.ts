import { User, IUser } from "./User";

export interface IStudent extends IUser {
  rollNumber: string;
  course: string;
}

export class Student extends User implements IStudent {
  rollNumber: string;
  course: string;

  constructor(data: Omit<IStudent, "userId" | "createdAt" | "role"> & { userId?: string; createdAt?: Date }) {
    super({ ...data, role: "student" });
    this.rollNumber = data.rollNumber;
    this.course = data.course;
  }

  toSafeJSON() {
    return {
      ...super.toSafeJSON(),
      rollNumber: this.rollNumber,
      course: this.course,
    };
  }
}