require('dotenv').config();
const axios = require('axios');
const needle = require('needle');
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const token = process.env.TWITTER_BEARER_TOKEN;
const port = process.env.PORT;
const host = process.env.HOST;

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
});




//post streams
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id';

const rules = [{value:'(I need backup!)'}, {value:'(Battle ID)'}];

const getTwitterRules = () => {
  axios.get(rulesURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then( (response) => {
    console.log(response.data);
    return response.data;
  })
  .catch( (err) => {
    console.eror(err);
  });
}

const setTwitterRules = () => {
  const data = {
    add: rules,
  }
  axios.post(rulesURL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then( (response) => {
    console.log(response.data);
  })
  .catch( (err) => {
    console.log(err);
  });
}

const deleteTwitterRules = (currentRules) => {
  // if(!Array.isArray(currentRules.data)) {
  //   return null;
  // }

  // const ids = currentRules.data.map( (rule) => rule.id);

  const data = {
    delete: {
      ids: currentRules,
    },
  };

  axios.post(rulesURL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  .then( (response) => {
    console.log(response.data);
  })
  .catch( (err) => {
    console.log(err);
  });
}

// getTwitterRules();

// deleteTwitterRules(['1486150262548877313', '1486150262548877312']);

// setTwitterRules();


const streamTweets = () => {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  stream.on('data', (data) => {
    try {
        const json = JSON.parse(data);
        console.log(json);
        io.emit('tweet', json);
    } catch (error) {

    }
  })
}

io.on('connection', (socket) => {
  console.log('Client connected');
});

streamTweets();


server.listen(port, () => console.log(`Listening on: http://${host}:${port}`));