const fs=require('fs')
const botmsg=require('./botmsg.json')
const kick=require('./kick.json')

function setprefix(arg, guilds, guildid){
    if(!arg)return botmsg[guilds[guildid].lang].noprefix
    guilds[guildid].prefix=arg.substr(0, 5).replace(/ /g, '')
    fs.writeFile('./src/guilds.json', JSON.stringify(guilds), err=>{if(err)throw err})
    return botmsg[guilds[guildid].lang].newprefix+guilds[guildid].prefix
}

function setlanguage(arg, guilds, guildid){
    if(!botmsg[arg]) return botmsg[guilds[guildid].lang].nolang+Object.keys(botmsg).toString().replace(/,/, ', ')
    guilds[guildid].lang=arg
    fs.writeFile('./src/guilds.json', JSON.stringify(guilds), err=>{if(err)throw err})
    return botmsg[guilds[guildid].lang].lang
}
function stfu(ignored, channel, guilds, guildid){
    ignored.includes(channel)?ignored.splice(ignored.indexOf(channel), 1):ignored.push(channel)
    fs.writeFile('./src/ignored.json', JSON.stringify(ignored), err=>{if(err) throw err})
    return botmsg[guilds[guildid].lang][ignored.includes(channel)?'stfu':'speak']
}

function addresponse(arg, autorep, guilds, guildid){
    if(!arg)return botmsg[guilds[guildid].lang].noarg
    let sep=arg.indexOf('|')
    if(sep===-1)return botmsg[guilds[guildid].lang].addRespSyntax
    autorep[guildid][arg.substr(0,sep)]=arg.substr(sep+1)
    fs.writeFile('./src/autorep.json', JSON.stringify(autorep), err=>{if(err)throw err})
    return botmsg[guilds[guildid].lang].newrep
}

function delresponse(arg, autorep, guilds, guildid){
    if(!autorep[guildid][arg])return botmsg[guilds[guildid].lang].noresp
    delete autorep[guildid][arg]
    fs.writeFile('./src/autorep.json', JSON.stringify(autorep), err=>{if(err)throw err})
    return botmsg[guilds[guildid].lang].delrep
}

function delall(member, autorep, guilds, guildid){
    if(member.hasPermission('ADMINISTRATOR')){
        autorep[guildid]={}
        return botmsg[guilds[guildid].lang].delall
    }else{
        return botmsg[guilds[guildid].lang].noadmin
    }
}

function votekick(msg, guilds, guildid, voteTimeout, voteNb){
    if(!msg.mentions.users.first()){
        return botmsg[guilds[guildid].lang].needmention
    }else{
        let kicked=msg.mentions.users.first()
        let actTime=new Date().getTime()/1000|0
        if(!kick.voter[msg.author.id] || actTime-kick.voter[msg.author.id]>voteTimeout){
            if(kick.voted[kicked]){
                kick.voted[kicked].count-=(actTime-kick.voted[kicked].timer)/900|0
                if(kick.voted[kicked].count<0)kick.voted[kicked].count=0
            }else{
                kick.voted[kicked]={count: 0, timer: actTime}
            }
            kick.voter[msg.author.id]=actTime
            kick.voted[kicked].timer=actTime
            kick.voted[kicked].count++
            if(kick.voted[kicked].count>=voteNb){
                msg.guild.fetchInvites().then(invites=>{
                    let str=invites.first().url?invites.first().url:botmsg[guilds[guildid].lang].noinvite
                    kick.voted[kicked].count=0
                    fs.writeFile('./src/kick.json', JSON.stringify(kick), err=>{if(err)throw err})
                    try{
                        msg.guild.members.get(kicked.id).send(str)
                        setTimeout(()=>{msg.guild.members.get(kicked.id).kick()}, 800)
                    }catch(err){throw err}
                })
                return botmsg[guilds[guildid].lang].kicked
            }else{
                fs.writeFile('./src/kick.json', JSON.stringify(kick), err=>{if(err)throw err})
                return botmsg[guilds[guildid].lang].remainingvotes+(5-kick.voted[kicked].count)
            }
        }
        else{
            return botmsg[guilds[guildid].lang].waitvote+(voteTimeout+kick.voter[msg.author.id]-actTime)+botmsg[guilds[guildid].lang].waitvote2
        }
    }
}



module.exports={
    setprefix: setprefix,
    setlanguage: setlanguage,
    stfu: stfu,
    addresponse: addresponse,
    delresponse: delresponse,
    votekick: votekick,
    delall: delall
}
