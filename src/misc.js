const fs=require('fs')

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

module.exports={
    addGuild: addGuild,
    autorep: autorep
}
