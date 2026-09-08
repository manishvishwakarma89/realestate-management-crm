const express = require('express');
const router = express.Router();
const { getContacts, getContact, createContact, updateContact, deleteContact } = require('../controllers/contactController');
const { auth, managerOrAdmin } = require('../middleware/auth');

router.get('/', auth, getContacts);
router.get('/:id', auth, getContact);
router.post('/', auth, createContact);
router.put('/:id', auth, updateContact);
router.delete('/:id', auth, managerOrAdmin, deleteContact);

module.exports = router;
