const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false, useCreateIndex: true});
var conn = mongoose.Collection
const {ObjectId} = mongoose.Schema.Types
var passSchema = new mongoose.Schema({
    password_category: {
        type:String,
        required:true,
       
    },
    password_detail: {
        type:String,
        required:true,
    },
    date: {
        type:Date,
        default:Date.now
    },
    postedBy:{
        type:ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('Password_details',passSchema);