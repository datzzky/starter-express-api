/* /*===============================================================================
    Controllers and endpoint for the users

=================================================================================

*/
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Host = require('../models/Host');
const UserKey = require('../models/UserKey')
const Accommodation = require('../models/Accommodation');
const Notification = require('../models/Notification')
const Chat = require('../models/Chat');
const ProfileImage = require('../models/ProfileImage');
const FrontIdImage = require('../models/FrontIdImage')
const BackIdImage = require('../models/BackIdImage');
const AccommodationGallery = require('../models/AccommodationGallery');
const RoomImage = require('../models/RoomImage');
const AdditionalAccommodationImages = require('../models/AdditionalAccommodationImages');
const AccommodationRules = require('../models/AccommodationRulesImage')
const { encryptSecretKey, decryptSecretKey } = require('./cryptography')
const { encryptKey, decryptKey } = require('./keyLoker');
const { validateToken } = require('./tokenValidator');
const ObjectId = require('mongodb').ObjectId;



// users authentication middleware






const authMiddleware = async (req, res, next) => {

  function extract_Token(authorizationHeader) {
    try {
      let accessToken;
      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        accessToken = authorizationHeader.slice(7); // Remove "Bearer " prefix
        return accessToken;
      } else {
        return accessToken;
      }

    } catch (error) {
      console.log(error)
    }

  }

  if (req.method === 'GET') {

    try {
      if (!(req.headers.authorization && req.query)) {
        console.log('No Access Data is send!!');
        return res.status(400).json({ valid: false });
      }

      const { userID, loginID } = req.query
      const accessToken = extract_Token(req.headers.authorization);
      validateStart(userID, loginID, accessToken)

    }
    catch (error) {
      console.log(error)
    }

  }


  if (req.method === 'POST') {
    try {

      // console.log(JSON.stringify(req.headers, null, 2));
      const authorizationHeader = req.headers.authorization;
      const { userID, loginID } = req.body.OnStoredData;
      // console.log('headers: ', req.header.authorization);
      // console.log('ids: ', req.body.OnStoredData);

      const accessToken = extract_Token(authorizationHeader);
      //console.log(req.body,'\ntoken: ', accessToken);
      validateStart(userID, loginID, accessToken)

    } catch (error) {
      console.log(error);
      return res.sendStatus(400)
    }
  }


  async function validateStart(userID, loginID, accessToken) {
    try {
      const userKey = await UserKey.findById(loginID);
      if (userKey) {

        if (userID == userKey.userId) {
          const encryptedKey = userKey.encryptionKey;
          const encryptionKey = decryptKey(encryptedKey);
          //console.log('encryptedKey = ', encryptedKey);
          const encryptedSecretKey = userKey.secretKey;
          //console.log('decrypted secretKey = ',decryptSecretKey(encryptedSecretKey,encryptionKey));
          //console.log('encryptedSecretKey = ', encryptedSecretKey)
          const validToken = validateToken(encryptedKey, encryptedSecretKey, accessToken);
          if (validToken) {
            // console.log('validate success')
            next();
          }
          else {
            console.log('validation failed')
            return res.status(401).json({ valid: false });
          }
        }
      }
      else {
        console.log('Unauthorize')
        return res.status(401).json({ valid: false });
      }
    } catch (error) {
      return res.status(401).json({ valid: false });
    }
  }//end

}






//auth




const authStateTrue = async (req, res) => {
  const { userID } = req.query;
  const user = await User.findById(userID)
  if (user) {
    // console.log('profile Image: ', data)
    const profileImage = await ProfileImage.findById(new ObjectId(user.profilePic))
    let profilePic;
    if (profileImage) {
      profilePic = profileImage.image
    }
    else {
      profilePic = null
    }
    // console.log(profileImage.image)
    return res.status(200)
      .json({
        host: user.host,
        fName: user.FirstName,
        lName: user.LastName,
        profilePic: profilePic,
        workingLocation: user.workingLocation,
      });
  }
}








const getAccommodationByView = async (req, res) => {
  // console.log("ID: ", req.params)
  const { id } = req.params;
  const accommodations = await Accommodation.findById(id);
  if (accommodations) {
    const Gallery = [];
    for (const fileId of accommodations.Gallery) {
      const image = await AccommodationGallery.findById(new ObjectId(fileId));
      if (image) {
        Gallery.push(image)
      }
    };



    const imagesOfRules = []
    for (const fileId of accommodations.houseRulesImage) {
      const image = await AccommodationRules.findById(new ObjectId(fileId))
      if (image) {
        imagesOfRules.push(image);
      }
    }



    const Rooms = [];
    for (const room of accommodations.allRooms) {
      const roomImage = [];
      for (const fileId of room.images) {
        // console.log(fileId)
        const image = await RoomImage.findById(new ObjectId(fileId));
        if (image) {
          roomImage.push(image)
        }
      }
      // console.log(room)
      Rooms.push({
        roomNumber: room.roomNumber,
        numberOfTenants: room.numberOfTenants,
        price: room.price,
        hasExclusiveBathRoom: room.hasExclusiveBathRoom,
        hasExclusiveComfortRoom: room.hasExclusiveComfortRoom,
        images: roomImage,
        tenantsOfRoom: room.tenantsOfRoom,
        roomId: room._id
      })
    };


    async function getAdditionalImages(id) {
      let Data;
      const imageData = await AdditionalAccommodationImages.findById(new ObjectId(id));
      if (imageData) {
        return Data = imageData.image
      }
      else {
        return Data = null
      }
    }

    const frontImage = await getAdditionalImages(accommodations.frontPic);
    const BussinessPermit = await getAdditionalImages(accommodations.BussinessPermit);
    const BuildingPermit = await getAdditionalImages(accommodations.BuildingPermit);

    // console.log(frontImage)

    return res.status(200)
      .json({
        _id: accommodations._id,
        images: Gallery,
        Title: accommodations.Title,
        Price: accommodations.Price,
        long: accommodations.long,
        lat: accommodations.lat,
        category: accommodations.category,
        Description: accommodations.Description,
        Address: accommodations.Address,
        houseRules: accommodations.houseRules,
        houseRulesText: accommodations.houseRulesText,
        rooms: Rooms,
        Amenities: accommodations.Amenities,
        tenants: accommodations.tenants,
        checkOuts: accommodations.checkedOut,
        ratings: accommodations.Ratings,
        frontPic: frontImage,
        rulesInImage: imagesOfRules,
        monthlyDueDate: accommodations.monthlyDueDate,
        exclusiveFor: accommodations.exclusiveFor,
        BussinessPermit: BussinessPermit,
        BuildingPermit: BuildingPermit,
      })
  }
  else {
    return res.status(404).json({ message: "Nothing Found" })
  }
}








//fetch the specific accommodation data in the client side







const fetchAccommodation = async (req, res) => {
  try {
    const { id } = req.params
    const accommodation = await Accommodation.findById(id)
    if (accommodation) {
      const host = await Host.findById(accommodation.owner)
      //console.log(host)
      const owner = await User.findById(host.user)
      //console.log(owner)

      const profileImage = await ProfileImage.findById(new ObjectId(owner.profilePic))
      let profilePic;
      if (profileImage) {
        profilePic = profileImage.image
      }
      else {
        profilePic = null
      }

      const Gallery = [];
      for (const fileId of accommodation.Gallery) {
        const image = await AccommodationGallery.findById(new ObjectId(fileId));
        if (image) {
          Gallery.push(image)
        }
      };

      const imagesOfRules = []
      for (const fileId of accommodation.houseRulesImage) {
        const image = await AccommodationRules.findById(new ObjectId(fileId))
        if (image) {
          imagesOfRules.push(image);
        }
      }

      const Rooms = [];
      for (const room of accommodation.allRooms) {
        const roomImage = [];
        for (const fileId of room.images) {
          // console.log(fileId)
          const image = await RoomImage.findById(new ObjectId(fileId));
          if (image) {
            roomImage.push(image)
          }
        }
        // console.log(room)
        Rooms.push({
          roomNumber: room.roomNumber,
          numberOfTenants: room.numberOfTenants,
          price: room.price,
          hasExclusiveBathRoom: room.hasExclusiveBathRoom,
          hasExclusiveComfortRoom: room.hasExclusiveComfortRoom,
          images: roomImage,
          tenantsOfRoom: room.tenantsOfRoom,
        })
      };

      async function getAdditionalImages(id) {
        let Data;
        const imageData = await AdditionalAccommodationImages.findById(new ObjectId(id));
        if (imageData) {
          return Data = imageData.image
        }
        else {
          return Data = null
        }
      }

      const BussinessPermit = await getAdditionalImages(accommodation.BussinessPermit);
      const BuildingPermit = await getAdditionalImages(accommodation.BuildingPermit);

      // console.log(Rooms)

      // console.log('fetcheng...')
      // console.log(accommodation.allRooms)
      res.status(200)
        .json({
          _id: accommodation._id,
          images: Gallery,
          Title: accommodation.Title,
          Price: accommodation.Price,
          long: accommodation.long,
          lat: accommodation.lat,
          category: accommodation.category,
          Description: accommodation.Description,
          Address: accommodation.Address,
          houseRulesText: accommodation.houseRulesText,
          ownerFN: owner.FirstName,
          ownerLN: owner.LastName,
          ownerID: owner._id,
          rooms: Rooms,
          exclusiveFor: accommodation.exclusiveFor,
          profilePic: profilePic,
          Amenities: accommodation.Amenities,
          tenants: accommodation.tenants,
          checkOuts: accommodation.checkedOut,
          ratings: accommodation.Ratings,
          rulesInImage: imagesOfRules,
          BussinessPermit: BussinessPermit,
          BuildingPermit: BuildingPermit,
        });
    }
  } catch (error) {
    console.log(error)
  }
}





