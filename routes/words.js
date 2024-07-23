const router = require('express').Router();
const wordDB = require('../DB/wordDB.json');
const words = require('../DB/words.json');
const phonetic = require('../DB/phonetic.json');
const phonetics = Object.keys(phonetic);
const cjj = require('../DB/cjj.js');
const fs = require('fs');
const axios = require('axios');
const dir = __dirname.replace('/routes','').replace('\\routes','');

/*
let test = phonetics.map(e=>phonetic[e]);
for(var i=0;i<test.length;i++){
    let now = (test[i].slice(-1));
    if(!fs.existsSync("../test/DB/individual/"+now+".json")){
        let result = words.filter(e=>e.startsWith(now));
        fs.writeFile("../test/DB/individual/"+now+".json",JSON.stringify(result),err=>{});
    }tarts
}*/

/*
ch = (now) =>{
    let sp = cjj.seperate(now.slice(-1));
    if(sp[0]=='ㄹ'||sp[0]=='ㄴ'){
        sp[0] = 'ㅇ';
        return cjj.concat(sp);
    }else{
        return now;
    }
}

for(var i=0;i<words.length;i++){
    let now = ch(words[i].slice(-1));
    if(!fs.existsSync("../test/DB/individual/"+now+".json")){
        let result = words.filter(e=>e.startsWith(now));
        fs.writeFile("../test/DB/individual/"+now+".json",JSON.stringify(result),err=>{});
    }
}
*/

/* 던져 던져 replaceFromArray = (arr,bans,fnc) => {
    for(var i=0;i<bans.length;i++){
        let index = arr.indexOf(bans[i]);
        if(index != -1){
            if(typeof fnc=='undefined'){
                arr.splice(index,1);
            }else if(typeof fnc == 'function'){
                fnc(bans[i])
            }
        }
    }
}*/

getWords = (word,banss) => {
    if(!fs.existsSync(dir+'/DB/individual/'+word.slice(-1)+'.json')){
        return [];
    }else{
        const alll = require('../DB/individual/'+word.slice(-1)+'.json');
        if((typeof banss) != 'object'||alll.length==0){
            return alll;
        }else{
            return alll.filter(s=>!banss.includes(s));
        }
    }
}

getMeaning = (word) =>{
    let meanings = wordDB[word]
    if(meanings){
        return meanings
    }
    return []
}

//console.log(getWords('역',undefined))

router.get('/advanced', (req, res) => {
// console.log(dir)
    const result = {
        status: false,
        data: {}
    };
    const word = req.query.word;
    const doum = req.query.doum;
    const bans = req.query.bans != undefined? req.query.bans.replace(/ /g,'').split(',') : undefined;

    if(word == undefined) {
        res.json({
            ...result,
            e: "인자 word가 빠졌습니다!"
        });
    } else {

        const lastWord = word.slice(-1);

        if(fs.existsSync(dir+'/DB/individual/'+lastWord+'.json')) {

            let all = getWords(lastWord, bans);
            let more;

            if(doum == undefined || doum == "") {
                if(!phonetics.includes(lastWord)) {
                    more = [];
                } else {
                    more = getWords(phonetic[lastWord], bans);
                }
            } else {
                const sp = cjj.separate(lastWord);
                if(doum.includes(sp[0])) {
                    sp[0] = 'ㅇ';
                    more = getWords(cjj.concat(sp), bans);
                } else {
                    more = [];
                }
            }

            all = all.concat(more);

            result.data = {
                ...result.data,
                wordList: [],
                words: []
            };

            for(let i = 0; i<all.length; i++) {
                const re = { word: all[i] };
                const now = re.word;
                const now_slice = now.slice(-1);

                if(doum == undefined || doum == "") {
                    if(!phonetics.includes(now_slice)) {
                        re.reacts = getWords(now_slice, bans).length;
                    } else {
                        re.reacts = getWords(now_slice, bans).length;
                        re.reacts += getWords(phonetic[now_slice], bans).length;
                    }
                } else {
                    const sp = cjj.separate(now_slice);
                    if(doum.includes(sp[0])) {
                        sp[0] = 'ㅇ';
                        re.reacts = getWords(cjj.concat(sp), bans).length;
                        re.reacts += getWords(now_slice, bans).length;
                    } else {
                        re.reacts = getWords(now_slice, bans).length;
                    }
                }
                
                result.data.words.push(re);
            }

            result.data.words.sort((a, b) => a.reacts - b.reacts);
            result.data = {
                ...result.data,
                count: result.data.words.length,
                wordList: result.data.words.map(e => e.word)
            };
            result.status = true;
            res.json(result);            
        } else {
            res.json({
                ...result,
                e: word + "로 시작하는 단어를 찾을 수 없습니다!"
            });
        }
    }
});

