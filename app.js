const express = require("express");
const ejs = require("ejs");
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const { createCanvas, loadImage } = require('canvas');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
require('dotenv').config();
const bodyparser =require("body-parser")
const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(upload.single('image'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const modelPath = path.join(__dirname, 'model.json');
const weightsPath = path.join(__dirname, 'weight.bin');
//fetch
async function loadTeachableMachineModel() {
  const modelURL = 'https://teachablemachine.withgoogle.com/models/arSFIoWea/model.json';
  const model = await tf.loadLayersModel(modelURL);
  return model;
}
//first 
//process
function processPredictions(predictions) {
  console.log(predictions);
  let processedPredictions = [];

  for (let i = 0; i < predictions.length; i++) {
    let s = predictions[i].toString();
    let slices = s.slice(0, 4)
    let value = parseFloat(slices);
    //console.log(value)
    let wholePart = Math.trunc(value);
    //console.log(wholePart);

    if (value > 1) {
      let a = value-wholePart
      a=a.toFixed(2);
      const b = parseFloat(a);

      processedPredictions.push(b);
    } else if (value === 1) {
      processedPredictions.push(value);
    } else if(wholePart === 0) {
      processedPredictions.push(value);
    }
  }
  const maxIndex = processedPredictions.indexOf(Math.max(...processedPredictions));
  console.log(maxIndex);
  switch (maxIndex) {
    case 0:
      return 'Metal'
      break;
    case 1:
      return 'Glass'
      break;
    case 2:
      return 'E-waste'
      break;
    case 3:
      return 'Paper'
      break;
    case 4:
      return "Plastic"
      break;
    default:
      console.log('Invalid item');
      break;
  } 
  
}



//image classification code

async function classifyImage(imagePath) {
  // Load and process the image
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const img = tf.browser.fromPixels(canvas);
  const resizedImg = tf.image.resizeBilinear(img, [224, 224]).toFloat();
  const normalizedImg = resizedImg.div(255).expandDims();
  img.dispose();
  resizedImg.dispose();

  // Load the Teachable Machine model
  const model = await loadTeachableMachineModel();

  // Perform image classification with the model
  const predictions = await model.predict(normalizedImg).data();

normalizedImg.dispose();
model.dispose();
//console.log(predictions);

const processedPredictions = processPredictions(predictions);
//console.log(processedPredictions);

return processedPredictions;
}


//database connection string 
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//gerate userid
const generatedUserIds = new Set(); 

function generateUserId() {
  const min = 1000; 
  const max = 9999; 

  while (true) {
    const userId = Math.floor(Math.random() * (max - min + 1) + min).toString();
    if (!generatedUserIds.has(userId)) {
      generatedUserIds.add(userId);
      return userId;
    }
  }
}

//mongodb schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    
  },
  password: {
    type: String,
    required: true,
   
  },
  phoneNumber: {
    type: String,
    
  },
  address: {
    address: {
      type: String,
      
    },
    pincode: {
      type: String,
      
    },
    city: {
      type: String,
      
    },
    state: {
      type: String,
      
    },
    country: {
      type: String,
      
    },
  },
});
const User = mongoose.model('User', userSchema);

const pickupSchema = new mongoose.Schema({
  userId: String,
  typeOfWaste: String,
  addressType: String,
  dateOfPickup: String
});

const Pickup = new mongoose.model("Pickup",pickupSchema);

//home route


//signup post route
app.post("/signup",(req,res)=>{
    console.log(req.body.name);
    const userId = generateUserId();

    //creating new user
    const newUser = new User({
        userId: userId,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phno,
        address:{
            address:req.body.address,
            pincode:req.body.pin,
            city:req.body.city,
            state:req.body.state,
            country:req.body.country
        }
      });

      newUser.save()
        .then(user => {
        console.log('User saved successfully:', user);
        res.cookie(`userid`,user.userId);
        res.render("home",{id:user.userId,name:user.name,email:user.email,phno:user.phoneNumber,address:user.address.address,pincode:user.address.pincode,city:user.address.city,state:user.address.state,country:user.address.country});
       
        } )
    .catch(error => {
        console.error('Error saving user:', error);
        res.render("index",{err:"User signup failed! Please try again"});
    });
     
})
//sign in post route
app.post("/signin",(req,res)=>{
    let email = req.body.email
    User.findOne({ email })
  .then(user => {
    if (user) {
      if(user.password === req.body.password){
        res.cookie(`userid`,user.userId);
        res.render("home",{id:user.userId,name:user.name,email:user.email,phno:user.phoneNumber,address:user.address.address,pincode:user.address.pincode,city:user.address.city,state:user.address.state,country:user.address.country});
      }else{
        res.render("index",{err:"username or password is incorrect! Please try again"});
      }
    } else {
        res.render("index",{err:"username or password is incorrect! Please try again"});
    }
  })
  .catch(error => {
    res.render("index",{err:"username or password is incorrect! Please try again"});
  });
})




//login
app.get("/",(req,res)=>{
    res.render("index",{err:""});
})

//post for image uploading route
app.post('/process-image', async (req, res) => {
  console.log(req.body);
  const file = req.file;

  // Save the image file locally
  const imagePath = path.join(__dirname, 'uploads', file.originalname);

  // const imagePath = `./uploads/${file.originalname}`;
  fs.rename(file.path, imagePath, async (error) => {
    if (error) {
      console.error('Error saving image:', error);
      return res.status(500).json({ error: 'Failed to save image' });
    }

    // Perform image classification using your model
    try {
      const predictions = await classifyImage(imagePath);
      fs.unlinkSync(imagePath); // Remove the image file after processing

      // Process the classification results and send the response
      console.log(predictions);
      let myCookie = req.cookies.userid;
      
    
      const newPickup = new Pickup({
        userId: myCookie,
        typeOfWaste: predictions,
        addressType: req.body.addresstype,
        dateOfPickup: req.body.date
        
      });
    

      newPickup.save()
        .then(res.redirect('/r/#ScheduleSuccess'))
    .catch(error => {
        console.error('Error saving user:', error);
        res.send("failed");
    });
    } catch (error) {
      console.error('Error classifying image:', error);
      res.status(500).json({ error: 'Failed to classify image' });
    }
  });
});
app.get("/r",function(req,res){
  res.render("success");
})



//listen route
app.listen(process.env.PORT||"3000", ()=>{
    console.log("Server spin up in port 3000");
})