//landing end point that fetch data into the landing page












const main = async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ validated: true })
    const accommodationData = []
    for (const accommodation of accommodations) {
      const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
      // console.log(accommodation.frontPic)
      accommodationData.push({
        _id: accommodation._id,
        title: accommodation.Title,
        category: accommodation.category,
        frontPic: frontImage ? frontImage.image : null,
        long: accommodation.long,
        lat: accommodation.lat,
        rooms: accommodation.allRooms,
      })
    }
    return res.status(200).json(accommodationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



const byFilter = async (req, res) => {
  console.log(req.query.filter)

  try {
    const accommodations = await Accommodation.find({ category: req.query.filter, validated: true })
    const accommodationData = []
    for (const accommodation of accommodations) {
      const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
      // console.log(accommodation.frontPic)
      accommodationData.push({
        _id: accommodation._id,
        title: accommodation.Title,
        category: accommodation.category,
        frontPic: frontImage ? frontImage.image : null,
        long: accommodation.long,
        lat: accommodation.lat,
        rooms: accommodation.allRooms,
      })
    }
    return res.status(200).json(accommodationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



const handleFilterSearch = async (req, res) => {


  const toRadians = (degree) => {
    return degree * (Math.PI / 180);
  };


  // Haversine distance calculation function
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 * 1000; // Radius of the Earth in meters

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers

    return distance;
  };


  try {
    console.log(req.query)
    const accommodationData = [];
    // has amenities but no distance
    // if the requested capacity is lessthan 5
    if (!req.query.distance && req.query.listOfAmenities) {
      // console.log('No distance')
      if (req.query.capacity <= 4) {
        const accommodations = await Accommodation.find({
          'allRooms': {
            $elemMatch: {
              'price': { $lte: parseInt(req.query.priceValue) },
              'numberOfTenants': { $lte: parseInt(req.query.capacity) },
            },
          },
          'Amenities': { $in: req.query.listOfAmenities },
        })
        if (accommodations) {
          // console.log(accommodations)
          for (const accommodation of accommodations) {
            const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
            // console.log(accommodation.frontPic)
            accommodationData.push({
              _id: accommodation._id,
              title: accommodation.Title,
              category: accommodation.category,
              frontPic: frontImage ? frontImage.image : null,
              long: accommodation.long,
              lat: accommodation.lat,
              rooms: accommodation.allRooms,
            })
          }
        }
      }



      // if the capacity is more than 4
      else if (req.query.capacity > 4) {
        const accommodations = await Accommodation.find({
          'allRooms': {
            $elemMatch: {
              'price': { $lte: parseInt(req.query.priceValue) },
              'numberOfTenants': { $gt: parseInt(req.query.capacity) },
            },
          },
          'Amenities': { $in: req.query.listOfAmenities },
        })
        if (accommodations) {
          // console.log(accommodations)
          for (const accommodation of accommodations) {
            const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
            // console.log(accommodation.frontPic)
            accommodationData.push({
              _id: accommodation._id,
              title: accommodation.Title,
              category: accommodation.category,
              frontPic: frontImage ? frontImage.image : null,
              long: accommodation.long,
              lat: accommodation.lat,
              rooms: accommodation.allRooms,
            })
          }
        }
      }
    }

    // has distance but no amnities
    else if (req.query.distance && !req.query.listOfAmenities) {
      // console.log('No Amenities')

      // look for the near accommodation
      const nearbyAccommodation = []
      const accommodations = await Accommodation.find({ validated: true })
      for (const accommodation of accommodations) {
        const accommodationDistance = calculateHaversineDistance(req.query.userLat, req.query.userLong, accommodation.lat, accommodation.long);
        if (accommodationDistance <= req.query.distance) {
          // console.log('Accommodation distance: ',accommodationDistance, 'LookUp distance: ', req.query.distance)
          nearbyAccommodation.push(accommodation);
        }
      }
      // console.log(nearbyAccommodation)
      // filter the nearby accommodation

      const filteredAccommodation = nearbyAccommodation.filter(accommodation =>
        accommodation.allRooms.some(
          room =>
            (req.query.capacity > 4 && room.price <= parseInt(req.query.priceValue) && room.numberOfTenants >= parseInt(req.query.capacity)) ||
            (req.query.capacity <= 4 && room.price <= parseInt(req.query.priceValue) && room.numberOfTenants <= parseInt(req.query.capacity))
        )
      );
      console.log(filteredAccommodation);
      // fetch the filtered accommodation
      for (const accommodation of filteredAccommodation) {
        const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
        console.log(accommodation.frontPic)
        accommodationData.push({
          _id: accommodation._id,
          title: accommodation.Title,
          category: accommodation.category,
          frontPic: frontImage ? frontImage.image : null,
          long: accommodation.long,
          lat: accommodation.lat,
          rooms: accommodation.allRooms,
        })
      }
    }


    // no distance and no amenities
    else if (!req.query.distance && !req.query.listOfAmenities) {
      // console.log('No Both')
      // if capacity is lessthan 5
      if (req.query.capacity <= 4) {
        const accommodations = await Accommodation.find({
          'allRooms': {
            $elemMatch: {
              'price': { $lte: parseInt(req.query.priceValue) },
              'numberOfTenants': { $lte: parseInt(req.query.capacity) },
            },
          },
        })
        if (accommodations) {
          // console.log(accommodations)
          for (const accommodation of accommodations) {
            const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
            console.log(accommodation.frontPic)
            accommodationData.push({
              _id: accommodation._id,
              title: accommodation.Title,
              category: accommodation.category,
              frontPic: frontImage ? frontImage.image : null,
              long: accommodation.long,
              lat: accommodation.lat,
              rooms: accommodation.allRooms,
            })
          }
        }
      }
      // if the capacity is more than 4
      else if (req.query.capacity > 4) {
        const accommodations = await Accommodation.find({
          'allRooms': {
            $elemMatch: {
              'price': { $lte: parseInt(req.query.priceValue) },
              'numberOfTenants': { $gt: parseInt(req.query.capacity) },
            },
          },
        })
        if (accommodations) {
          // console.log(accommodations)
          for (const accommodation of accommodations) {
            const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
            console.log(accommodation.frontPic)
            accommodationData.push({
              _id: accommodation._id,
              title: accommodation.Title,
              category: accommodation.category,
              frontPic: frontImage ? frontImage.image : null,
              long: accommodation.long,
              lat: accommodation.lat,
              rooms: accommodation.allRooms,
            })
          }
        }
      }
    }


    // all queries is present
    else {
      // console.log('complete')
      // look for the near accommodation
      const nearbyAccommodation = []
      const accommodations = await Accommodation.find({ validated: true })
      for (const accommodation of accommodations) {
        const accommodationDistance = calculateHaversineDistance(req.query.userLat, req.query.userLong, accommodation.lat, accommodation.long);
        if (accommodationDistance <= req.query.distance) {
          console.log('Accommodation distance: ', accommodationDistance, 'LookUp distance: ', req.query.distance)
          nearbyAccommodation.push(accommodation);
        }
      }
      // filter the nearby accommodation
      const filteredAccommodation = nearbyAccommodation.filter(accommodation =>
        accommodation.allRooms.some(
          room =>
            (req.query.capacity > 4 && room.price <= parseInt(req.query.priceValue) && room.numberOfTenants >= parseInt(req.query.capacity)) ||
            (req.query.capacity <= 4 && room.price <= parseInt(req.query.priceValue) && room.numberOfTenants <= parseInt(req.query.capacity))
        ) &&
        accommodation.Amenities.some(amenity =>
          req.query.listOfAmenities.includes(amenity)
        )
      );
      // fetch the filtered accommodation
      for (const accommodation of filteredAccommodation) {
        const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
        console.log(accommodation.frontPic)
        accommodationData.push({
          _id: accommodation._id,
          title: accommodation.Title,
          category: accommodation.category,
          frontPic: frontImage ? frontImage.image : null,
          long: accommodation.long,
          lat: accommodation.lat,
          rooms: accommodation.allRooms,
        })
      }
    }
    console.log(accommodationData)
    return res.status(200).json(accommodationData);
  } catch (error) {
    console.log(error)
  }
}



/*   _______________________________
    |register function for the users|
    |_______________________________|
*/


const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { fileValue, lastname, firstname, email, password, file1Value, file2Value } = req.body;

    const user = await User.findOne({ Email: email });

    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    } else {


      const newProfileImage = new ProfileImage({
        image: fileValue,
      })
      await newProfileImage.save()
        .then(() => {
          console.log('Profile image is saved');
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        });

      const newFrontID = new FrontIdImage({
        image: file1Value,
      })
      await newFrontID.save()
        .then(() => {
          console.log('front Id image is saved');
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        });

      const newBackID = new BackIdImage({
        image: file2Value
      })
      newBackID.save()
        .then(() => {
          console.log('Back Id image is saved');
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        profilePic: newProfileImage._id,
        LastName: lastname,
        FirstName: firstname,
        Email: email,
        password: hashedPassword,
        frontID: newFrontID._id,
        backID: newBackID._id
      });

      await newUser.save()
        .then(() => {
          console.log('Data is saved');
          return res.status(200).json({ message: 'Submit Success' });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        });
    }
  } catch (error) {
    console.log(error)
  }
};








