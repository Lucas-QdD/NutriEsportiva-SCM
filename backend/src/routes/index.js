const{ Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    return res.json({ 
        message: 'API do SweetApp up and running'
    });
});

module.exports = router;