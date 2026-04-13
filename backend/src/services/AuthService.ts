import jwt from "jsonwebtoken";
import {
  UserModel, StudentModel, FacultyModel, AdminModel,
  IUser, UserRole,
} from "../models/User";

const JWT_SECRET     = process.env.JWT_SECRET ?? "scms-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

interface RegisterDTO {
  name:         string;
  email:        string;
  password:     string;
  role:         UserRole;
  gender:       string;
  department:   string;
  yearOfStudy:  number;
  // Student
  rollNumber?:  string;
  course?:      string;
  // Faculty
  employeeId?:  string;
  designation?: string;
  // Admin
  adminLevel?:  "department" | "university";
}

export interface JWTPayload {
  userId: string;
  email:  string;
  role:   UserRole;
  name:   string;
}

export class AuthService {

  // REGISTER 

  async register(dto: RegisterDTO): Promise<{ user: IUser; token: string }> {
    // College email check
    if (!dto.email.includes("rishihood") && !dto.email.endsWith(".edu")) {
      throw new Error("Only college email addresses are allowed");
    }

    const exists = await UserModel.findOne({ email: dto.email });
    if (exists) throw new Error("An account with this email already exists");

    let user: IUser;

    if (dto.role === "student") {
      if (!dto.rollNumber || !dto.course) {
        throw new Error("rollNumber and course are required for students");
      }
      // Password is hashed by the pre-save hook in User.ts
      user = await StudentModel.create({
        name: dto.name, email: dto.email, password: dto.password,
        gender: dto.gender, department: dto.department, yearOfStudy: dto.yearOfStudy,
        rollNumber: dto.rollNumber, course: dto.course,
      });
    } else if (dto.role === "faculty") {
      if (!dto.employeeId || !dto.designation) {
        throw new Error("employeeId and designation are required for faculty");
      }
      user = await FacultyModel.create({
        name: dto.name, email: dto.email, password: dto.password,
        gender: dto.gender, department: dto.department, yearOfStudy: dto.yearOfStudy,
        employeeId: dto.employeeId, designation: dto.designation,
      });
    } else {
      user = await AdminModel.create({
        name: dto.name, email: dto.email, password: dto.password,
        gender: dto.gender, department: dto.department, yearOfStudy: dto.yearOfStudy,
        adminLevel: dto.adminLevel ?? "department",
      });
    }

    const token = this.signToken(user);
    return { user, token };
  }

  // LOGIN 

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    const match = await user.comparePassword(password);
    if (!match) throw new Error("Invalid email or password");

    const token = this.signToken(user);
    return { user, token };
  }

  // HELPERS 

  private signToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email:  user.email,
      role:   user.role,
      name:   user.name,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return UserModel.find().select("-password");
  }
}

export const authService = new AuthService();