//if the selected role is a tenant





const isTenant = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ Email: email });
    //console.log(user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tenant = new Tenant({ user: user._id });
    await tenant.save();

    // Associate the tenant with the user
    user.tenant = tenant._id;
    await user.save();


    //console.log(result, 'data is saved');
    res.status(200);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



//if the selected role is a host




const isHost = async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const host = new Host({ user: user._id });
    const result = await host.save();


    user.host = host._id;
    await user.save();


    //console.log(result, 'data is saved');
    res.status(200).json({ message: 'success' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error', });
  }
}



/*   _____________________________
    |login function for the users|
    |____________________________|
    
*/
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ Email: email }).select('+password');


  if (!user) {
    return res.status(404).json({ error: 'User Not Found' })
  }

  else {

    const validatedPassword = await bcrypt.compare(password, user.password)
      .then(async (validatedPassword) => {
        if (!validatedPassword) {
          console.log("invalid password!");
          return res.status(401).json({ error: "invalid password" });
        }

        else {

          console.log("success");
          const secretKey = crypto.randomBytes(64).toString('hex'); //  generate secret key
          const encryptionKey = crypto.randomBytes(32); //1 generate encryptionKey
          const encryptedSecretKey = encryptSecretKey(secretKey, encryptionKey);
          const securedKey = encryptKey(encryptionKey); //3 encrypt the transform string
          //const decryptedKey = decryptKey(securedKey);//4 decrypt the string //includes decrypt in keylocker
          let host;

          //console.log(`before: ${encryptionKey.toString('hex')} inBuffer = ${encryptionKey}`);
          //console.log(`after: ${decryptedKey.toString('hex')} inBuffer${decryptedKey}`);
          //console.log('\n\n\n')
          const token = jwt.sign({ id: user._id }, secretKey);


          // console.log('Token: ',token);
          // console.log(`secret key = ${secretKey}\n\n`);
          // console.log(`encryption key = ${encryptionKey}\n\n`);
          // console.log(`encrypted secretKey = ${encryptedSecretKey}\n\n`);
          // console.log(`secure key = ${securedKey}\n\n`);
          //console.log(`decrypted key = ${decryptedKey}\n\n`);
          //console.log('decrypted secretKey = ',decryptSecretKey(encryptedSecretKey,toBuffer));


          const newLogin = new UserKey({
            userId: user._id,
            secretKey: encryptedSecretKey,
            encryptionKey: securedKey
          });

          await newLogin.save();
          const loginID = newLogin._id;
          //console.log(`new login id = ${loginID}`);

          user.userKey = newLogin._id;
          await user.save();

          if (user.host) {
            host = true;
          } else {
            host = false;
          }

          return (
            res.status(200).json({
              message: 'login success',
              token,
              userID: user.id,
              host,
              loginID
            })
          );

        }
      })
  }
}





//Logout Endpoint







const logout = async (req, res) => {
  try {
    const { userID, loginID } = req.body.OnStoredData;
    const user = await User.findById(userID)
      .then(async (user) => {
        if (!user) {
          console.log('could not find the ID')
          return res.status(404);
        }
        deleteKey(loginID);
        user.userKey = null;
        await user.save();
      })

    async function deleteKey(objectID) {
      const deletedUserKey = await UserKey.findOneAndDelete({ _id: objectID });

      if (deletedUserKey) {
        console.log('User key deleted:', deletedUserKey);
        res.clearCookie('access_token');
        return res.sendStatus(200);
      } else {
        console.log('User key not found');
        return res.sendStatus(404);
      }
    }
  } catch (error) {
    console.log(error);
  }

}




//new Accommodation endpoint




