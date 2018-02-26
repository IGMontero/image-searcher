var express = require('express'),
    app = express(),
    config = require('./config.js'),
    mongoose = require('mongoose'),
    GoogleImages = require('google-images'),
    searchModel = require('./models/search-model');



//Set express.static paths
app.use(express.static(__dirname+"/public"));
app.use(express.static(__dirname+"/views"));


//Connect to database
var mongoURL = "mongodb://"+config.db.host+"/"+config.db.name;
mongoose.connect(mongoURL,function(err){
  if(err)
      throw err;
  console.log("Connected to database: "+config.db.name);
})


//Configure google-images (Custom Search Engine ID  / API Key)
var googleImages = new GoogleImages('011435736641086800949:ssqip8pphj8','AIzaSyDIqRsRooivMwK1MEFY0Upl4jLO7H42p2Q')


//Routes
app.get("/",function(req,res){
  res.render('index');
})


app.get("/api/imagesearch/:search",function(req,res){
  
  var search = req.params.search;
  var offset = req.query.offset;
  
  
  if(!offset)
    offset=1;
  
  googleImages.search(search,{page:offset}).then(function(images){
    
    if(images.length==0)
      return;
    
    var newSearch = new searchModel({
      term:search,
      when:new Date()
    })
    
    newSearch.save(function(err){
      if(err)
        throw err
      
    var responseObject = [];
    images.forEach((img)=>{
      var imgData = {
        url:img.url,
        snippet:img.description,
        thumbnail:img.thumbnail.url,
        context:img.parentPage
      }
      responseObject.push(imgData);
    })
    
    res.send(responseObject);
      
    })
        
  })
  
})

app.get("/api/latest",function(req,res){
  
  searchModel.find({}).sort({'when':-1}).limit(10).exec(function(err,data){
    if(err)
      throw err;
    if(!data)
      res.send({error:"No searches in database."})
    
    
    res.send(data)
  })
  
})

app.get("*",function(req,res){
  res.send({
    error:'Invalid request.'
  })
})

app.listen(process.env.PORT,function(){
  console.log("Server started. Listening to port: "+process.env.PORT);
})
