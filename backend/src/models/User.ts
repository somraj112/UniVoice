import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "student" | "faculty" | "admin";

// Base Interface 
export interface IUser extends Document {
  name:         string;
  email:        string;
  password:     string;
  role:         UserRole;
  gender:       string;
  department:   string;
  yearOfStudy:  number;
  createdAt:    Date;
  comparePassword(candidate: string): Promise<boolean>;
  toSafeJSON(): object;
}

// Base Schema 
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    yearOfStudy: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "role", // Student/Faculty/Admin stored in same collection
  }
);

// Hash password before every save 
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance methods 
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes 
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Base Model 
export const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

// Student discriminator 
export interface IStudent extends IUser {
  rollNumber: string;
  course:     string;
}

export const StudentModel = UserModel.discriminator<IStudent>(
  "student",
  new Schema({ rollNumber: String, course: String })
);

// Faculty discriminator 
export interface IFaculty extends IUser {
  employeeId:  string;
  designation: string;
}

export const FacultyModel = UserModel.discriminator<IFaculty>(
  "faculty",
  new Schema({ employeeId: String, designation: String })
);

// Admin discriminator 
export interface IAdmin extends IUser {
  adminLevel: "department" | "university";
}

export const AdminModel = UserModel.discriminator<IAdmin>(
  "admin",
  new Schema({ adminLevel: { type: String, default: "department" } })
);