router.get('/moreVanced',async function(req,res){
    const result = {
        status: false,
        data: {}
    };
    let startTime = new Date().getTime()
    const word = req.query.word;
    const doum = req.query.doum;
    const bans = req.query.bans != undefined? req.query.bans.replace(/ /g,'').split(',') : undefined;
    if(word == undefined) {
        res.json({
            ...result,
            e: "인자 word가 빠졌습니다!"
        });
        return;
    } 
    const e = await axios.get(`http://localhost:8001/api/word/advanced?word=${word}`)
    const data = e.data
    let words = data.data.words
    for(let i of words){
        let arr_ = getWords(i.word.slice(-1),bans)
        let arr = arr_.map(a=>{
            const now_slice = a.slice(-1)
            if(phonetics.includes(now_slice)){
                return getWords(phonetic[now_slice],bans).length + getWords(now_slice,bans).length
            }
            return getWords(now_slice,bans).length
        })
        if(phonetics.includes(i.word.slice(-1))){
            let arr2_ = getWords(phonetic[i.word.slice(-1)],bans)
            let arr2 = arr2_.map(a=>{
                const now_slice = a.slice(-1)
                if(phonetics.includes(now_slice)){
                    return getWords(phonetic[now_slice],bans).length + getWords(now_slice,bans).length
                }
                return getWords(now_slice,bans).length
            })
            arr = arr.concat(arr2)
            arr_ = arr_.concat(arr2_)
        }
        const count = arr.concat([]).sort((a,b)=>a-b)[0]
        const point = (count==undefined?10000:(count/i.reacts))
        if(count != undefined){
            i.strongWord = arr_[arr.indexOf(count)]
        }
        i.point = point
    }
    data.data.words = data.data.words.sort((a,b)=>b.point-a.point)
    data.data.wordList = (data.data.words).map(a=>a.word)
    res.json(data)
    console.log(word+" / "+(new Date().getTime()-startTime)+"ms")
})

router.get('/startsWith',function(req,res){
    let word = req.query.word;
    let bans = req.query.bans;
    if(bans != undefined){
        bans = bans.replace(/ /g,'').split(',');
    }else{
        bans = [];
    }
	let result = {status:false,data:{}};
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        if(phonetics.includes(word.slice(-1))) {
            result.data.words = words.filter(e=>(e.startsWith(word)||e.startsWith(phonetic[word.slice(-1)]))&&bans.indexOf(e)==-1);   
        }else{
            result.data.words = words.filter(e=>e.startsWith(word)&&bans.indexOf(e)==-1);   
        }
        result.data.count = result.data.words.length;
        result.status = true;
        res.json(result);
    }
});

router.get('/endsWith',function(req,res){
    let word = req.query.word;
	let result = {status:false,data:{}};
    let bans = req.query.bans;
    if(bans != undefined){
        bans = bans.replace(/ /g,'').split(',');
    }else{
        bans = [];
    }
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        result.data.words = words.filter(e=>e.endsWith(word)&&bans.indexOf(bans)==-1);
        result.data.count = result.data.words.length;
        result.status = true;
        res.json(result);
    }
});

router.get('/divide',function(req,res){
    let word = req.query.word;
	let result = {status:false,data:{}};
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        try{
            result.data.result = cjj.sfs(word);
            result.status = true;
            res.json(result);
        }catch(e){
            result.e = "한글만 써라. 새꺄."
        }
    }
});

router.get('/concat',function(req,res){
    let word = req.query.word;
	let result = {status:false,data:{}};
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        try{
            result.data.result = cjj.cfs(word);
            result.status = true;
            res.json(result);
        }catch(e){
            result.e = e;
            res.json(e);
        }
    }
});

router.get('/doum',function(req,res){
    let word = req.query.word;
	let result = {status:false,data:{}};
    let doum = req.query.doum;
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        word = word.slice(-1);
        if(doum==undefined||doum==''){
            if(phonetics.indexOf(word)!=-1){
                result.data.result = phonetic[word];
            }else{
                result.data.result = word;
            }
            result.status = true;
            res.json(result);
        }else{
            try{
                let sep = cjj.separate(word);
                if(doum.indexOf(sep[0])==-1){
                    result.data.result = word;
                }else{
                    sep[0]= "ㅇ";
                    result.data.result = cjj.concat(sep);
                }
                result.status = true;
                res.json(result);
            }catch(e){
                result.e = "한글만 써라. 새꺄."
                res.json(result);
            }   
        }
    }
});

router.get('/exist',function(req,res){
    let word = req.query.word;
    if(word==undefined){
        result = "인자 word가 빠졌습니다!";
        res.send(result);
    }else{
        if(words.indexOf(word)==-1){
            res.send('false');
        }else{
            res.send('true');
        }
    }
})

router.get('/meaning',function(req,res){
    let word = req.query.word;
	let result = {status:false,data:{}};
    if(word==undefined){
        result.e = "인자 word가 빠졌습니다!";
        res.json(result);
    }else{
        try{
            result.data.result = getMeaning(word);
            result.status = true;
            res.json(result);
        }catch(e){
            result.e = e;
            res.json(e);
        }
    }
});


module.exports = router;