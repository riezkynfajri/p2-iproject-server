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
          user: process.env.EMAIL,
          pass: process.env.MAIL_PASSWORD,
        },
      })
      let mailOptions = {
        from: "whatoeat2022@gmail.com",
        to: email,
        subject: "Welcome Aboard!",
        text: `Now Let's Go Mid or Feed!
        <img src="https://tenor.com/view/terrorblade-dota2-gif-20585292" alt="This is an animated gif image, but it does not move"/>`,
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
