require('dotenv').config();
var ConfigLoader = require("ConfigLoader");
var configL = new ConfigLoader();
const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const keepAlive = require('./keepReplitOn.js');
const path = require('node:path');
var nicks = {};
var blacklistedGames = ['356869127241072640', 'Genshin Impact', 'VALORANT', 'League of Legends'];
var msgDeaf = configL.load("automod").deafNick;
nicks = JSON.parse(fs.readFileSync('./nicks.json'));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences , GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'comandos');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
  	const command = require(filePath);
  	if ('data' in command && 'execute' in command) {
  		client.commands.set(command.data.name, command);
  	} else {
  		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  	}
	}
}

client.on('messageCreate', msg => {
    if(msg.author.id == 831596928474677308 || msg.author.id == 698211913179332621)
        client.channels.cache.get('933144931277623358').send('<@831596928474677308>').then((msg) => {msg.delete()});
        //msg.reply("Beware girls, the csgo gamesense god is talking.").then((msg) => {msg.delete()});
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    //console.log(oldPresence);
    if(newPresence.member.presence.status == 'offline'){
        //newPresence.member.setNickname('estou offline e sou gay', 'is offline');
        console.log("gay offline");
    }
    console.log('something changed for '+newPresence.member.id);
});

client.on('guildMemberUpdate', (oldM, newM) =>{
    if(newM.id == 287353383608778763){
        if(newM.nickname != 'REI DO COPA')
            newM.setNickname('REI DO COPA', 'REI DO COPA TA ON!');
        console.log('REI DO COPA FEZ ALGO!');
    }
    if(oldM.nickname != newM.nickname && newM.id != 287353383608778763 && newM.nickname != msgDeaf){
        nicks[newM.id] = newM.nickname;
        fs.writeFileSync('./nicks.json' ,JSON.stringify(nicks));
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    try{
        if(newState.member.id != newState.member.guild.ownerId){
            if(newState.deaf){
                if(!nicks[newState.member.id])
                    nicks[newState.member.id] = newState.member.nickname;
                newState.member.setNickname(msgDeaf, 'TA DEAFEN');
            }else{
                if(nicks[newState.member.id])
                    newState.member.setNickname(nicks[newState.member.id], 'TIROU DEAFEN');
                else
                    newState.member.setNickname(null, 'TIROU DEAFEN');
            }
            fs.writeFileSync('./nicks.json' ,JSON.stringify(nicks));
        }
      if(newState.streaming && newState.member.id != newState.member.guild.ownerId){
          for(var i=0;i<newState.member.presence.activities.length;i++){
              if(blacklistedGames.includes(newState.member.presence.activities[i].applicationId) || blacklistedGames.includes(newState.member.presence.activities[i].name))
                  newState.setChannel(null, 'is playing blacklisted game');
              else
                  console.log(newState.member.presence.activities[i].name+" : "+newState.member.presence.activities[i].applicationId);
          }
      }else
        console.log("owner beaming or no live");
    }catch(err){
        console.log(err);
    }
});

client.once('ready', c => {
	console.log("ready");
});

client.login(process.env['token']);
keepAlive();