var express = require("express");
var app = express();
const PORT = 8001

/*****************************************************************/
/*****************************************************************/

//API 목록
//인자: 
var apiList = require("./routes/apiList.js");
app.use('/api',apiList);

//~로 시작하는 단어
//인자: word bans doum
var startsWith = require("./routes/words.js");
app.use('/api/word',startsWith);

/*****************************************************************/
/*****************************************************************/

app.get('/ev',function(req,res){
	try{
		const r = eval(decodeURIComponent(req.query.str));
		res.send(JSON.stringify(r,null,4));
	}catch(e){
		res.json(e);
	}
})

app.get('/', function (req, res) {
	res.sendFile(__dirname+'/routes/endWordGame.html');
});

app.listen(PORT, function() {
	console.log('Express server has started on port '+PORT);
});