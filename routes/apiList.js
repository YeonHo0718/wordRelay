const router = require('express').Router();

router.get('',function (req,res){
	res.send(`
	<p> <a href = '/api/word/startsWith'> /api/word/startsWith </a> </p>
	<p> <a href = '/api/word/endsWith'> /api/word/endsWith </a> </p>
	<p> <a href = '/api/word/doum'> /api/word/doum </a> </p>
	<p> <a href = '/api/word/divide'> /api/word/divide </a> </p>
	<p> <a href = '/api/word/concat'> /api/word/concat </a> </p>
	<p> <a href = '/api/word/exist'> /api/word/exist </a> </p>
	<p> <a href = '/api/word/advanced'> /api/word/advanced </a> </p>

	<p> 근데 누구세요...? </p>`)
});

module.exports = router;