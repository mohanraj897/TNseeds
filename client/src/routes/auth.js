const express = require('express')
const jwt = require('jsonwebtoken')

const {
  OAuth2Client
} = require('google-auth-library')

const router =
  express.Router()

const client =
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
  )

router.post(
  '/google',
  async (req, res) => {
    try {
      const { credential } =
        req.body

      const ticket =
        await client.verifyIdToken({
          idToken: credential,
          audience:
            process.env
              .GOOGLE_CLIENT_ID
        })

      const payload =
        ticket.getPayload()

      const user = {
        name: payload.name,
        email: payload.email,
        picture:
          payload.picture
      }

      const token = jwt.sign(
        user,
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      )

      res.json({
        success: true,
        token,
        user
      })
    } catch (error) {
      res.status(401).json({
        message:
          'Google Authentication Failed'
      })
    }
  }
)

module.exports = router