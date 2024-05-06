import express from 'express'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import User from './src/models/User.js'
import Event from './src/models/Event.js'
import dbconnect from './src/config/db.js'
const app = express()
dotenv.config()
dbconnect()
const PORT = process.env.PORT
const bot = new Telegraf(process.env.BOT_TOKEN)
// ""
const url = `https://testingtelegrambot.onrender.com`
const webhook_path = `/telegraf/${process.env.BOT_TOKEN}`
bot.telegram.setWebhook(`${url}${webhook_path}`)
app.use(bot.webhookCallback(webhook_path))
bot.start(async(ctx) => {
    const from = ctx.update.message.from
    try{
        await User.findOneAndUpdate({tgId : from.id}, {
            $setOnInsert : {
                firstName : from.first_name,
                lastName : from?.last_name,
                isBot : from.is_bot,
                userName : from.username
            }
        },
        {upsert : true, new : true}
        )
        await ctx.reply(`Hey ${from.first_name}, Welcome to the world of Bots.`)
        await ctx.replyWithSticker('CAACAgIAAxkBAAMqZjOKJeRGs88efjzx_r-tAhPh_vAAAhMAA8A2TxOqs4f3fzjKpTQE')
    }
    catch(err) {
        console.log(err)
        await ctx.reply("Something went wrong")
    }
})
bot.command('generate', async(ctx) => {
    const today = new Date()
    const startOfDay = today.setHours(0,0,0,0)
    const endOfDay = today.setHours(23,59,59,999)
    const events = await Event.find({
        tgId : ctx.update.message.from.id,
        createdAt : {
            $gte : startOfDay,
            $lte : endOfDay
        }
    })
    if(events.length === 0){
        await ctx.reply("No events recorded for the day.")
        return
    }
    ctx.reply("OpenAI API not working...")
})
bot.on(message('text'), async(ctx) => {
    const from = ctx.update.message.from
    const text = ctx.update.message.text
    try{
        await Event.create({
            tgId : from.id,
            message : text
        })
        await ctx.reply("Noted ! Keep texting your thoughts. To generate the posts, just enter the command : /generate")
    }
    catch(err){
        console.log(err)
        await ctx.reply("Something went wrong ! Please try again later.")
    }
})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})