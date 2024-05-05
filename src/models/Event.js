import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    message : {
        type : String,
        required : true
    },
    tgId : {
        type : Number,
        required : true
    }
},{timestamps : true})

export default mongoose.model('Event',eventSchema)