const newAccommodation = async (req, res) => {
  try {

    const rooms = [];
    // console.log(JSON.parse(req.body.Data.allRooms)[0])
    const { userID } = req.body.OnStoredData;
    //console.log(userID);
    const {
      AccommodationType,
      long,
      address,
      lat,
      allRooms,
      listOfAmenities,
      frontPicFile,
      selectedFilesGallery,
      title,
      gender,
      description,
      rules,
      rulesText,
      monthlyDueDate,
      BussinessPermit,
      BuildingPermit
    } = req.body.Data;
    // //console.log('controller is reach', userID,title, selectedFiles,price, description, amenities);
    const allRoomsInJSON = JSON.parse(allRooms);
    const host = await Host.findOne({ user: userID });

    for (const room of allRoomsInJSON) {
      const roomImages = [];
      for (const imageData of room.images) {

        const nwRmImg = new RoomImage({
          image: imageData
        })
        await nwRmImg.save()
          .then((result) => {
            roomImages.push(nwRmImg.id);
            // console.log(nwRmImg.id)
          })
          .catch((error) => {
            console.log(error);
          });
      }
      // console.log(roomImages)
      rooms.push({
        roomNumber: room.roomNumber,
        numberOfTenants: room.tenants,
        price: room.price,
        hasExclusiveBathRoom: room.hasExclusiveBathRoom,
        hasExclusiveComfortRoom: room.hasExclusiveComfortRoom,
        images: roomImages,
      })

    }
    // console.log(rooms)

    // Process the selectedFilesGallery array and upload images to separate collection
    const galleryFiles = [];
    for (const imageData of selectedFilesGallery) {
      const nwGallery = new AccommodationGallery({
        image: imageData
      })
      await nwGallery.save()
        .then((result) => {
          galleryFiles.push(nwGallery.id);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    // console.log("gallery: ",galleryFiles)
    //process the rules image
    const rulesImage = [];
    if (rules.length > 0) {
      for (const imageData of rules) {
        const nwImage = new AccommodationRules({
          image: imageData
        })
        await nwImage.save()
          .then((result) => {
            rulesImage.push(nwImage.id);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    async function saveAdditionalImages(data) {
      const addtionalImage = new AdditionalAccommodationImages({
        image: data
      })
      await addtionalImage.save()
        .then((result) => {
          // console.log(addtionalImage._id)
        })
        .catch((error) => {
          console.log(error);
        });
      return addtionalImage._id
    }

    const frontPicFileRef = await saveAdditionalImages(frontPicFile)
    const BussinessPermitRef = await saveAdditionalImages(BussinessPermit)
    const BuildingPermitRef = await saveAdditionalImages(BuildingPermit)

    // console.log(BussinessPermitRef)

    // console.log(AccommodationType, long, lat,rooms, listOfAmenities, frontPicFileRef, galleryFiles, gender, description, rulesImage, rulesText, BussinessPermitRef, BuildingPermitRef)
    // console.log(rooms)
    if (host) {
      const accommodation = new Accommodation({
        owner: host._id,
        category: AccommodationType,
        long: long,
        lat: lat,
        allRooms: rooms,
        Address: address,
        Amenities: listOfAmenities,
        frontPic: frontPicFileRef,
        Gallery: galleryFiles,
        Title: title,
        exclusiveFor: gender,
        Description: description,
        houseRulesImage: rulesImage,
        houseRulesText: rulesText,
        monthlyDueDate: monthlyDueDate,
        BussinessPermit: BussinessPermitRef,
        BuildingPermit: BuildingPermitRef,
      });
      console.log('saving...');
      await accommodation.save();
      host.accommodations.push(accommodation._id);
      await host.save()
        .then((result) => {
          console.log('new accommodation is created')
          return res.status(200).json({ message: "new accommodation is created" });
          //console.log(newUser);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: "Internal Server Error" });
        });
    }
    else {
      return res.status(404);
    }
  } catch (error) {
    console.error(error)
  }
}












const getCounts = async (req, res) => {
  console.log(req.query.userID)
  try {
    const { userID } = req.query
    const user = await User.findById(userID)
    if (user) {
      // console.log(user)
      const accommodations = await Accommodation.find({ owner: user.host });
      if (accommodations) {
        let reservationCount = 0;
        let checkinOut = 0;
        let cancellationCount = 0;
        let inListedCount = 0;
        let currentCheckeIn = 0;
        accommodations.forEach((accommodation) => {
          reservationCount = reservationCount + accommodation.reservations.length;
          checkinOut = checkinOut + accommodation.checkingOut.length;
          cancellationCount = cancellationCount + accommodation.cancellation.length;
          inListedCount = inListedCount + accommodation.inlisted.length;
          currentCheckeIn = currentCheckeIn + accommodation.tenants.length;
        });
        return res.status(200).json({ reservationCount, checkinOut, cancellationCount, inListedCount, currentCheckeIn })
      }
    }

  } catch (error) {
    console.log(error)
  }
}




//make a reservation



const makeReservation = async (req, res) => {
  // console.log(req.body)
  try {
    const { roomNumber, id } = req.body // accommodation id
    const { userID } = req.body.OnStoredData
    // console.log(`user: ${userID}`)
    //validate if user has current accommodation
    const tenant = await Tenant.findOne({ user: userID })
    if (tenant.currentAccommodation) {
      // console.log(tenant)
      return res.json({ message: 'you currently have an active accommodation' })
    }
    const accommodation = await Accommodation.findById(id);
    if (accommodation) {
      // console.log(accommodation.Title)
      const category = accommodation.category;
      const userReservation = accommodation.reservations.find(
        (reservation) => reservation.tenantUserID.toString() === userID
      );
      // console.log("reservation duplication",userReservation)
      if (userReservation) {
        console.log('User has a reservation for this accommodation:', accommodation.Title);
        return res.json({ message: 'you have already sent a request here' })
      } else {
        // User ID does not exist in the reservations array
        console.log('User does not have a reservation for this accommodation:', accommodation.Title);
        // Perform the action here, such as displaying a message or taking another action
        const user = await User.findById(userID)
        if (user) {
          accommodation.reservations.push({
            tenantUserID: userID,
            lastName: user.LastName,
            firstName: user.FirstName,
            requestedCategory: category,
            requestedRoom: roomNumber,
          });
          await accommodation.save()
          console.log('Notifiying Host..', accommodation.owner)
          const host = await Host.findById(accommodation.owner)
          if (host) {
            //make a notification
            const notification = new Notification({
              userReferenceID: host.user,
              notificationBody: `You have a new Reservation request from ${user.FirstName, user.LastName}`,
              status: "unread",
            })
            notification.save()
            // console.log('Tenant is pushed')
            // console.log('Host is Notified')
            return res.status(200).json({ message: " reservation request sent" });
          }
        }
      }
    }

  } catch (error) {
    console.log(error)
  }
}







const getAccommodationByOwner = async (req, res) => {
  //console.log(req.query)
  const { userID } = req.query
  const user = await User.findById(userID)
  if (user) {
    //console.log(user.host)
    const accommodationsData = await Accommodation.find({ owner: user.host })
    if (accommodationsData) {
      const accommodations = []
      for (const accommodation of accommodationsData) {
        const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
        accommodations.push({
          _id: accommodation._id,
          frontPic: frontImage.image,
          Title: accommodation.Title,
          category: accommodation.category,
          createdAt: accommodation.createdAt,
        })
      }
      return res.json(accommodations)
    }
  }
}











const getAllTenantOfSpecifiedHost = async (req, res) => {
  //console.log(req.query)
  try {
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      //console.log(user.host)
      const accommodations = await Accommodation.find({ owner: user.host });
      //console.log(accommodations)
      const allReservations = accommodations.reduce((reservations, accommodation) => {
        return reservations.concat(accommodation.reservations);
      }, []);
      console.log(allReservations,);
      res.status(200).json({ allReservations, })
    }

  } catch (error) {
    console.log(error)
  }
}




// handles checkin


const handleCheckin = async (req, res) => {
  try {
    const { id } = req.body
    const { userID } = req.body.OnStoredData
    const owner = await Host.findOne({ user: userID })

    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id })
      if (accommodations) {

        // console.log(accommodations.length)
        let specificTenantInlisted;
        let specificAccommodation;
        accommodations.some((accommodation) => {
          // console.log("inlisteds",accommodation._id)
          const index = accommodation.inlisted.findIndex((inlisted) => inlisted.tenantUserID.toString() === id)
          if (index !== -1) {
            specificTenantInlisted = accommodation.inlisted[index];
            specificAccommodation = accommodation._id;
            return true; //check if the specific tenant exist
          }
          return false;
        });

        if (specificTenantInlisted) {
          const data = {
            tenantUserID: specificTenantInlisted.tenantUserID,
            lastName: specificTenantInlisted.lastName,
            firstName: specificTenantInlisted.firstName,
            accommodationCategory: specificTenantInlisted.requestedCategory,
            requestedRoom: specificTenantInlisted.requestedRoom,
            reservationDate: specificTenantInlisted.reservationDate,
            approvedDate: specificTenantInlisted.createdAt
          }
          console.log(data);
          const accommodation = await Accommodation.findById(specificAccommodation)
          accommodation.tenants.push(data)
          await accommodation.save();
          await Accommodation.updateOne(
            { _id: accommodation._id },
            { $pull: { inlisted: { tenantUserID: specificTenantInlisted.tenantUserID } } }
          );
          //make a notification
          const notification = new Notification({
            userReferenceID: id,
            notificationBody: `You were now checkin to the accommodation ${accommodation.Title}`,
            status: "unread",
          })
          notification.save();
        }
      }

      return res.status(200).json({ message: "Tenant has been checkedin" })
    }
  } catch (error) {
    console.log(error)
  }
}









// Handles reservation accommodation

const reservationAction = async (req, res) => {
  // id is the reservation id
  console.log(req.body)

  try {
    const { action, id } = req.body //action to be executed and the and tenant id
    const { userID } = req.body.OnStoredData
    const owner = await Host.findOne({ user: userID })
    //console.log(owner._id)
    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id })
      if (accommodations) {
        //console.log(accommodations.length)
        let specificReservation;
        let specificAccommodation;

        accommodations.some((accommodation) => {
          // console.log(accommodation._id)
          const index = accommodation.reservations.findIndex((reservation) => reservation.tenantUserID.toString() === id);
          if (index !== -1) {
            specificReservation = accommodation.reservations[index];
            specificAccommodation = accommodation._id;
            return true;
          }
          return false;
        });

        if (specificReservation) {
          // console.log('Specific reservation:', specificReservation.tenantUserID);
          // Do something with the specific reservation
          const accommodation = await Accommodation.findById(specificAccommodation)

          const data = {
            tenantUserID: specificReservation.tenantUserID,
            lastName: specificReservation.lastName,
            firstName: specificReservation.firstName,
            requestedCategory: specificReservation.requestedCategory,
            requestedRoom: specificReservation.requestedRoom,
            reservationDate: specificReservation.createdAt,
          }

          if (action === 'accept') {

            // console.log("All reservation to be inlisted", specificReservation)
            const tenant = await Tenant.findOne({ user: id }) //validate if the tenant has an active accommodation
            if (tenant.currentAccommodation) {
              // console.log(tenant)
              return res.json({ message: 'This tenant is currently has an active Accommodation' })
            }

            accommodation.inlisted.push(data)// push the tenant as a new tenant into the tenant array
            await accommodation.save();
            // console.log(accommodation.allRooms[specificReservation.requestedRoom]);
            accommodation.allRooms[specificReservation.requestedRoom - 1].tenantsOfRoom.push(
              {
                tenantID: tenant._id,
                lastName: specificReservation.lastName,
                firstName: specificReservation.firstName
              }
            );
            await accommodation.save();
            //and remove the tenant from the reservation array
            await Accommodation.updateOne(
              { _id: accommodation._id },
              { $pull: { reservations: { tenantUserID: specificReservation.tenantUserID } } }
            );
            // update the tenant currentAccommodation here
            tenant.currentAccommodation = specificAccommodation
            await tenant.save();
            //make a notification
            const notification = new Notification({
              userReferenceID: id,
              notificationBody: `You have been enlisted into the accommodation ${accommodation.Title}`,
              status: "unread",
            })
            notification.save();
            return res.json({ message: 'Tenant enlisted successfully' })
          }


          if (action === 'decline') {
            // console.log(accommodation._id)
            accommodation.declined.push(data)
            await accommodation.save();
            await Accommodation.updateOne(
              { _id: accommodation._id },
              { $pull: { reservations: { tenantUserID: specificReservation.tenantUserID } } }
            );
            //make a notification
            const notification = new Notification({
              userReferenceID: id,
              notificationBody: `Your request for reservation in ${accommodation.Title} has been declined`,
              status: "unread",
            })
            notification.save();
            return res.json({ message: 'request has been declined' })
          }

        } else {
          console.log('Reservation not found');
        }
      }

    }

  } catch (error) {
    console.log(error)
  }
}




const getAllAcceptedTenant = async (req, res) => {
  try {
    console.log('requesting all tenants')
    // console.log(req.query)
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      //console.log(user.host)
      const accommodations = await Accommodation.find({ owner: user.host });
      //console.log(accommodations)
      const allTenants = accommodations.reduce((tenants, accommodation) => {
        return tenants.concat(accommodation.tenants);
      }, []);
      //console.log(allTenants);
      res.status(200).json({ allTenants, category: accommodations.category })
    }
  } catch (error) {
    console.log(error)
  }
}


const getAllInlistedTenants = async (req, res) => {
  try {
    console.log('requesting all tenants')
    // console.log(req.query)
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      //console.log(user.host)
      const accommodations = await Accommodation.find({ owner: user.host });
      //console.log(accommodations)
      const allTenantsInlisted = accommodations.reduce((inlisted, accommodation) => {
        return inlisted.concat(accommodation.inlisted);
      }, []);
      //console.log(allTenants);
      res.status(200).json({ allTenantsInlisted, category: accommodations.category })
    }
  } catch (error) {
    console.log(error)
  }
}






