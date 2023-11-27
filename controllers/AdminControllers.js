/*==================================================================================================================

    This is an admin controllers file.
=====================================================================================================================
*/
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ObjectId = require('mongodb').ObjectId;

const Admin = require('../models/Admin')
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Host = require('../models/Host');
const UserKey = require('../models/UserKey')
const Accommodation = require('../models/Accommodation');
const Chat = require('../models/Chat');
const ProfileImage = require('../models/ProfileImage');
const FrontIdImage = require('../models/FrontIdImage')
const BackIdImage = require('../models/BackIdImage');
const AccommodationGallery = require('../models/AccommodationGallery');
const RoomImage = require('../models/RoomImage');
const AdditionalAccommodationImages = require('../models/AdditionalAccommodationImages');
const AccommodationRules = require('../models/AccommodationRulesImage')
const { setSecretKey, getSecretKey, setEncryptionKey, getEncryptionKey } = require('./adminKey')
const { encryptSecretKey, decryptSecretKey } = require('./cryptography')




//login end point for Admin





const administrativeLogin = async (req, res) => {
  try {
    console.log(req.body)
    const { userName, password } = req.body
    const admin = await Admin.findOne({ userName: userName }).select('+password');
    if (admin) {
      const validatedPassword = await bcrypt.compare(password, admin.password)
        .then(async (validatedPassword) => {
          if (validatedPassword) {
            console.log("admin login", validatedPassword);
            const secretKey = crypto.randomBytes(64).toString('hex');
            const token = jwt.sign({ id: admin._id }, secretKey);
            setSecretKey(secretKey);
            const encryptionKey = crypto.randomBytes(32);
            const secureToken = encryptSecretKey(token, encryptionKey) //reusing the code for encrypting user secretKey to encrypt the web token 
            setEncryptionKey(encryptionKey);
            //console.log(secureToken)
            const adminID = admin._id;
            res.status(200).json({ Message: 'Welcome Admin', secureToken, adminID });
          }
          else {
            console.log("admin cannot login", validatedPassword)
            return res.status(401).json({ error: "invalid password" });
          }
        })
    }
    else {
      return res.status(401).json({ error: "Not Admin!" });
    }
  } catch (error) {
    console.log('Bad Request')
    return res.status(400)
  }
}



//fetch all the data into the admin landing page




//Middleware for the admin authentication




const adminAuthControl = async (req, res) => {

  try {
    // console.log(req.headers)
    // console.log(req.query);
    authenticate(req.headers.authorization)
  } catch (error) {
    console.log(error)
    return res.status(400)
  }


  function authenticate(header) {
    try {
      if (!header) {
        return res.status(401).json({ error: 'UnAuthorize' })
      }
      // console.log(header);
      const secured_token = extract_Token(header)
      // console.log(secured_token)
      // console.log(getEncryptionKey());
      const token = decryptSecretKey(secured_token, getEncryptionKey());
      console.log(token);
      try {
        const decodedToken = jwt.verify(token, getSecretKey());
        console.log(decodedToken);
        if (decodedToken) {
          console.log(true)
          return res.status(200).json({ auth: true })
        } else {
          console.log('UnAuthorize', false)
          return res.status(401).json({ error: 'UnAuthorize' });
        }
        // Access the decoded token properties as needed
      } catch (error) {
        console.error('Error decoding access token:', error);
        return res.status(401).json({ error: 'UnAuthorize' })
      }
    } catch (error) {
      console.log('ERROR during deciphering', error)
      return res.status(401).json({ error: 'UnAuthorize' })
    }

  }


  function extract_Token(authorizationHeader) {
    try {
      let accessToken;
      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        accessToken = authorizationHeader.slice(7); // Remove "Bearer " prefix
      }
      return accessToken;
    } catch (error) {
      console.log(error)
    }

  }
}



const createNewAdmin = async (req, res) => {
  try {
    // console.log(req.body)
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({
      userName: req.body.userName,
      password: hashedPassword,
    })
    await admin.save()
    return res.status(200).json({ message: 'success' })
  } catch (error) {
    console.log(error)
  }
}


const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      return res.status(200).json(users);
    }
  } catch (error) {
    console.log(error)
  }
}



const getHost = async (req, res) => {
  try {
    const hosts = await Host.find();
    if (hosts) {
      // console.log(hosts)
      const allHosts = [];
      for (const host of hosts) {
        const user = await User.findById(host.user);
        // console.log(user)
        const data = {
          id: host._id,
          firstName: user.FirstName,
          lastName: user.LastName,
          allAccommodations: host.accommodations
        }
        allHosts.push(data);
      }
      // console.log(allHosts);
      return res.status(200).json(allHosts);
    }
  } catch (error) {
    console.log(error)
  }
}


const getOwner = async (req, res) => {
  try {

  } catch (error) {
    console.log(error)
  }
}


const getOneHost = async(req, res)=>{
  try {
    // console.log(req.params)
    const host = await Host.findById(req.params.id)
    if(host){
      return res.status(200).json(host);
    }
  } catch (error) {
    console.log(error)
  }
}



const getAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    const allAccommdations = [];
    let data = null;
    for (const accommodation of accommodations) {
      // console.log(accommodation)
      const host = await Host.findById(accommodation.owner)
      if (host) {
        const user = await User.findById(host.user);
        if (user) {
          // console.log(user)
          data = {
            firstName: user.FirstName,
            lastName: user.LastName,
            Title: accommodation.Title,
            Ratings: accommodation.Ratings,
            Validated: accommodation.validated,
            _id: accommodation._id,
            createdAt:accommodation.createdAt,
          }
        }
        allAccommdations.push(data);
      }
    }
    return res.status(200).json(allAccommdations);
  } catch (error) {
    console.log(error)
  }
}


const searchUser = async (req, res) => {
  try {
    // console.log(req.query.searchQuery)
    const users = await User.find({ LastName: req.query.searchQuery })
    if (users) {
      return res.status(200).json(users);
    }
  } catch (error) {
    console.log(error)
  }
}

const searchAccommodation = async (req, res) => {
  try {
    // console.log(req.query)
    const accommodations = await Accommodation.find({ Title: req.query.searchQuery })
    if (accommodations) {
      const allAccommdations = [];
      for (const accommodation of accommodations) {
        // console.log(accommodation)
        const host = await Host.findById(accommodation.owner)
        if (host) {
          const user = await User.findById(host.user);
          if (user) {
            // console.log(user)
            const data = {
              firstName: user.FirstName,
              lastName: user.LastName,
              Title: accommodation.Title,
              Ratings: accommodation.Ratings,
              Validated: accommodation.validated,
              _id: accommodation._id,
              createdAt:accommodation.createdAt,
            }
            allAccommdations.push(data);
          }
        }
      }
      return res.status(200).json(allAccommdations);
    }
  } catch (error) {
    console.log(error)
  }
}




const deleteAccommodation = async(req, res) =>{
  try {
    // console.log(req.params);
    const accommodation = await Accommodation.findById(req.params.id);
    if(accommodation){
      for(const imageId of accommodation.Gallery){
        const galleryImage = await AccommodationGallery.findById(new ObjectId(imageId));
        if(galleryImage){
          galleryImage.deleteOne();
        }
      }

      for (const imageId of accommodation.houseRulesImage){
        const rulesImages = await AccommodationRules.findByIdAndDelete(imageId)
        if(rulesImages){
          rulesImages.deleteOne();
        }
      }

      for(const room of accommodation.allRooms){
        for(const imageId of room.images){
          const roomImage = await RoomImage.findByIdAndDelete(imageId)
          if(roomImage){
            roomImage.deleteOne();
          }
        }
      }

      async function deleteAdditionalImages(id){
          if(id){
            const imageData = await AdditionalAccommodationImages.findByIdAndDelete(new ObjectId(id))
            if(imageData){
              imageData.deleteOne();
            }
          }
      }
      await deleteAdditionalImages(accommodation.BussinessPermit)
      await deleteAdditionalImages(accommodation.BuildingPermit)
      await deleteAdditionalImages(accommodation.frontPic)

      const host = await Host.findById(accommodation.owner)
      if(host){
        host.accommodations.pull(accommodation._id);
        await host.save()
      }

      accommodation.deleteOne();
      return res.status(200).json({message: 'delete succes'})
    }
  } catch (error) {
    console.log(error);
  }
}



const deleteHost = async(req, res)=>{
  try {
    // console.log(req.params)
    const host = await Host.findById(req.params.id)
    if(host){
      const user = await User.findById(host.user)
      if(user){
        user.host = null;
        await user.save()
      }
      host.deleteOne();
      return res.status(200).json({message: 'delete success'})
    }
  } catch (error) {
    console.log(error);
  }
}



const deleteUser = async(req, res) => {
  try {
    // console.log('user: ',req.params);
    const user = await User.findById(req.params.id)
    if(user){
      console.log(user)
      if(user.profilePic){
        const profileImage = await ProfileImage.findById(new ObjectId(user.profilePic))
        if(profileImage){
          profileImage.deleteOne();
        }
      }

      if(user.frontID){
        const frontID = await FrontIdImage.findById(new ObjectId(user.frontID))
        if(frontID){
          frontID.deleteOne()
        }
      }

      if(user.backID){
        const backID = await BackIdImage.findById(new ObjectId(user.backID))
        if(backID){
            backID.deleteOne();
        }
      }

      user.deleteOne()
      return res.status(200).json({message: 'delete success'})
    }
  } catch (error) {
    console.log(error);
  }
}
  




//delete a user


//to update a user


const updateUser = (req, res) => {
  try {

  } catch (error) {

  }
}


const handleHandleValidationStateChange = async (req, res) => {
  try {
    // console.log(req.params.id)
    const accommodation = await Accommodation.findById(req.params.id)
    if (accommodation) {
      if (accommodation.validated == false) {
        accommodation.validated = true
        await accommodation.save();
      }
      else{
        accommodation.validated = false
        await accommodation.save();
      }
      return res.status(200).json({ message: 'succes' })
    }
    else {
      return res.status(404).json({ error: 'No Records Found' })
    }
  } catch (error) {
    console.error(error);
  }
}






//to logout the admin



module.exports = {
  administrativeLogin,
  adminAuthControl,
  createNewAdmin,
  getUsers,
  getHost,
  getOwner,
  getAccommodations,
  searchUser,
  searchAccommodation,
  handleHandleValidationStateChange,
  deleteAccommodation,
  deleteHost,
  getOneHost,
  deleteUser,
}
