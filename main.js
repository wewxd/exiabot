const discord=require('discord.js')
const client=new discord.Client()

const conf=require('./config.json')
const guilds=require('./src/guilds.json')
const ignored=require('./src/ignored.json')
const autorep=require('./src/autorep.json')
const cmd=require('./src/cmd.js')
const misc=require('./src/misc.js')


client.on('ready', ()=>{
    client.user.setActivity(conf.playing)
    console.log(conf.playing)
})

client.on('message', msg=>{
    if(msg.channel.type=='text' && msg.author.bot==false){

        let guildid='a'+msg.guild.id  // 'a' because variable names can't start with a number

        if(msg.content===conf.helpcmd)msg.channel.send(misc.help(guilds, guildid, cmd))

        if(!guilds[guildid]||!autorep[guildid]){ // If the bot doesn't know the server the message is from
            misc.addGuild(guildid, guilds, autorep)
        }

        if(!ignored.includes(msg.channel.id)){
            if(msg.content.startsWith(guilds[guildid].prefix)){  // command parser
                msg.content=msg.content.substr(guilds[guildid].prefix.length)
                let command=msg.content.match(/\w+/)[0]
                let arg=msg.content.substr(msg.content.match(/\w+/)[0].length+1)
                switch(command){
                    case 'setprefix':
                        msg.channel.send(cmd.setprefix(arg, guilds, guildid))
                        break
                    case 'setlanguage':
                        msg.channel.send(cmd.setlanguage(arg, guilds, guildid))
                        break
                    case 'stfu':
                        msg.channel.send(cmd.stfu(ignored, msg.channel.id, guilds, guildid))
                        break
                    case 'addresponse':
                        msg.channel.send(cmd.addresponse(arg, autorep, guilds, guildid))
                        break
                    case 'delresponse':
                        msg.channel.send(cmd.delresponse(arg, autorep, guilds, guildid))
                        break
                    case 'delall':
                        msg.channel.send(cmd.delall(msg.member, autorep, guilds, guildid))
                        break
                    case 'votekick':
                        msg.channel.send(cmd.votekick(msg,guilds, guildid, conf.votekick.time, conf.votekick.count))
                }
            }
            misc.autorep(msg, guildid, autorep)
            misc.moderation(guilds, guildid, msg)
        }else{
            if(msg.content===guilds[guildid].prefix+'talk'){
                msg.channel.send(cmd.stfu(ignored, msg.channel.id, guilds, guildid))
            }
        }
    }
})


client.login(conf.token)
