const express = require('express');
const router = express.Router();
const { getLeads, getLead, createLead, updateLead, deleteLead, addNote, getStats } = require('../controllers/leadController');
const { auth, managerOrAdmin } = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/', auth, getLeads);
router.get('/:id', auth, getLead);
router.post('/', auth, createLead);
router.put('/:id', auth, updateLead);
router.delete('/:id', auth, managerOrAdmin, deleteLead);
router.post('/:id/notes', auth, addNote);

module.exports = router;
