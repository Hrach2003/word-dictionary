import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcrypt'

interface IAdminUser extends Document {
  email: string
  password: string
}

const adminUser = new Schema<IAdminUser>({
  email: {
    required: true,
    type: String,
    unique: true
  },
  password: {
    required: true,
    type: String,
    set: (password: string) => {
      return bcrypt.hashSync(password, 12)
    },
    get: () => undefined
  }
}, { toJSON: { getters: true } })

const AdminUserModel = model<IAdminUser>("AdminUser", adminUser)
export { AdminUserModel }