// handle get declined records
const getAllDeclines = async (req, res) => {
  try {
    console.log('requesting declined')
    console.log(req.query)
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      //console.log(user.host)
      const accommodations = await Accommodation.find({ owner: user.host });
      //console.log(accommodations)
      const allDeclines = accommodations.reduce((declined, accommodation) => {
        return declined.concat(accommodation.declined);
      }, []);
      //console.log(allTenants);
      res.status(200).json({ allDeclines, category: accommodations.category })
    }
  } catch (error) {
    console.log(error)
  }

}






const removeTenant = async (req, res) => {
  try {
    const { id } = req.body
    const { userID } = req.body.OnStoredData
    const owner = await Host.findOne({ user: userID })

    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id })
      if (accommodations) {

        // console.log(accommodations.length)
        let specificTenant;
        let specificAccommodation;
        accommodations.some((accommodation) => {
          console.log(accommodation._id)
          const index = accommodation.tenants.findIndex((tenant) => tenant.tenantUserID.toString() === id)
          if (index !== -1) {
            specificTenant = accommodation.tenants[index];
            specificAccommodation = accommodation._id;
            return true; //check if the specific tenant exist
          }
          return false;
        });

        if (specificTenant) {
          const data = {
            tenantUserID: specificTenant.tenantUserID,
            lastName: specificTenant.lastName,
            firstName: specificTenant.firstName,
            accommodationCategory: specificTenant.accommodationCategory,
            requestedRoom: specificTenant.requestedRoom,
            reservationDate: specificTenant.reservationDate,
            approvedDate: specificTenant.approvedDate,
            checkedInDate: specificTenant.createdAt
          }
          console.log('Specific specificTenantInlisted:', specificTenant);
          const accommodation = await Accommodation.findById(specificAccommodation);
          console.log('removing tenant..')
          await Accommodation.updateOne(
            { _id: accommodation._id },
            { $pull: { tenants: { tenantUserID: specificTenant.tenantUserID } } }
          );
          const checkOutRequest = accommodation.checkingOut.find(
            (checkingOut) => checkingOut.tenantUserID.toString() === id
          );

          if (checkOutRequest) {
            await Accommodation.updateOne(
              { _id: accommodation._id },
              { $pull: { checkingOut: { tenantUserID: specificTenant.tenantUserID } } }
            );
          }
          accommodation.checkedOut.push(data)
          await accommodation.save();
          // update tenant currentAccommodation here set to null
          const tenant = await Tenant.findOne({ user: id })


          if (tenant) {
            accommodation.allRooms[specificTenant.requestedRoom - 1].tenantsOfRoom.pull({ tenantID: tenant._id });
            await accommodation.save();

            tenant.currentAccommodation = null
            await tenant.save();
            //notify
            const notification = new Notification({
              userReferenceID: id,
              notificationBody: "You have been checkout from the accommodation",
              status: "unread",
            })
            notification.save();
            return res.json({ message: 'Tenant has been check-out' })
          }
          console.log('removed successfully')
        }

      }

    }
  } catch (error) {
    console.log(error)
  }
}




const handleRejectedCheckOut = async (req, res) => {
  // console.log(req.body)
  try {
    const { id } = req.body
    const { userID } = req.body.OnStoredData
    const owner = await Host.findOne({ user: userID })

    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id })
      if (accommodations) {

        let specificCheckingOutTenant;
        let specificAccommodation;
        accommodations.some((accommodation) => {
          const index = accommodation.checkingOut.findIndex((checkingOut) => checkingOut.tenantUserID.toString() === id)
          if (index !== -1) {
            specificCheckingOutTenant = accommodation.checkingOut[index];
            specificAccommodation = accommodation._id;
            return true; //check if the specific tenant exist
          }
          return false;
        });
        const accommodation = await Accommodation.findById(specificAccommodation);
        console.log("specific tenant id: ", specificCheckingOutTenant)
        await Accommodation.updateOne(
          { _id: accommodation._id },
          { $pull: { checkingOut: { tenantUserID: specificCheckingOutTenant.tenantUserID } } }
        );
        //notify
        const notification = new Notification({
          userReferenceID: id,
          notificationBody: "Your request to checkout has been rejected",
          status: "unread",
        })
        notification.save();
        return res.json({ message: 'Check-Out request has been rejected you may contact this tenant for a reason' })
      }
    }
  } catch (error) {
    console.error(error)
  }
}





const getCheckedOut = async (req, res) => {
  try {
    console.log('requesting declined')
    console.log(req.query)
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      const accommodations = await Accommodation.find({ owner: user.host });
      const allCheckedOut = accommodations.reduce((checkedOut, accommodation) => {
        return checkedOut.concat(accommodation.checkedOut);
      }, []);
      res.status(200).json({ allCheckedOut, category: accommodations.category })
    }
  } catch (error) {
    console.log(error)
  }
}





const handleCheckoutRequest = async (req, res) => {
  try {
    const { id } = req.body; //accommodation id
    const { userID } = req.body.OnStoredData
    const user = User.findById(userID)
    const accommodation = await Accommodation.findById(id);
    // console.log(accommodation.tenants)
    if (accommodation) {
      let specificTenant = null;
      const index = accommodation.tenants.findIndex((tenant) => tenant.tenantUserID.toString() === userID)
      if (index !== -1) {
        specificTenant = accommodation.tenants[index];
      }
      if (specificTenant) {
        const data = {
          tenantUserID: specificTenant.tenantUserID,
          lastName: specificTenant.lastName,
          firstName: specificTenant.firstName,
          accommodationCategory: specificTenant.accommodationCategory,
          requestedRoom: specificTenant.requestedRoom,
          checkedInDtae: specificTenant.createdAt,
          approvedDate: specificTenant.approvedDate,
        }

        const checkOutRequest = accommodation.checkingOut.find(
          (checkingOut) => checkingOut.tenantUserID.toString() === userID
        );

        if (checkOutRequest) {
          return res.json({ message: 'You have already sent a request pls wait for your host response or personally ask your host for concern' })
        }
        else {
          accommodation.checkingOut.push(data)
          await accommodation.save();
          const notification = new Notification({
            userReferenceID: user._id,
            notificationBody: `You have a checkout request from ${user.firstName} ${user.lastName}`,
            status: "unread",
          })
          notification.save();
          return res.json({ message: 'Your request to checkout has been sent' })
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}






//handle cancellation of reservation

const handleCancelOfInlistment = async (req, res) => {
  // console.log(req.body)
  try {
    const { id } = req.body; //accommodation id
    const { userID } = req.body.OnStoredData
    const user = User.findById(userID)

    const accommodation = await Accommodation.findById(id);
    if (accommodation) {
      // console.log(accommodation.inlisted)
      let specificTenantInlisted;
      const index = accommodation.inlisted.findIndex((tenant) => tenant.tenantUserID.toString() === userID)
      if (index !== -1) {
        specificTenantInlisted = accommodation.inlisted[index];
      }
      // console.log("cancellation for :",specificTenantInlisted)
      if (specificTenantInlisted) {
        const data = {
          tenantUserID: specificTenantInlisted.tenantUserID,
          lastName: specificTenantInlisted.lastName,
          firstName: specificTenantInlisted.firstName,
          requestedCategory: specificTenantInlisted.requestedCategory,
          requestedRoom: specificTenantInlisted.requestedRoom,
          dateInlisted: specificTenantInlisted.createdAt,
        }
        const userCancellation = accommodation.cancellation.find(
          (cancellation) => cancellation.tenantUserID.toString() === userID
        );
        // console.log("cancellation for: ",userCancellation)
        if (userCancellation) {
          console.log("user request is allready sent");
          return res.status(200).json({ message: "Cancellation request is allready sent wait for yuor host response" })
        }
        else {
          // console.log(data)
          accommodation.cancellation.push(data);
          await accommodation.save();
          //make a notification
          const notification = new Notification({
            userReferenceID: userID,
            notificationBody: `You have a new Reservation request from ${user.FirstName, user.LastName}`,
            status: "unread",
          })
          notification.save()
          return res.status(200).json({ message: "Cancellation request sent" })
        }
      }
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "something went wrong" })
  }
}








//handle fetching the cancellation request
const getCancellationRequest = async (req, res) => {
  try {
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      const accommodations = await Accommodation.find({ owner: user.host });
      const allCancellation = accommodations.reduce((cancellation, accommodation) => {
        return cancellation.concat(accommodation.cancellation);
      }, []);
      res.status(200).json({ allCancellation, category: accommodations.category })
    }
  } catch (error) {
    console.error(error)
  }
}


const alloWcanellationRequest = async (req, res) => {
  try {
    const { id } = req.body;
    const { userID } = req.body.OnStoredData;
    const owner = await Host.findOne({ user: userID })
    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id });
      if (accommodations) {
        let specificCancellation;
        let specificAccommodation;

        accommodations.some((accommodation) => {
          const index = accommodation.cancellation.findIndex((cancellation) => cancellation.tenantUserID.toString() === id);
          if (index !== -1) {
            specificCancellation = accommodation.cancellation[index];
            specificAccommodation = accommodation._id;
            return true;
          }
          return false;
        });

        const data = {
          tenantUserID: specificCancellation.tenantUserID,
          lastName: specificCancellation.lastName,
          firstName: specificCancellation.firstName,
          requestedCategory: specificCancellation.requestedCategory,
          requestedRoom: specificCancellation.requestedRoom,
          dateInlisted: specificCancellation.dateInlisted,
          cancellationDate: specificCancellation.createdAt
        }
        if (specificCancellation) {
          const accommodation = await Accommodation.findById(specificAccommodation);
          await Accommodation.updateOne(
            { _id: accommodation._id },
            { $pull: { inlisted: { tenantUserID: specificCancellation.tenantUserID } } }
          );
          await Accommodation.updateOne(
            { _id: accommodation._id },
            { $pull: { cancellation: { tenantUserID: specificCancellation.tenantUserID } } }
          );
          accommodation.cancelled.push(data)
          await accommodation.save();

          const tenant = await Tenant.findOne({ user: id })

          if (tenant) {
            accommodation.allRooms[specificCancellation.requestedRoom - 1].tenantsOfRoom.pull({ tenantID: tenant._id });
            await accommodation.save();

            tenant.currentAccommodation = null
            await tenant.save();
            //notify
            const notification = new Notification({
              userReferenceID: id,
              notificationBody: " Your Request to cancel the accommodation has been granted you may start a reservation to the other accommodations ",
              status: "unread",
            })
            notification.save();
            return res.status(200).json({ message: 'Tenant Request for canellation has Granted' })
          }
          console.log('removed successfully')
        }
      }

    }

  } catch (error) {
    console.error(error);
  }
}



