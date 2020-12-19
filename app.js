//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const homeStartingContent = "EDUCATION IS WHAT REMAINS AFTER ONE HAS FORGOTTEN EVERYTHING HE LEARNED IN SCHOOL. -- BY ALBERT EINSTEIN";
const aboutContent = "Education Qualification";
const contactContent = "Contact";
const flash=require("connect-flash");
const app = express();

app.set('view engine', 'ejs');

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(flash());
mongoose.connect("mongodb+srv://Tushar:Kanha933@cluster0.nntx1.mongodb.net/blogDBs", {useNewUrlParser: true});


app.use(require("express-session")({
	secret:"Anything",
	resave:false,
	saveUninitialized:false
}));

app.use(function(req,res,next){
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("sucess");
	next();
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/posts/:id/update",function(req,res){
  Post.findById(req.params.id,req.body.post,function(err,foundpost){
    if(err){
      console.log(err);
    }else{
      res.render("update",{post : foundpost});
    }
  })
})

app.put("/posts/:id",function(req,res){
  Post.findByIdAndUpdate(req.params.id,req.body.post,function(err,updatedpost){
    if(err){
      req.flash("error","Something went wrong");
      req.flash("message","success!");
      res.redirect("back");
    }else{
      res.redirect("/posts/" + req.params.id);
    }
  })
});
app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

    if(!req.body.postTitle && !req.body.postBody){
      req.flash("error","Please write something");
      res.redirect("back");
    }else{
      const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });
      post.save(function(err){
      if (!err){
        res.redirect("/");
      }
    });
  }
});

app.delete("/posts/:id",function(req,res){
  console.log(req.params.id);
  Post.findByIdAndDelete(req.params.id,function(err){
    if(err){
      req.flash("error","Can't find post");
      res.redirect("back");
    }else{
      res.redirect("/");
    }
  })
})

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, foundpost){
    if(err){
      req.flash("error","Can't find post");
    }else{
      res.render("post", {
      post:foundpost
    });
    }

  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has started successfully");
});
