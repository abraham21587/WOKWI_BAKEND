const router = require('express').Router();
const ctrl = require('../controllers/circuitController');

router.post('/save', ctrl.save);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);

module.exports = router;