const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { auth } = require('../middleware/auth')
const { ok } = require('../utils/response')

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext
    cb(null, name)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 jpg/png/gif/webp 格式'))
    }
  }
})

router.use(auth)

router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json(require('../utils/response').fail('请选择文件'))
    const url = `/uploads/${req.file.filename}`
    res.json(ok({ url, filename: req.file.filename }, '上传成功'))
  } catch (err) { next(err) }
})

module.exports = router