const rejectCancellationRequest = async (req, res) => {
  try {
    const { id } = req.body;
    const { userID } = req.body.OnStoredData;
    const owner = await Host.findOne({ user: userID })
    if (owner) {
      const accommodations = await Accommodation.find({ owner: owner._id });
      if (accommodations) {
        let specificCancellation;
        let specificAccommodation;

        accommodations.some((accommodation) => {
          const index = accommodation.cancellation.findIndex((cancellation) => cancellation.tenantUserID.toString() === id);
          if (index !== -1) {
            specificCancellation = accommodation.cancellation[index];
            specificAccommodation = accommodation._id;
            return true;
          }
          return false;
        });

        const data = {
          tenantUserID: specificCancellation.tenantUserID,
          lastName: specificCancellation.lastName,
          firstName: specificCancellation.firstName,
          requestedCategory: specificCancellation.requestedCategory,
          requestedRoom: specificCancellation.requestedRoom,
          dateInlisted: specificCancellation.dateInlisted,
          cancellationDate: specificCancellation.createdAt
        }
        if (specificCancellation) {
          const accommodation = await Accommodation.findById(specificAccommodation);
          await Accommodation.updateOne(
            { _id: accommodation._id },
            { $pull: { cancellation: { tenantUserID: specificCancellation.tenantUserID } } }
          );
          //notify
          const notification = new Notification({
            userReferenceID: id,
            notificationBody: "Your cancellation request has been reject, You may contact your host for the reason ",
            status: "unread",
          })
          notification.save();
          return res.status(200).json({ message: 'Tenant Request for canellation has Rejected You may contact this tenant for a reasons' })

        }
      }

    }

  } catch (error) {
    console.error(error);
  }
}



const getAllCancelled = async (req, res) => {
  try {
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      const accommodations = await Accommodation.find({ owner: user.host });
      const allCancelled = accommodations.reduce((cancelled, accommodation) => {
        return cancelled.concat(accommodation.cancelled);
      }, []);
      res.status(200).json({ allCancelled, category: accommodations.category })
    }
  } catch (error) {
    console.error(error)
  }
}



//userProfile

const getProfile = async (req, res) => {
  console.log(req.query)
  try {
    const { userID } = req.query;
    const user = await User.findById(userID);
    if (user) {
      const tenant = await Tenant.findById(user.tenant);
      let accommodation = null;
      accommodation = await Accommodation.findById(tenant.currentAccommodation);
      if (accommodation) {
        accommodation = {
          Title: accommodation.Title,
          tenants: accommodation.tenants,
          inlisted: accommodation.inlisted,
          _id: accommodation._id
        }
      }
      if (tenant) {
        const profileImage = await ProfileImage.findById(new ObjectId(user.profilePic));
        const frontID = await FrontIdImage.findById(new ObjectId(user.frontID));
        const backID = await BackIdImage.findById(new ObjectId(user.backID));
        return res.status(200).json({
          email: user.Email,
          firstName: user.FirstName,
          lastName: user.LastName,
          id_Back: backID.image,
          id_front: frontID.image,
          host: user.host,
          tenant: user.tenant,
          profilePic: profileImage.image,
          workingLocation: user.workingLocation,
          accommodation,

        })
      }
    }

  } catch (error) {
    console.log(error)
  }
}




const getPublicProfile = async (req, res) => {
  try {
    // console.log(req.params.id)
    const user = await User.findById(req.params.id);
    if (user) {
      const profileImage = await ProfileImage.findById(new ObjectId(user.profilePic));
      const frontID = await FrontIdImage.findById(new ObjectId(user.frontID));
      const backID = await BackIdImage.findById(new ObjectId(user.backID));
      return res.status(200).json({
        firstName: user.FirstName,
        lastName: user.LastName,
        id_Back: backID.image,
        id_front: frontID.image,
        profilePic: profileImage.image,
      })
    }

  } catch (error) {
    console.log(error);
  }
}






const handleUpdateProfile = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID);
    // console.log(user)
    user.FirstName = req.body.firstName;
    user.LastName = req.body.lastName;
    await user.save();
    console.log('succes')
    return res.status(200).json({ message: 'succes' });
  } catch (error) {
    console.log(error)
  }
}



const handleUpdateCurrentLocation = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID);
    if (user) {
      user.workingLocation.long = req.body.long;
      user.workingLocation.lat = req.body.lat;
      user.workingLocation.place = req.body.place;

      await user.save();

      return res.status(200).json({ message: 'Update Success' })
    }
  } catch (error) {
    console.log(error)
  }
}



const handleUpdateMonthlyDue = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id)
    if (accommodation) {
      accommodation.monthlyDueDate = req.body.monthlyDueDate
      await accommodation.save()
      return res.status(200).json({ messasge: 'Update success' })
    }
    else {
      return res.status(500)
    }
  } catch (error) {
    console.log(error)
  }
}




const handlePasswordChange = async (req, res) => {
  try {
    console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID);
    const validatedPassword = await bcrypt.compare(req.body.oldPassword, user.password)
      .then(async (validatedPassword) => {
        if (!validatedPassword) {
          console.log("invalid password!");
          return res.status(401).json({ error: "invalid password" });
        }
        else {
          console.log('correct pass')
          const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
          user.password = hashedPassword;
          user.save();
          console.log('password change success')
          return res.status(200).json({ message: 'Password change succes!' })
        }
      });
  } catch (error) {
    console.log(error)
  }
}







const handleUpdateEmail = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findOne({ Email: req.body.nwEmail });

    if (user) {
      return res.status(409).json({ message: 'This email is already taken' });
    }
    else {
      const user = await User.updateOne(
        { _id: req.body.OnStoredData.userID },
        { Email: req.body.nwEmail },
        { new: true },
      )
      return res.status(200).json({ message: 'Email Succefully updated' })
    }
  } catch (error) {
    console.log(error)
  }
}









const handleProfilePictureChange = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID)
    if (user) {
      const newProfileImage = new ProfileImage({
        image: req.body.nwProfilePic,
      })
      await newProfileImage.save();
      const newProfilePic = newProfileImage._id;
      const oldProfilePic = user.profilePic;
      user.profilePic = newProfilePic
      await user.save();
      const deleted = await ProfileImage.findByIdAndDelete(new ObjectId(oldProfilePic));
      return res.status(200).json({ message: 'Profile picture succesfully change' });
    }
  } catch (error) {
    console.log(error)
  }
}






const handleChangeFrontId = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID)
    if (user) {
      const newFrontIdIMage = new FrontIdImage({
        image: req.body.frontImage,
      })
      await newFrontIdIMage.save();
      const newFrontIDImg = newFrontIdIMage._id;
      const oldImage = user.frontID;
      user.frontID = newFrontIDImg;
      await user.save()
      const deleted = await FrontIdImage.findByIdAndDelete(new ObjectId(oldImage));
      return res.status(200).json({ message: ' Image succesfully change' })
    }
    // 
  } catch (error) {
    console.log(error)
  }
}



const handleChangeBackId = async (req, res) => {
  try {
    // console.log(req.body)
    const user = await User.findById(req.body.OnStoredData.userID)
    if (user) {
      const newBackIdImage = new BackIdImage({
        image: req.body.backImage,
      })
      await newBackIdImage.save();
      const newImage = newBackIdImage._id;
      const oldImage = user.backID;
      user.backID = newImage;
      await user.save()
      const deleted = await BackIdImage.findByIdAndDelete(new ObjectId(oldImage));
      return res.status(200).json({ message: ' Image succesfully change' })
    }
  } catch (error) {
    console.log(error);
  }
}



// accommodation details updates


