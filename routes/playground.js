const express       = require('express');
const router        = express.Router();
const mongoose      = require('mongoose');
const config        = require('../config.js');

const Sandbox = require('../models/sandbox');
const Team = require('../models/team');

router.post('/', function(req, res, next) {
  if(req.body.channel_id == 'G7ML4LTGX' || req.body.channel_id == 'CBTT293EZ') {
    if(req.body.text) {
      var words = req.body.text.split(/\s+/);
      var action = words[0];
      var command = words[1];
      var dataArr = [];
      for(var i=2; i < words.length; i++ ) {
        dataArr.push(words[i])
      }
      switch (action) {
        case 'sandbox':
          if(typeof command == 'undefined') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Sandbox.find({}, (err, resp) => {
              if(err) logError(err)
              if(resp.length > 0 ) {
                var slackRes = {};
                var attachments = [];
                for(var i = 0; i < resp.length; i++) {
                  var attachment = {};
                  attachment.title = resp[i].name;
                  attachment.text = 'Alias: ' + resp[i].alias + '\nTeam: ' + resp[i].team + '\nUser: ' + resp[i].user;
                  if(resp[i].teamColor) attachment.color = resp[i].teamColor;
                  if(resp[i].jenkinsLink) attachment.title_link = resp[i].jenkinsLink;
                  setupActions(resp[i], req.body.user_name, attachment);
                  attachments.push(attachment)
                  slackRes.text = 'All the sandboxes in the playground'
                  slackRes.attachments = attachments;
                } 
                closeMongoConnection(command)
                res.status(200).send(slackRes);             
              } else {
                closeMongoConnection(command)
                res.status(200).send({text: 'No sandboxes found, try adding some with `/playground sandbox register {sandboxName} {sandboxAlias}`'})
              }
              
            })
          } else if (command == 'register') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Sandbox.find({'name':dataArr[0]}, (err, resp) => {
              if(err) logError(err)
              
              if(resp.length > 0 ) {
                closeMongoConnection(command)
                res.status(200).send({text:'This sandbox already exists, please choose a different name to add this box as.'})
              } else {
                var saveBox = new Sandbox();
                saveBox.name = dataArr[0];
                saveBox.jenkinsLink = 'http://'+dataArr[0]+':8081';
                dataArr.length > 1 ? saveBox.alias = dataArr[1] : saveBox.alias = '';
                saveBox.team = '';
                saveBox.user = '';
                saveBox.color = '';
  
                saveBox.save((err, savedBox) => {
                  if(err) logError(err)
                  closeMongoConnection(command)
                  res.status(200).send({response_type:'in_channel', text:'Sandbox '+ savedBox.name + ' saved!'})
                })
              }
            })
          } else if (command == 'delete') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Sandbox.deleteOne({name:dataArr[0]}, (err, resp) => {
              if(err) logError(err)
              closeMongoConnection(command)
              res.status(200).send({response_type:'in_channel', text:'Sandbox '+dataArr[0]+' deleted.'})
            })
          } else if (command == 'update') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Sandbox.findOneAndUpdate(
              {name: dataArr[0]},
              {alias: dataArr[1]},
              (err, resp) => {
                if(err) logError(err)
                closeMongoConnection(command)
                res.status(200).send({response_type: 'in_channel', text: 'Sandbox ' +dataArr[0]+ ' alias updated to:' + dataArr[1] })
              })
          } else if (command == 'team') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Sandbox.find({team:dataArr[0]}, (err, resp) => {
              if(err) logError(err)
  
              if(resp.length > 0 ) {
                var slackRes = {};
                var attachments = [];
                for(var i = 0; i < resp.length; i++) {
                  var attachment = {};
                  attachment.title = resp[i].name;
                  attachment.text = 'Alias: ' + resp[i].alias + '\nUser: ' + resp[i].user;
                  if(resp[i].teamColor) attachment.color = resp[i].teamColor;
                  if(resp[i].jenkinsLink) attachment.title_link = resp[i].jenkinsLink;
                  setupActions(resp[i], req.body.user_name, attachment);
                  attachments.push(attachment)
                  slackRes.text = 'All the sandboxes for '+dataArr[0]+' in the playground'
                  slackRes.attachments = attachments;
                } 
                closeMongoConnection(command)
                res.status(200).send(slackRes);             
              } else {
                closeMongoConnection(command)
                res.status(200).send({text: 'No sandboxes found for team ' + dataArr[0]});
              }
            })
  
          } else if (command == 'take') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
            var user = req.body.user_name;
            Sandbox.findOne({name: dataArr[0]}, (err, box) => {
              if(err) logError(err)
              if(box == null) res.status(200).send({text: 'Sorry but this sandbox '+dataArr[0]+' isnt registed'})
              if(box.user) {
                confirmTakeBox(box.user, dataArr[0], res);
              } else {
                box.user = user;
  
                Sandbox.findOneAndUpdate({name: box.name}, box, (err, savedBox) => {
                  if(err) logError(err);
                  closeMongoConnection(command)
                  res.status(200).send({response_type: 'in_channel', text:'User ' + box.user + ' now has box ' + box.name})
                }) 
              }
            })
          } else if (command == 'leave') {
            leaveBox(dataArr[0])
          } else if (command == 'help') {
            res.status(200).send({
              'text': "Specific sandbox related commands you can use",
              'attachments': [
                {
                  'title': '/Playground sandbox',
                  'text': 'Shows all sandboxes registered',
                  'color': '#F89406'
                },
                {
                  'title': '/Playground sandbox register {sandboxName} {optional:sandboxAlias}',
                  'text': 'Registers a box with a sandbox name, and an optional alias that you can use',
                  'color': '#2980b9'
                },
                {
                  'title': '/Playground sandbox update {sandboxName} {newalias}',
                  'text': 'Updates a sandbox to assign it a new or updated alias',
                  'color': '#F03434'
                },
                {
                  'title': '/Playground sandbox delete {sandboxName}',
                  'text': 'Deletes a sandbox by name',
                  'color': '#26A65B'
                },
                {
                  'title': '/Playground sandbox team {teamName}',
                  'text': 'Shows sandboxes for given team if registered',
                  'color': '#663399'
                },
                {
                  'title': '/Playground sandbox take {sandboxName}',
                  'text': 'Registers a sandbox for current user if available, otherwise prompts to take it from existing user',
                  'color': '#81CFE0'
                },
                {
                  'title': '/Playground sandbox leave {sandboxName}',
                  'text': 'Cleans a sandbox of its current user if available',
                  'color': '#6C7A89'
                },                      
                {
                  'fallback': 'Refer to the docs for more information at https://github.com/kevin-wynn/playground',
                  'actions': [
                    {
                      'type': 'button',
                      'text': 'Playground Docs',
                      'url': 'https://github.com/kevin-wynn/playground'
                    }
                  ]
                }
              ]
            });          
          }
  
          break;
        case 'team':
          // team route
          if(typeof command == 'undefined') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Team.find({}, (err, resp) => {
              if(err) logError(err)
              if(resp.length > 0 ) {
                var slackRes = {};
                slackRes.response_type = 'in_channel';
                var attachments = [];
                for(var i = 0; i < resp.length; i++) {
                  var attachment = {};
                  attachment.title = resp[i].name;
                  attachment.color = resp[i].color;
                  attachment.text = 'Color: ' + resp[i].color;
                  attachments.push(attachment)
                  slackRes.text = 'All teams playing in the playground'
                  slackRes.attachments = attachments;
                } 
                closeMongoConnection(command)
                res.status(200).send(slackRes);
              } else {
                closeMongoConnection(command)
                res.status(200).send({text:'It doesnt look like there are any teams playing in the playground. Maybe try registering one with `/playground team register {teamName} {teamColor}`'})
              }
            })
          } else if(command == 'register') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Team.find({name: dataArr[0]}, (err, resp) => {
              if(err) logError(err)
              var saveTeam = new Team({
                name: dataArr[0]
              })
  
              if(dataArr[1]) saveTeam.color = '#'+dataArr[1]
  
              saveTeam.save((err, resp) => {
                if(err) {
                  logError(err)
                } else {
                  closeMongoConnection(command)
                  res.status(200).send({response_type: 'in_channel', text:'Team ' + dataArr[0] + ' saved!'});
                }
              })
            })
          } else if (command == 'sandbox') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Team.findOne({name: dataArr[0]}, (err, team) => {
              if(err) logError(err)
              if(team === null) res.status(200).send({text:'Sorry but we couldnt find this team in the playground ' + dataArr[0] })
              var color;
              if(team.color) var color = team.color;
              Sandbox.findOneAndUpdate({name:dataArr[1]}, {team: dataArr[0], teamColor:color}, (err, resp) => {
                closeMongoConnection(command)
                if(resp === null) {
                  res.status(200).send({text:'Sorry but we couldnt find this sandbox in the playground ' + dataArr[1]})
                } else if (err) {
                  res.status(200).send({text: 'Unable to update sandbox for team', err})
                } else if (!err) {
                  res.status(200).send({response_type: 'in_channel', text:'Team '+dataArr[0]+ ' registered to box ' + dataArr[1]})
                }
              })            
            })
  
          } else if (command == 'delete') {
            mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  
            Team.deleteOne({name:dataArr[0]}, (err, resp) => {
              if(err) logError(err)
              closeMongoConnection(command)
              res.status(200).send({response_type:'in_channel', text:'Team '+dataArr[0]+' deleted.'})
            })
          } else if (command == 'help') {
            res.status(200).send({
              'text': "Specific team related commands you can use",
              'attachments': [
                {
                  'title': '/Playground team',
                  'text': 'Shows all teams registered',
                  'color': '#F89406'
                },
                {
                  'title': '/Playground team register {teamName} {optional:teamColor}',
                  'text': 'Registers a team with a team name, and an optional team color that you can use',
                  'color': '#2980b9'
                },
                {
                  'title': '/Playground team update {teamName} {newColor}',
                  'text': 'Updates a team to assign it a new or updated color',
                  'color': '#F03434'
                },
                {
                  'title': '/Playground team delete {teamName}',
                  'text': 'Deletes a team by name',
                  'color': '#26A65B'
                },
                {
                  'title': '/Playground team sandbox {teamName} {sandboxName}',
                  'text': 'Registers a sandbox to a team by teamname and sandboxname',
                  'color': '#663399'
                },              
                {
                  'fallback': 'Refer to the docs for more information at https://github.com/kevin-wynn/playground',
                  'actions': [
                    {
                      'type': 'button',
                      'text': 'Playground Docs',
                      'url': 'https://github.com/kevin-wynn/playground'
                    }
                  ]
                }
              ]
            });          
          }
          break;
        case 'user':
          res.status(200).send({text:'Nothing for users specifically right now, if you are trying to take a sandbox you want to use `/Playground sandbox take {sandboxName}`'})
          break;
        case 'help':
          res.status(200).send({
            'text': "Hey and welcome to the playground. First off I'd recommend reading over the actual docs to see all available commands. But you can get started with:",
            'attachments': [
              {
                'title': '/Playground sandbox',
                'text': 'See all the sandboxes registered on the playground',
                'color': '#2980b9'
              },
              {
                'title': '/Playground team',
                'text': 'See all the teams in the playground right now',
                'color': '#F03434'
              },
              {
                'fallback': 'Refer to the docs for more information at https://github.com/kevin-wynn/playground',
                'actions': [
                  {
                    'type': 'button',
                    'text': 'Playground Docs',
                    'url': 'https://github.com/kevin-wynn/playground'
                  }
                ]
              }
            ]
          });
          break;
        default:
          // no command found return helper
          res.status(200).send("I'm sorry this command doesn't work on the playground. Maybe try something like /playground help to see available commands.")
          break;
      }
    }    
  } else if (req.body.payload) {
    var payload = JSON.parse(req.body.payload);
    if(payload.callback_id == 'take_sandbox') {
      if(JSON.parse(req.body.payload).actions[0].value != 'no') {
        takeBox(payload, res);
      } else {
        closeMongoConnection(command)
        res.status(200).send({text:'Leaving the sandbox alone for now'})
      }
    } else if (payload.callback_id == 'take_sandbox_from_list') {
      mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
      Sandbox.findOne({name: payload.actions[0].value}, (err, sandbox) => {
        if(err) logError(err)
        if(sandbox.user) {
          confirmTakeBox(sandbox.user, payload.actions[0].value ,res)
        } else {
          takeBox(payload, res)
        }
      })
    } else if (payload.callback_id == 'leave_sandbox_from_list') {
      leaveBox(payload.actions[0].value, res);
    }  
  } else {
    res.status(200).send({text:'Sorry but this command is not available outside of the playground channel for now'})
  }
});

