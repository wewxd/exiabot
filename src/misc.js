const fs=require('fs')
const botmsg=require('./botmsg.json')
const rules=require('../config.json').moderation
let  mod={}
let lastWarningReset=new Date().getTime()

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


/* Structure de l'objet "mod", qui socke les derniers messages des utilisateurs pour vérifier si ils spamment:
 *
 * mod: {
 *     [guildid]: {
 *         [msg.author.id]: {
 *             warn: (int)                  // nombre d'avertissements déjà reçus
 *             msg: {
 *                 [timestamp]: {           // liste des derniers messages
 *                     userMention: (bool),
 *                     roleMention: (bool)
 *                 }
 *             }
 *         }
 *     }
 * }
 */
function moderation(guilds, guildid, msg){
    let timestamp=new Date().getTime()
    if(timestamp-lastWarningReset>1000*rules.warningReset){
        lastWarningReset=timestamp
        mod={}
    }
    if(!mod[guildid])mod[guildid]={}
    if(!mod[guildid][msg.author.id]) mod[guildid][msg.author.id]={warn: 0, msg: {}}
    mod[guildid][msg.author.id].msg[timestamp]={
        userMention:msg.mentions.users.first()?true:false,
        roleMention:msg.mentions.roles.first()||msg.mentions.everyone?true:false
    }
    let msgCount=0
    let userCount=0
    let roleCount=0
    for(let key in mod[guildid][msg.author.id].msg){
        if(parseInt(key)+1000*rules.time<timestamp) delete mod[guildid][msg.author.id].msg[key]
    }
    for(let key in mod[guildid][msg.author.id].msg){
        if(mod[guildid][msg.author.id].msg[key].userMention) userCount++
        if(mod[guildid][msg.author.id].msg[key].roleMention) roleCount++
        msgCount++
    }
    if(msgCount>=rules.maxAllowedMsg || userCount>=rules.maxUserMentions || roleCount>=rules.maxRoleMentions){
        if(mod[guildid][msg.author.id].warn<rules.warningCount){
            msg.channel.send('<@!'+msg.author.id+'> '+botmsg[guilds[guildid].lang].spamwarning)
            mod[guildid][msg.author.id].msg={}
            mod[guildid][msg.author.id].warn++
        }else{
            msg.channel.send(botmsg[guilds[guildid].lang].spamkicked)
            msg.guild.members.get(msg.author.id).kick()
            delete mod[guildid][msg.author.id]
        }
    }
}



module.exports={
    addGuild: addGuild,
    autorep: autorep,
    help: help,
    moderation: moderation
}