const handleUpdateTitle = async (req, res) => {
  try {
    console.log(req.body)
    const accommodation = await Accommodation.findOneAndUpdate(
      { _id: req.body.id },
      { Title: req.body.Title },
      { new: true }
    )
    return res.status(200).json({ message: 'Title changedsuccess' })
  } catch (error) {
    console.log(error)
  }
}


const handleSaveImage = async (req, res) => {
  try {
    //  console.log( req.body)
    const accommodation = await Accommodation.findById(req.body.accommodationId)
    if (accommodation) {
      const nwGallery = new AccommodationGallery({
        image: req.body.additionalImage,
      })
      await nwGallery.save()
        .then((result) => {
          accommodation.Gallery.push(nwGallery.id);
          accommodation.save()
        })
        .catch((error) => {
          console.log(error);
        });
      return res.status(200).json({ message: 'image successfully added' })
    }
  } catch (error) {
    console.log(error)
  }
}


const handleDeleteImage = async (req, res) => {
  try {
    // console.log(req.body)
    const ImageDeleted = await AccommodationGallery.findByIdAndDelete(req.body.id)
    if (ImageDeleted) {
      const accommodation = await Accommodation.findById(req.body.accommodationId)
      if (accommodation) {
        for (const fileId of accommodation.Gallery) {
          if (fileId == req.body.id) {
            accommodation.Gallery.pull(fileId)
            accommodation.save();
            return res.status(200).json({ message: 'Delete success' })
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}



const handleChangeDescription = async (req, res) => {
  try {
    // console.log(req.body);
    const accommodation = await Accommodation.findOneAndUpdate(
      { _id: req.body.id },
      { Description: req.body.description },
      { new: true }
    )
    return res.status(200).json({ message: 'Descreption changed success' })
  } catch (error) {
    console.log(error)
  }
}






const handleFrontPicUpdate = async (req, res) => {
  try {
    // console.log(req.body.id)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const addtionalImage = new AdditionalAccommodationImages({
        image: req.body.frontPic,
      })
      await addtionalImage.save()
      const newImage = addtionalImage._id;
      const oldImage = accommodation.frontPic;
      accommodation.frontPic = newImage;
      await accommodation.save();
      const deletedImage = await AdditionalAccommodationImages.findByIdAndDelete(new Object(oldImage));
      return res.status(200).json({ message: 'front picture succesfully change' });
    }
  } catch (error) {
    console.log(error)
  }
}







const handleHouseRulesImageSave = async (req, res) => {
  try {
    console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.accommodationId)
    if (accommodation) {
      const nwImage = new AccommodationRules({
        image: req.body.houseRulesImage,
      })
      await nwImage.save()
        .then((result) => {
          accommodation.houseRulesImage.push(nwImage.id);
          accommodation.save()
        })
        .catch((error) => {
          console.log(error);
        });
      return res.status(200).json({ message: 'image successfully added' })
    }
  } catch (error) {
    console.log(error)
  }
}








// handle search accommodations
const handleSearchQueryAccommodations = async (req, res) => {
  try {
    // console.log(req.query.queryAccommodation)
    const accommodations = await Accommodation.find({ Title: req.query.queryAccommodation });
    const accommodationData = []
    if (accommodations) {
      for (const accommodation of accommodations) {
        const frontImage = await AdditionalAccommodationImages.findById(new ObjectId(accommodation.frontPic))
        console.log(accommodation.frontPic)
        accommodationData.push({
          _id: accommodation._id,
          title: accommodation.Title,
          category: accommodation.category,
          frontPic: frontImage.image,
          long: accommodation.long,
          lat: accommodation.lat,
          rooms: accommodation.allRooms,
        })
      }
    }
    return res.status(200).json(accommodationData);
  } catch (error) {
    console.log(error)
  }
}









const handleHouseRulesImageDelate = async (req, res) => {
  try {
    console.log(req.body)
    const ImageDeleted = await AccommodationRules.findByIdAndDelete(req.body.id)
    if (ImageDeleted) {
      const accommodation = await Accommodation.findById(req.body.accommodationId)
      if (accommodation) {
        for (const fileId of accommodation.houseRulesImage) {
          if (fileId == req.body.id) {
            accommodation.houseRulesImage.pull(fileId)
            accommodation.save();
            return res.status(200).json({ message: 'Delete success' })
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}






const handleUpdateAmenities = async (req, res) => {
  try {

    const newAmenities = req.body.listOfAmenities;
    const accommodation = await Accommodation.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: { Amenities: newAmenities },
      },
      { new: true }
    )
    return res.status(200).json({ message: 'Amenities are updated' });
    // } else {
    //   return res.status(404).json({ message: 'Accommodation not found' });
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




const handleRulesInTextUpdate = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      accommodation.houseRulesText = req.body.rulesInText;
      accommodation.save();
      return res.status(200).json({ message: 'Changed Success' })
    }
  } catch (error) {
    console.log(error)
  }
}


const updateExclusiveFor = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      accommodation.exclusiveFor = req.body.gender;
      await accommodation.save();
      return res.status(200).json({ message: 'changed success' });
    }
  } catch (error) {
    console.log(error)
  }
}




const handleUpdateBussinessPermit = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const addtionalImage = new AdditionalAccommodationImages({
        image: req.body.BussinessPermit,
      })
      await addtionalImage.save()
      const newImage = addtionalImage._id;
      const oldImage = accommodation.BussinessPermit;
      accommodation.BussinessPermit = newImage;
      await accommodation.save();
      const deletedImage = await AdditionalAccommodationImages.findByIdAndDelete(new Object(oldImage));
      return res.status(200).json({ message: 'Image Changed succesfully' });
    }
  } catch (error) {
    console.log(error)
  }
}







const hanDleUpdateBuildingPermit = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const addtionalImage = new AdditionalAccommodationImages({
        image: req.body.BuildingPermit,
      })
      await addtionalImage.save()
      const newImage = addtionalImage._id;
      const oldImage = accommodation.BuildingPermit;
      accommodation.BuildingPermit = newImage;
      await accommodation.save();
      const deletedImage = await AdditionalAccommodationImages.findByIdAndDelete(new Object(oldImage));
      return res.status(200).json({ message: 'Image Changed succesfully' });
    }
  } catch (error) {
    console.log(error)
  }
}




const handleUpdateCAtegory = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findOneAndUpdate(
      { _id: req.body.id },
      { category: req.body.AccommodationType },
      { new: true }
    )
    return res.status(200).json({ message: ' Changed success' })
  } catch (error) {
    console.log(error)
  }
}






// update room status

const updatePrice = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const room = accommodation.allRooms.find((room) => room._id == req.body.roomId);
      if (room) {
        room.price = req.body.roomPrice;
        await accommodation.save()
        return res.status(200).json({ message: 'Room Updated Successcfully' })
      }
    }
  } catch (error) {
    console.log(error);
  }
}




const updateCapacity = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const room = accommodation.allRooms.find((room) => room._id == req.body.roomId);
      if (room) {
        // console.log(room)
        room.numberOfTenants = req.body.roomCapacity;
        await accommodation.save()
        return res.status(200).json({ message: 'Room Updated Successcfully' })
      }
    }
  } catch (error) {
    console.log(error);
  }
}


const updateHasExclusiveBathroom = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const room = accommodation.allRooms.find((room) => room._id == req.body.roomId);
      if (room) {
        // console.log(room)
        room.hasExclusiveBathRoom = req.body.hasExclusiveBathRoom;
        await accommodation.save()
        return res.status(200).json({ message: 'Room Updated Successcfully' })
      }
    }
  } catch (error) {
    console.log(error)
  }
}


const updateHasExclusiveCR = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id);
    if (accommodation) {
      const room = accommodation.allRooms.find((room) => room._id == req.body.roomId);
      if (room) {
        // console.log(room)
        room.hasExclusiveComfortRoom = req.body.hasDedicated_CR;
        await accommodation.save()
        return res.status(200).json({ message: 'Room Updated Successcfully' })
      }
    }
  } catch (error) {
    console.log(error)
  }
}




const handleInsertNewRoom = async (req, res) => {
  try {
    // console.log(req.body)
    const allRoomsInJSON = JSON.parse(req.body.allRooms);
    const accommodation = await Accommodation.findById(req.body.id)
    if (accommodation) {
      for (const room of allRoomsInJSON) {
        const roomImages = [];
        for (const imageData of room.images) {

          const nwRmImg = new RoomImage({
            image: imageData
          })
          await nwRmImg.save()
            .then((result) => {
              roomImages.push(nwRmImg.id);
              // console.log(nwRmImg.id)
            })
            .catch((error) => {
              console.log(error);
            });
        }
        // console.log(roomImages)
        accommodation.allRooms.push({
          roomNumber: room.roomNumber,
          numberOfTenants: room.tenants,
          price: room.price,
          hasExclusiveBathRoom: room.hasExclusiveBathRoom,
          hasExclusiveComfortRoom: room.hasExclusiveComfortRoom,
          images: roomImages,
        })
        await accommodation.save()
      }
      return res.status(200).json({ message: 'saved success' })
    }
  } catch (error) {
    console.log(error)
  }
}