// reusable methods
var takeBox = (payload, res) => {
  var sandbox = payload.actions[0].value;
  var user = payload.user.name;
  mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  Sandbox.findOneAndUpdate({name:sandbox}, {user:user}, (err, resp) => {
    if(err) logError(err)
    closeMongoConnection('takeBox')
    res.status(200).send({response_type: 'in_channel', text:'User ' + user + ' now has box ' + sandbox})
  })     
}

var leaveBox = (sandboxName, res) => {
  mongoose.connect(config.mongoConnect, {dbName: 'playground', useNewUrlParser: true});
  Sandbox.findOneAndUpdate({name: sandboxName}, {user: ''}, (err, box) => {
    if(err) logError(err)
    closeMongoConnection('leaveBox')
    res.status(200).send({response_type: 'in_channel', text:sandboxName + ' is now free for someone else to play in'})
  })  
}

var confirmTakeBox = (user, sandboxName, res) => {
  res.status(200).send({text: 'This box is already registered to: ' + user, attachments: [{
    title: 'Take this box from them?',
    callback_id: 'take_sandbox',
    actions: [
      {
        'type': 'button',
        'name': 'yes',
        'text': 'Yes',
        'value': sandboxName
      },
      {
        'type': 'button',
        'name': 'no',
        'text': 'No',
        'value': 'no'                    
      }
    ]
  }]});
}

var setupActions = (sandbox, currentUser, attachment) => {
  if(sandbox.user == currentUser) {
    attachment.callback_id = 'leave_sandbox_from_list';
    attachment.actions = [
      {
        'type': 'button',
        'name': 'takeBox',
        'text': 'Leave this sandbox',
        'value': sandbox.name
      }
    ];
  } else {
    attachment.callback_id = 'take_sandbox_from_list';
    attachment.actions = [
      {
        'type': 'button',
        'name': 'takeBox',
        'text': 'Take this sandbox',
        'value': sandbox.name
      }
    ];                  
  }
}

var logError = (err) => {
  var errorPrefix = 'ERROR:';
  console.error(errorPrefix+err);
  closeMongoConnection('logError')
  res.status(200).send({text:errorPrefix+err+' If this error continues to occur you can file a ticket here: https://github.com/kevin-wynn/playground'})
}

var closeMongoConnection = (ctx) => {
  console.log('Closing mongo connection for '+ctx);
  mongoose.connection.close();
}

module.exports = router;
