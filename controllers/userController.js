"use strict"
const nodemailer = require("nodemailer")
const { comparePass, createToken, scanDotaId } = require("../helpers/validators")
const { User } = require("../models")

class UserController {
  static async register(req, res, next) {
    try {
      const { username, email, password, dotaId } = req.body
      const input = { username, email, password, dotaId }
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "riezkynurfajri@gmail.com",
          pass: "gyknduiculjpdhtd",
        },
      })
      let mailOptions = {
        from: "whatoeat2022@gmail.com",
        to: email,
        subject: "Register Success",
        text: `Congratulations! You have successfully register on our Platform!`,
      }

      const legit = await scanDotaId(dotaId)
      if (!legit) throw new Error("dota")
      const create = await User.create(input)

      const execute = await transporter.sendMail(mailOptions)

      res.status(201).json({
        statusCode: 201,
        message: `Welcome aboard ${create.username}!`,
      })
    } catch (err) {
      next(err)
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body
      if (!email) throw new Error("email")
      if (!password) throw new Error("password")

      const foundUser = await User.findOne({ where: { email } })
      if (!foundUser) throw new Error("invalid")

      const correctPassword = comparePass(password, foundUser.password)
      if (!correctPassword) throw new Error("invalid")

      const payload = {
        id: foundUser.id,
        email: foundUser.email,
      }

      const accessToken = createToken(payload)
      res.status(200).json({
        statusCode: 200,
        message: "You're Logged in!",
        access_token: accessToken,
        username: foundUser.username,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = UserController
