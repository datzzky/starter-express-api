const express = require('express');
const controller = require('../controllers/AdminControllers');
const usersController = require('../controllers/controllers');

const adminRouter = express.Router();

adminRouter.post('/adminLogin',controller.administrativeLogin);
// adminRouter.post('/createAdmin', controller.createNewAdmin); //enable only when there is no admin
adminRouter.get('/admin/auth', controller.adminAuthControl);
adminRouter.get('/admin/getUsers', controller.getUsers);
adminRouter.get('/admin/getHost', controller.getHost);
adminRouter.get('/admin/getOwner',controller.getOwner);
adminRouter.get('/admin/getAccommodations', controller.getAccommodations);
adminRouter.get('/searchUser', controller.searchUser);
adminRouter.get('/searchAccommodation', controller.searchAccommodation);
adminRouter.get('/validateAccommodation/:id', controller.handleHandleValidationStateChange);
adminRouter.get('/deleteAccommodation/:id', controller.deleteAccommodation);
adminRouter.get('/deleteHost/:id', controller.deleteHost);
adminRouter.get('/admin/host/:id', controller.getOneHost);
adminRouter.get('/admin/deleteUser/:id', controller.deleteUser);


module.exports = adminRouter;



/*
NOTE!!! SECURE THIS DATA
UNCOMMENT THE /createAdmin ROUTE if you need to create an admin

{
  "userName": "superUser@admin.boardingGo",
  "password": "@AZR3iZr2bSyr8nM"
}
$2b$10$qa8rpy0rmLLj.L2llxmbNO9loG.ptzMYMPjQifam2o3DjVTuy5sE2
*/ 