const {GoogleGenerativeAI}=require("@google/generative-ai");

// GeminiのAPIKEYを隠す
require('dotenv').config();
const apiKey = process.env.Gemini_API_KEY;
const genAI=new GoogleGenerativeAI(apiKey);


const express=require('express');
const path=require('path');
const bodyParser=require('body-parser');
const removeMd = require('remove-markdown');

const app=express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res, next){
  res.render('index', { 
    title: 'お守りアイちゃん',
    content_1: '詐欺についてのご相談をここに記入してください '
  });
});

app.post('/', async (req, res, next)=>{
  var msg=req.body['message'];

  // promptによるtuning
  const prompt_1="あなたは詐欺の防止法についての専門家です。どんな質問にも対応できます。";
  const prompt_2="以下の質問に回答願います。丁寧な言葉で具体的に回答してください。";
  const prompt_3="自分の身は自分で守れるように、自分自身でも色々考えるように促してください。";
  const prompt_4="質問でない場合には、質問をするように促してください。";
  const prompt_5="詐欺の相談以外の質問を厳密に判断して回答を拒否してください。";
  const prompt_6="法律や倫理に反する質問は回答を拒否してください。:  ";

  var msg_1=prompt_1+prompt_2+prompt_3+prompt_4+prompt_5+prompt_6+msg;

  const result=await run(msg_1);
  var data={
    title: '',
    content_1: result
  };
  res.render('index', data);
});

app.listen(3000);

async function run(prompt){

  // parameters
  const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
  };

  // safety settings
  const safe = {
    "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
    "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
    "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
  };


  const model=genAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
    safe,
  });
  const result=await model.generateContent(prompt);
  const response=result.response;
  return removeMd(response.text());
}


