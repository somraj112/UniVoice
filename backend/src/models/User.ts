export type UserRole = "student" | "faculty" | "admin";

export interface IUser {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  gender: string;
  department: string;
  yearOfStudy: number;
  createdAt: Date;
}

export class User implements IUser {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  gender: string;
  department: string;
  yearOfStudy: number;
  createdAt: Date;

  constructor(data: Omit<IUser, "userId" | "createdAt"> & { userId?: string; createdAt?: Date }) {
    this.userId = data.userId ?? crypto.randomUUID();
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.gender = data.gender;
    this.department = data.department;
    this.yearOfStudy = data.yearOfStudy;
    this.createdAt = data.createdAt ?? new Date();
  }

  // Never expose password in responses
  toSafeJSON(): Omit<IUser, "password"> {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
      role: this.role,
      gender: this.gender,
      department: this.department,
      yearOfStudy: this.yearOfStudy,
      createdAt: this.createdAt,
    };
  }
}