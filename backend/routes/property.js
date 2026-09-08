const express = require('express');
const router = express.Router();
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty, getStats } = require('../controllers/propertyController');
const { auth, managerOrAdmin } = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/', auth, getProperties);
router.get('/:id', auth, getProperty);
router.post('/', auth, createProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, managerOrAdmin, deleteProperty);

module.exports = router;
