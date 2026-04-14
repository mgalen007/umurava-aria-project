import { Router } from 'express'
import { SessionsController } from './sessions.controller'
import { validate } from '../../middleware/validate'
import { auth } from '../../middleware/auth'
import { createSessionDto, feedbackDto } from './sessions.dto'

const router = Router()
const controller = new SessionsController()

router.use(auth)

router.post('/', validate(createSessionDto), controller.create)
router.get('/', controller.findAll)
router.get('/:id', controller.findOne)
router.post('/:id/run', controller.run)
router.post('/:id/feedback', validate(feedbackDto), controller.submitFeedback)

export default router