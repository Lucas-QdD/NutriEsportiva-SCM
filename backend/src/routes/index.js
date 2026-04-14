const{ Router } = require('express');
const { listTeams } = require('../controllers/teamController');

const router = Router();

router.get('/', (req, res) => {
    return res.json({ 
        message: 'API do SweetApp up and running'
    });
});

router.get('/teams', listTeams);

module.exports = router;