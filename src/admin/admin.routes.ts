import AdminBro from 'admin-bro';
import AdminBroExpress from 'admin-bro-expressjs'
import AdminBroMongoose from 'admin-bro-mongoose'
import { AdminUserModel } from './admin.model';
import { Router } from 'express';
import bcrypt from 'bcrypt'

export const registerAdminPanel = (DB_connection: unknown) => {
  const adminParent = {
    name: 'Admin Users',
    icon: 'Settings'
  }
  AdminBro.registerAdapter(AdminBroMongoose)
  const adminBro = new AdminBro({
    databases: [DB_connection],
    rootPath: '/admin',  
    resources: [
      {resource: AdminUserModel, options: { parent: adminParent }}
    ]
  })

  const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (email: string, password: string) => {
      const adminUser = await AdminUserModel.findOne({ email })      
      const isValid = adminUser && await bcrypt.compare(password, adminUser.get("password", null, { getters: false }))
      if(isValid) return adminUser;
      return null
    },
    cookiePassword: process.env.COOKIE_SECRET as string,
  }, null, {
    resave: true,
    saveUninitialized: true
  }) as Router

  return { router, url: adminBro.options.rootPath }
}