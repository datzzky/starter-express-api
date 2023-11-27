const mongoose = require("mongoose");
const {Schema} = mongoose;


const DeclinedSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    requestedCategory: {
      type: String,
    },
    requestedRoom: {
      type: Number,
    },
    reservationDate:{
      type:Date
    }
  },
  {
    timestamps: true,
  }
);






const InlistedSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    requestedCategory: {
      type: String,
    },
    requestedRoom: {
      type: Number,
    },
    reservationDate:{
      type:Date
    }
  },
  {
    timestamps: true,
  }
);


const TenantSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    accommodationCategory: {
      type: String,
    },
    requestedRoom: {
      type: Number,
    },
    reservationDate:{
      type:Date
    },
    approvedDate:{
      type:Date,
    }
    
  },
  {
    timestamps: true,
  }
);





const checkedOutSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    accommodationCategory: {
      type: String,
    },
    requestedRoom: {
      type: Number,
    },
    reservationDate:{
      type:Date
    },
    approvedDate:{
      type:Date,
    },
    checkedInDate:{
      type:Date
    }
    
  },
  {
    timestamps: true,
  }
);



const roomTenantSchema = new Schema({
  tenantID: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
  },
  lastName: {
    type: String,
    
  },
  firstName: {
    type: String,
    
  },
})




const roomSchema = new Schema({
  roomNumber: {
    type: Number,
    default: null,
  },
  numberOfTenants:{
    type: Number,
  },
  price: {
    type: Number,
  },
  hasExclusiveBathRoom:{
    type: Boolean,
  },
  hasExclusiveComfortRoom: {
    type: Boolean,
  },
  images : {
    type: Array,
  },
  tenantsOfRoom: [roomTenantSchema]
});


const ratingSchema = new Schema({
  tenantUserID: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
  },
  profilePic:{
    type: String,
  },
  lastName: {
    type: String,
    
  },
  firstName: {
    type: String,
    
  },
  numberOfStar:{
    type: Number,
  }
});


const ReservationSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    requestedCategory: {
      type: String,
      required: true
    },
    requestedRoom: {
      type: Number,
      required: true
    }

  },
  {
    timestamps: true,
  }
);


const cancellationSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    requestedCategory: {
      type: String,
      required: true
    },
    requestedRoom: {
      type: Number,
      required: true
    },
    dateInlisted:{
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);



const chekingOutSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    accommodationCategory: {
      type: String,
      required: true
    },
    requestedRoom: {
      type: Number,
      required: true
    },
    checkedInDtae:{
      type:Date,
    },
    approvedDate:{
      type:Date,
    }
  },
  {
    timestamps: true,
  }
);



const cancelledSchema = new Schema(
  {
    tenantUserID: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    lastName: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    requestedCategory: {
      type: String,
      required: true
    },
    requestedRoom: {
      type: Number,
      required: true
    },
    dateInlisted:{
      type: Date,
    },
    cancellationDate:{
      type:Date,
    }

  },
  {
    timestamps: true,
  }
);



const AccommodationSchema = new Schema(
  {
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Host'
    },
    category:{
      type:String,
      require: true,
    },
    long:{
      type: Number,
    },
    lat:{
      type:Number,
    },
    Address:{
      type: String,
      require: true,
    },
    allRooms: [roomSchema],
    Amenities:[{
      type:String,
      require:true,
    }],
    frontPic: {
      type: String,
    },
    Gallery:{
      type: Array
    },
    Title:{
      type:String,
        require:true,
    },
    exclusiveFor:{
      type: String,
    },
    Description: {
      type: String,
      require:true
    },
    validated:{
      type: Boolean,
      default: false,
    },
    houseRulesImage: {
      type: Array,
    },
    houseRulesText: {
      type: String,
      default:'',
    },
    monthlyDueDate:{
      type: Number,
      default: 1,
    },
    BussinessPermit:{
      type: String
    },
    BuildingPermit:{
      type: String,
    },
    Ratings:[ratingSchema],
    tenants: [TenantSchema],
    reservations: [ReservationSchema],
    declined: [DeclinedSchema],
    inlisted : [InlistedSchema],
    checkingOut: [chekingOutSchema],
    cancellation: [cancellationSchema],
    cancelled: [cancelledSchema],
    checkedOut : [checkedOutSchema],
    },
    {
      timestamps: true,
    }
  );

  

const AccommodationModel = mongoose.model('Accommodation', AccommodationSchema);
module.exports = AccommodationModel;

//64bee41fcfafd361e799751c