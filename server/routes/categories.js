const router = require('express').Router()
const { ok } = require('../utils/response')
const categoryModel = require('../models/category')

router.get('/', async (req, res, next) => {
  try {
    const tree = await categoryModel.getTree()
    res.json(ok(tree))
  } catch (err) { next(err) }
})

module.exports = router