const getAllCheckoutRequest = async (req, res) => {
  try {
    const { userID } = req.query;
    const user = await User.findById(userID)
    if (userID) {
      const accommodations = await Accommodation.find({ owner: user.host });
      const allCheckingOut = accommodations.reduce((checkingOut, accommodation) => {
        return checkingOut.concat(accommodation.checkingOut);
      }, []);
      res.status(200).json({ allCheckingOut, category: accommodations.category })
    }
  } catch (error) {
    console.error(error)
  }
}





//lose end
const getTenantDetails = async (req, res) => {
  try {
    const { userID } = req.query;
    const tenant = await Tenant.findOne({ user: userID })
    if (tenant) {
      const accommodation = await Accommodation.findById(tenant.currentAccommodation);
      if (accommodation) {
        return res.status(200).json(accommodation)
      }
    }
  } catch (error) {
    console.log(error)
  }
}











const fetchAllNotification = async (req, res) => {
  // console.log('Notification request')
  // console.log(req.query)
  const { userID } = req.query
  const notifications = await Notification.find({ userReferenceID: userID })
  if (notifications) {
    const unread = [];
    for (const notification of notifications) {
      if (notification.status === 'unread') {
        unread.push(notification)
      }
    }
    return res.json({ notifications, count: unread.length })
  }
}



const deleteAccommodation = async (req, res) => {
  try {
    // console.log(req.params);
    const accommodation = await Accommodation.findById(req.params.id);
    if (accommodation) {
      for (const imageId of accommodation.Gallery) {
        const galleryImage = await AccommodationGallery.findById(new ObjectId(imageId));
        if (galleryImage) {
          galleryImage.deleteOne();
        }
      }

      for (const imageId of accommodation.houseRulesImage) {
        const rulesImages = await AccommodationRules.findByIdAndDelete(imageId)
        if (rulesImages) {
          rulesImages.deleteOne();
        }
      }

      for (const room of accommodation.allRooms) {
        for (const imageId of room.images) {
          const roomImage = await RoomImage.findByIdAndDelete(imageId)
          if (roomImage) {
            roomImage.deleteOne();
          }
        }
      }

      async function deleteAdditionalImages(id) {
        if (id) {
          const imageData = await AdditionalAccommodationImages.findByIdAndDelete(new ObjectId(id))
          if (imageData) {
            imageData.deleteOne();
          }
        }
      }
      await deleteAdditionalImages(accommodation.BussinessPermit)
      await deleteAdditionalImages(accommodation.BuildingPermit)
      await deleteAdditionalImages(accommodation.frontPic)

      const host = await Host.findById(accommodation.owner)
      if (host) {
        host.accommodations.pull(accommodation._id);
        await host.save()
      }

      accommodation.deleteOne();
      return res.status(200).json({ message: 'delete succes' })
    }
  } catch (error) {
    console.log(error);
  }
}




const deleteRoomImage = async (req, res) => {
  try {
    // console.log(req.body);
    const accommodation = await Accommodation.findById(req.body.id)
    if (accommodation) {
      const imageData = await RoomImage.findById(req.body.imageId)
      if (imageData) {
        await imageData.deleteOne();
        console.log(imageData._id)
        const room = accommodation.allRooms.find((room) => room.roomNumber === req.body.roomNumber)
        await room.images.pull(imageData._id)
        await accommodation.save()
        console.log(room)

        return res.status(200).json({ message: 'delete succes' })
      }
      else {
        return res.status(404)
      }
    }
    else {
      return res.status(404)
    }
  } catch (error) {
    console.log(error)
    return res.status(500)
  }
}


const updateReadStatus = async (req, res) => {
  try {
    // console.log(req.params)
    const notification = await Notification.findById(req.params.id)
    if (notification) {
      // console.log(notification)
      notification.status = 'read';
      await notification.save()
      console.log(notification)
      return res.status(200).json({ message: '' });
    }
  } catch (error) {
    console.log(error)
  }
}


const handleAddRoomImage = async (req, res) => {
  try {
    // console.log(req.body)
    const accommodation = await Accommodation.findById(req.body.id)
    if (accommodation) {
      const room = accommodation.allRooms.find((room) => room.roomNumber === req.body.roomNumber)
      if (room) {
        const nwRmImg = new RoomImage({
          image: req.body.roomImageData
        })
        await nwRmImg.save()
          .then(async (result) => {
            room.images.push(nwRmImg.id);
            await accommodation.save();
            return res.status(200).json({ message: 'save success' })
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  } catch (error) {

    console.log(error)
  }
}



const giveRatings = async (req, res) => {
  try {
    const { userID } = req.body.OnStoredData;
    const { accommodationID, numberOfStars, } = req.body
    const user = await User.findById(userID);
    const accommodation = await Accommodation.findById(accommodationID);
    if (user) {
      const data = {
        tenantUserID: user._id,
        profilePic: user.profilePic,
        lastName: user.LastName,
        firstName: user.FirstName,
        numberOfStar: numberOfStars,
      }
      if (accommodation) {
        accommodation.Ratings.push(data);
        await accommodation.save();
        return res.status(200).json({ message: "ratting submitted" })
      }
    }
  } catch (error) {
    console.log(error)
  }
}

















// message handler


const handleMsgSent = async (req, res) => {
  // console.log(req.body)
  try {

    const { userID } = req.body.OnStoredData
    const chat = await Chat.findOne({
      $and: [
        { users: { $elemMatch: { $eq: userID } } },
        { users: { $elemMatch: { $eq: req.body.id } } }
      ]
    }).populate("users", "-password");

    const message = {
      sender: userID,
      messageBody: req.body.message,
    }

    if (chat) {
      // console.log(chat)
      chat.messages.push(message);
      await chat.save();
      const notification = new Notification({
        userReferenceID: req.body.id,
        notificationBody: "You Have a new Message Recieve open your messages to see all message unread",
        status: "unread",
      })
      await notification.save()
      return res.status(200);
    }
    else {
      const newChat = new Chat({
        users: [userID, req.body.id],
        messages: message,
      });
      await newChat.save();
      const notification = new Notification({
        userReferenceID: req.body.id,
        notificationBody: "You Have a new Message Recieve open your messages to see all message unreade",
        status: "unread",
      })
      await notification.save()
      return res.status(200);
    }
  } catch (error) {
    console.log(error)
  }
}




const fetchAllMsg = async (req, res) => {
  try {
    // console.log("id: ", re.query.userID)
    const chat = await Chat.find({ users: { $elemMatch: { $eq: req.query.userID } } }).populate("users", "-password");
    // console.log(chat)
    return res.status(200).json(chat);
  } catch (error) {
    console.log(error)
  }
}

const fetchProfilePic = async (req, res) => {
  try {
    // console.log(req.params)
    const profilePic = await ProfileImage.findById(req.params.id);
    if (profilePic) {
      // console.log(profilePic)
      return res.status(200).json(profilePic);
    }
  } catch (error) {
    console.log(error)
  }
}



const handleChatRoomMsg = async (req, res) => {
  try {
    const chatRoom = await Chat.findById(req.params.id);
    if (chatRoom) {
      return res.status(200).json(chatRoom)
    }
  } catch (error) {
    console.log(error)
  }
}


// end of message






module.exports = {
  main,
  register,
  isTenant,
  isHost,
  login,
  logout,
  newAccommodation,
  authMiddleware,
  authStateTrue,
  fetchAccommodation,
  makeReservation,
  getAccommodationByOwner,
  getAllTenantOfSpecifiedHost,
  reservationAction,
  getAllAcceptedTenant,
  removeTenant,
  getAllDeclines,
  getAccommodationByView,
  getProfile,
  getPublicProfile,
  fetchAllNotification,
  getTenantDetails,
  deleteAccommodation,
  getAllInlistedTenants,
  handleCheckin,
  getCheckedOut,
  handleCancelOfInlistment,
  getCancellationRequest,
  alloWcanellationRequest,
  rejectCancellationRequest,
  getAllCancelled,
  handleCheckoutRequest,
  getAllCheckoutRequest,
  handleRejectedCheckOut,
  giveRatings,
  handleMsgSent,
  fetchAllMsg,
  handleChatRoomMsg,
  byFilter,
  getCounts,
  handleUpdateProfile,
  handlePasswordChange,
  handleUpdateEmail,
  handleProfilePictureChange,
  handleChangeFrontId,
  handleChangeBackId,
  handleUpdateTitle,
  handleSaveImage,
  handleDeleteImage,
  handleChangeDescription,
  handleFrontPicUpdate,
  handleHouseRulesImageDelate,
  handleHouseRulesImageSave,
  handleUpdateAmenities,
  handleRulesInTextUpdate,
  updateExclusiveFor,
  handleUpdateBussinessPermit,
  hanDleUpdateBuildingPermit,
  handleUpdateCAtegory,
  updatePrice,
  updateCapacity,
  updateHasExclusiveBathroom,
  updateHasExclusiveCR,
  handleSearchQueryAccommodations,
  handleUpdateMonthlyDue,
  handleInsertNewRoom,
  deleteRoomImage,
  handleAddRoomImage,
  updateReadStatus,
  handleUpdateCurrentLocation,
  handleFilterSearch,
  fetchProfilePic,
}

//{id:ObjectId('64abf84f3ec88fe4722a0b98')}     to look for an id associated */