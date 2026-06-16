const router = require('express').Router()
const { ok } = require('../utils/response')
const bannerModel = require('../models/banner')

router.get('/', async (req, res, next) => {
  try {
    const banners = await bannerModel.findActive()
    res.json(ok(banners))
  } catch (err) { next(err) }
})

module.exports = router
