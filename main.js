const Discord = require("discord.js");
const token = require("./token.json");
const UserBot = new Discord.Client({DisableEveryone: true});
const commands = require("./commands.json");
const ImgFile = require("./images.json");
const fs = require("fs")
const SteamAPI = require('steamapi');
const steam = new SteamAPI('steam token');
const nym = require('nodeyourmeme');
const {app, BrowserWindow} = require('electron');
const html = require('html');


let win
function createWindow () {
  win = new BrowserWindow({width: 530, height: 240, frame:true})
  win.loadFile('./index.html')
  //win.setMenu(null)
  win.on('closed', () => {
    process.exit()
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function UpdateActivity(){
  var selectedValue = document.getElementById("ActivityTypeList").value;
  var selectedGame = document.getElementById("ActivityGame").value;
  //if((selectedValue !== 'none') && (selectedGame !== null)){
  console.log('Updated Status' + ` to ${selectedValue} ${selectedGame} `)
  UserBot.user.setActivity(selectedGame, {type: selectedValue,})
  //}
}

function AddImage(){
  var ImageFile = document.getElementById("ImageFile").value || args[1];
  var ImageName = document.getElementById("ImageAlias").value || args[0];
  if((ImageName) && (ImageFile)){
    if(!ImgFile[ImageName]){
      ImgFile[ImageName] = {
        ImageName: ImageFile
      };
    }
    fs.writeFile("./images.json", JSON.stringify(ImgFile), (err) => {
      if (err) console.log(err)
    });
  }
}



UserBot.on("ready", async () => {
  console.log(`Bot Helper is Online on '${UserBot.user.username}' !`);
});

UserBot.on("message", async message => {

  if(message.author.id !== UserBot.user.id) return;
  if(message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if(cmd === `${commands.Activity}`){
    message.delete().catch();
    let AType = args[0];
    let AGame = args.join(" ").slice(2);

    if(!AGame) return

    if(!AType){
      UserBot.user.setActivity(`${AGame}`);
      return
    }
    if(((AType === 'p') || (AType === 'l') || (AType === 'w') || (AType === 's')) && (AGame !== null)){
      if(AType === 'p'){
        UserBot.user.setActivity(`${AGame}`, {type: `PLAYING`,})
      }
      if(AType === 'l'){
        UserBot.user.setActivity(`${AGame}`, {type: `LISTENING`,})
      }
      if(AType === 'w'){
        UserBot.user.setActivity(`${AGame}`, {type: `WATCHING`,})
      }
      if(AType === 's'){
        UserBot.user.setActivity(`${AGame}`, {type: `STREAMING`,})
      }
    }
  }
  if(cmd === `${commands.Image}`){
    let image = args[0];
    message.delete().catch();
    if(!image) return;
    if(!ImgFile[image]) return;
    message.channel.send({
      files: [
        `./images/${ImgFile[image].ImageName}`
      ]
    });
  }
  if(cmd === `${commands.AddImage}`){
    message.delete().catch();
    let ImageName = args[0];
    let ImageFile = args[1];
    AddImage()
  if(cmd === `${commands.TestImageName}`){
    message.delete().catch();
    let nameFile = args[0];
    if(ImgFile[nameFile]){
      message.channel.send(`"${ImgFile[nameFile].ImageName}" is affilied with "${nameFile}"`).then(msg => {msg.delete(5000)});
    }
  }
  if(cmd === `${commands.GetID}`){
    message.delete().catch();
    let GTarget = args[0];
    let target = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(GTarget === 'guild'){
      message.channel.send(`GuildID : '${message.guild.id}'`).then(msg => {msg.delete(10000)});
    }else{
      if(!target){
        message.channel.send(`UserID of <@${message.author.id}> : '${message.author.id}'`).then(msg => {msg.delete(10000)});
      }
      if(target){
        message.channel.send(`UserID of <@${target.id}> : '${target.id}'`).then(msg => {msg.delete(10000)});
      }
    }
  }
  if(cmd === `${commands.Meme}`){
    message.delete().catch();
    let Querry = args.join(" ");
    if(Querry === 'random'){
      nym.random().then(meme => {
        let mEmbed = new Discord.RichEmbed()
        .setDescription(meme.name)
        .addField('Description: ', meme.about);
        message.channel.send(mEmbed);

      });
    }else{
       nym.search(Querry).then(meme => {
         let mEmbed = new Discord.RichEmbed()
         .setDescription(meme.name)
         .addField('Description: ', meme.about);
         message.channel.send(mEmbed);
       });
     }
   }
  if(cmd === `CC`){
    message.delete().catch();
    for (let i = 0;i < 100; i++){
      console.log(" ");
    }
  }
});


UserBot.login(token.token);
