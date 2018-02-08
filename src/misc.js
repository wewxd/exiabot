const fs=require('fs')
const botmsg=require('./botmsg')

function addGuild(id, guilds, autorep){
    guilds[id]={lang: 'en', prefix: '/'}
    autorep[id]={}
    fs.writeFile('./src/guilds.json', JSON.stringify(guilds), err=>{return err ? err :  console.log('New guild added')})
    fs.writeFile('./src/autorep.json', JSON.stringify(autorep), err=>{return err ? err :  console.log('wow')})
}

function autorep(msg, guildid, autorep){
    if(autorep[guildid][msg]){
        msg.channel.send(autorep[guildid][msg.content])
    }
}

function help(guilds, guildid, cmd){
    let str=botmsg[guilds[guildid].lang].guildprefix+guilds[guildid].prefix+'\n'
    str+=botmsg[guilds[guildid].lang].cmdlist+Object.keys(cmd).toString().replace(/,/g, ', ')
    return str
}

module.exports={
    addGuild: addGuild,
    autorep: autorep,
    help: help
}
