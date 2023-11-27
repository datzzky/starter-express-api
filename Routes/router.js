// import express from "express";
// import controller from "../controllers/controllers"
const express = require('express');
const controller = require('../controllers/controllers');
const router = express.Router();
const privateRoutes = express.Router();

router.get('/', controller.main);
router.get('/accommodation/:id',controller.fetchAccommodation);
router.get('/getAccommodationByView/:id', controller.getAccommodationByView);
router.get('/getTenantDetails', controller.getTenantDetails);
router.get('/fiter',controller.byFilter),
router.get('/getPublicProfile/:id', controller.getPublicProfile);
router.get('/queryAccommodation', controller.handleSearchQueryAccommodations);
router.get('/filterQuery', controller.handleFilterSearch);


router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/asTenant', controller.isTenant);
router.post('/asHost', controller.isHost);
router.post('/reservationAction', controller.reservationAction);

privateRoutes.use(controller.authMiddleware);


// this rout will be nested
privateRoutes.post('/logout', controller.logout);
privateRoutes.post('/newAccommodation', controller.newAccommodation);
privateRoutes.post('/reservation', controller.makeReservation);
privateRoutes.post('/removeTenant', controller.removeTenant);
privateRoutes.post('/checkin', controller.handleCheckin);
privateRoutes.post('/cancelReservation', controller.handleCancelOfInlistment);
privateRoutes.post('/alloWcanellationRequest', controller.alloWcanellationRequest);
privateRoutes.post('/rejectCancellationRequest', controller.rejectCancellationRequest);
privateRoutes.post('/handleCheckoutRequest', controller.handleCheckoutRequest);
privateRoutes.post('/handleRejectedCheckOut', controller.handleRejectedCheckOut);
privateRoutes.post('/giveRatings', controller.giveRatings);
privateRoutes.post('/updateProfile',controller.handleUpdateProfile);
privateRoutes.post('/updatePassword', controller.handlePasswordChange);
privateRoutes.post('/updateEmail', controller.handleUpdateEmail);
privateRoutes.post('/updateProfilePic', controller.handleProfilePictureChange);
privateRoutes.post('/updateFrontId',controller.handleChangeFrontId);
privateRoutes.post('/updateBackId', controller.handleChangeBackId);
privateRoutes.post('/updateTitle', controller.handleUpdateTitle);
privateRoutes.post('/uploadGallery', controller.handleSaveImage);
privateRoutes.post('/deleteGalleryImage', controller.handleDeleteImage);
privateRoutes.post('/updateDescription',controller.handleChangeDescription);
privateRoutes.post('/updateFrontPic', controller.handleFrontPicUpdate);
privateRoutes.post('/uploadHouseRulesImage', controller.handleHouseRulesImageSave);
privateRoutes.post('/deleteHouseRulesImage',controller.handleHouseRulesImageDelate);
privateRoutes.post('/updateAmenities', controller.handleUpdateAmenities);
privateRoutes.post('/updateRulesText', controller.handleRulesInTextUpdate);
privateRoutes.post('/updateExlusiveFor', controller.updateExclusiveFor);
privateRoutes.post('/updateBussinessPermit', controller.handleUpdateBussinessPermit);
privateRoutes.post('/updateBuildingPermit', controller.hanDleUpdateBuildingPermit);
privateRoutes.post('/updateCategory',controller.handleUpdateCAtegory);
privateRoutes.post('/updatePrice', controller.updatePrice);
privateRoutes.post('/updateCapacity', controller.updateCapacity);
privateRoutes.post('/updateHasExclusiveBathroom', controller.updateHasExclusiveBathroom);
privateRoutes.post('/updateHasExclusiveCR', controller.updateHasExclusiveCR);
privateRoutes.post('/updatMonthlyDue', controller.handleUpdateMonthlyDue);
privateRoutes.post('/newRoom', controller.handleInsertNewRoom);
privateRoutes.post('/deleteRoomImage', controller.deleteRoomImage);
privateRoutes.post('/addRoomImage', controller.handleAddRoomImage);
privateRoutes.post('/updateLocation', controller.handleUpdateCurrentLocation);

//  message routes here

privateRoutes.post('/msgSent',controller.handleMsgSent);

privateRoutes.get('/fetchAllMsg', controller.fetchAllMsg);
privateRoutes.get('/handleChatRoomMsg/:id', controller.handleChatRoomMsg);
privateRoutes.get('/getProfilePic/:id', controller.fetchProfilePic);



privateRoutes.get('/authStateTrue', controller.authStateTrue);
privateRoutes.get('/listing', controller.getAccommodationByOwner);
privateRoutes.get('/getAllTenants', controller.getAllTenantOfSpecifiedHost);
privateRoutes.get('/getAllAcceptedTenant', controller.getAllAcceptedTenant);
privateRoutes.get('/getAllDeclines', controller.getAllDeclines);
privateRoutes.get('/getProfile',controller.getProfile);
privateRoutes.get('/getNotification', controller.fetchAllNotification);
privateRoutes.get('/deleteAccommodation/:id',controller.deleteAccommodation);
privateRoutes.get('/allChekedOut',controller.getCheckedOut);
privateRoutes.get('/inlistedTenants', controller.getAllInlistedTenants);
privateRoutes.get('/getCancellationRequest', controller.getCancellationRequest);
privateRoutes.get('/getAllCancelled',controller.getAllCancelled);
privateRoutes.get('/getAllCheckoutRequest', controller.getAllCheckoutRequest);
privateRoutes.get('/readNotification/:id', controller.updateReadStatus);
privateRoutes.get('/count', controller.getCounts);




router.use('/auth',privateRoutes);

module.exports = router;