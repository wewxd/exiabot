const fs=require('fs')
const botmsg=require('./botmsg.json')
const kick=require('./kick.json')

/**
 * Le Coconérateur : génère une phrase aléatoire à partir des expressions de DucCRN
 * @param void
 * @return String
 */
function coco() {
    var intro = ["ah gars,",
                 "eh mec,",
                 "",
                 "quesque tu baragouines planche à pain,",
                 "avec des des capotes,",
                 "mon pote,",
                 "jte cache pas que",
                 "ah gars jte cache pas que",
                 "ptdrrr",
                 "wsh",
                 "j'suis trop con",
                 "voici ma carte de friendzone : ",
                 "eh m. inspecteur gadget,"];
    var sujet = ["les filles",
                 "ta daronne",
                 "ma daronne la catcheuse",
                 "ta daronne la grosse",
                 "vos daronnes",
                 "ta mère",
                 "la shoah",
                 "les juifs",
                 "israel",
                 "ta personnalité inexistante",
                 "les palestiniens",
                 "ton daron",
                 "les noirs",
                 "les arabes",
                 "la palestine",
                 "maitre gims",
                 "ce son",
                 "wAllah",
                 "ce fils de pute"];
    var cmplmnt1 = ["dans ton tweet",
                    "",
                    "c'gros baiseur",
                    "on dirait ça",
                    "comme ça de temps en temps despi",
                    "dla grosse chiennasse,",
                    "pour en déglinguer deux trois",
                    "qui nous vole nos femmes",
                    "eh chui mort,",
                    "à part tweeter ça,"];
    var verbe = ["tambourine",
                 "envoie",
                 "baise",
                 "ça boit",
                 "casse",
                 "vanne",
                 "a cru c'était",
                 "ça nique",
                 "nique"];
    var objet = ["bien ta mère la pute",
                 "le meilleur rappeur",
                 "le plus gros raté de l'univers",
                 "les cocopops",
                 "des nudes",
                 "les puceaux",
                 "Jul",
                 "en Y",
                 "booba"];
    var cmplmnt2 = ["sa mère la tchoin",
                    "sa mère ptn",
                    "dans des camps de concentration",
                    "complètement",
                    "et meuf = putes",
                    "c'est insultant chtrouve",
                    "sur snap",
                    "plus vite qu'eminem",
                    "comme kaaris",
                    "je chiale ptdrrrrrrrrrrrrr",
                    "(classique du rap français)",
                    "ce gros fils de pute",
                    "merci pour cette analyse"];
    var fin = ["gros",
               "et toc",
               "",
               "hop",
               "ptdrrrr",
               "c'est fascinant",
               "add snap coconus",
               "ma princesse",
               "bref on s'en bat les couilles de toi fils de pute",
               "glisse DM",
               "oulah",
               "madaaaaaaaaaaaaaaaame",
               "euh, hein quoi ?",
               "(ADD SNAP COCONUUUUS)",
               "que l'islam nous protège"];
    var r = function(arrayStr) {
        var l = arrayStr.length;
        var str = arrayStr[Math.floor(Math.random() * l)];
        return str;
    };
    return r(intro) + " " + r(sujet) + " " + r(cmplmnt1) + " " + r(verbe) + " " + r(objet) + " " + r(cmplmnt2) + " " + r(fin);
}

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
    arg=arg.replace(/ +\|/, '|')
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
    delall: delall,
    votekick: votekick
}
