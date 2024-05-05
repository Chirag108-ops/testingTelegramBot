import express from 'express'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import User from './src/models/User.js'
import Event from './src/models/Event.js'
import dbconnect from './src/config/db.js'
import OpenAI from 'openai'
const app = express()
dotenv.config()
dbconnect()
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})
const bot = new Telegraf(process.env.BOT_TOKEN)
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
    // try{
    //     const chatCompletion = await openai.chat.completions.create({
    //         messages : [
    //             {
    //                 role : 'system',
    //                 content : 'Act as a senior copywriter, you write highly engaging posts for linkedin, facebook and twitter using provided thoughts/events throughout the day.'
    //             },
    //             {
    //                 role : 'user',
    //                 content : `Write like a human, for humans. Craft three engaging social media posts tailored for linkedin, twitter and facebook audiences. Use Simple language. Use given time labels just to understand the order of the event, don't mention the time in the posts. Each post should creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the repective platform's audience, encouraging interaction, and driving interest in the events : ${events.map((event) => event.message).join(',')}`
    //             }
    //         ],
    //         model : process.env.OPENAI_MODEL
    //     })
    //     console.log(chatCompletion)
    // }
    // catch(err){
    //     console.log(err)
    //     await ctx.reply("Something went wrong ! Please try again later.")
    // }
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
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))