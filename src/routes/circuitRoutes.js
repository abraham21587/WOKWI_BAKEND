const router = require('express').Router();
const ctrl = require('../controllers/circuitController');
const auth = require('../middleware/auth');

router.use(auth); // todas las rutas de circuitos requieren sesión

router.post('/save', ctrl.save);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;