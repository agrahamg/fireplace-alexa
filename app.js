const Alexa = require('alexa-sdk');
const moment = require('moment');
const rp = require('request-promise');
const config = require('./config');

const commands = {
    down:       "full_down",
    up:         'full_up',
    off:        'off',
    on:         'on'
}

function sendToArduino(value,time){

    let body = {
      time:time,
      value:value,
      password:config.password
    }

    console.log(JSON.stringify(body))

    return rp({
      method: 'POST',
      uri: config.url,
      body: body,
      json:true
    })
}

let handlers = {

    'simple': function () {
        let slot = this.event.request.intent.slots.value.value
        let duration = moment.duration(this.event.request.intent.slots.time.value)
        let milis = duration.asMilliseconds()

        let p

        let command = commands[slot]
        if (command !== undefined) {
            p = sendToArduino(command, milis)
        } else {
            return this.emit(':tell', "I'm sorry, I don't know what you mean by " + slot + ".");
        }
        let response = "Ok, I'll turn the fireplace " + slot + (milis === 0 ? "" : " in " + duration.humanize())

        p.then(()=>{
          console.log('returned')
          return this.emit(':tell', response)
        },() =>{
            return this.emit(':tell', "something went wrong")
        })
    },

    "cancelTimer": function () {
        this.emit(':tell', "can't do that right now");
    }
}

exports.handler = function(event, context, callback) {
      var alexa = Alexa.handler(event, context);
      alexa.registerHandlers(handlers);
      alexa.execute();
  };
