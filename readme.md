
## Chat

### Installation
To install this project .

clone it (adapt to your needs)
```  
git clone git@github.com:thib3113/chat.git  
cd chat  
```  
Install and build client / server :
```  
npm install  
npm run build  
```  
### Start

to start the server you just need to call (on the project root folder)
```  
npm run start:server  
```  

to start a client you just need to call (on the project root folder)
```  
npm run start:client  
```  

you cal also use `npm start` in the folders `server` or `client` .

### Documentation
The technical documentation is available here : https://thib3113.github.io/chat/modules.html

The user documentation is available here : https://github.com/thib3113/chat/wiki

### API
The only API avalaible is used to get metrics (on the port logged by the server on start) :
```
GET /metrics
```
will return :
```json
{
    "uptime": "00:08:34",
    "totalMessages": 2509,
    "mostUsedWords": [
        {
            "word": "the",
            "uses": 110
        }
    ],
    "messagesStats": {
        "fiveMinutes": {
            "number": 1466,
            "avgSize": 5.078444747612552
        },
        "thirtyMinutes": {
            "number": 2509,
            "avgSize": 5.061777600637704
        },
        "oneHour": {
            "number": 2509,
            "avgSize": 5.061777600637704
        }
    },
    "users": [
        {
            "nickName": "test",
            "messagesInLastHour": 6729,
            "pingAvg": 1.5098039215686274,
            "uptime": "00:08:32"
        }
    ]
}

```

| Key | Data Type | Description|
|--|--|--|
| uptime | string formated | the uptime of the server |
| totalMessages | number | the number of messages from the start of the server |
| mostUsedWords | Array\<object> | the ten most used words, with the number of uses |
| mostUsedWords.word | string | the word |
| mostUsedWords.uses | number | the number of uses |
| messagesStats | Record\<string, object> | some messages stats for the last 5/30/60 minutes |
| messagesStats.fiveMinutes | object | the last five minutes stats |
| messagesStats.thirtyMinutes | object | the last thirty minutes stats |
| messagesStats.oneHour | object | the last one hour (60 minutes) stats |
| messagesStats.\<duration>.number | number | number of messages in this duration |
| messagesStats.\<duration>.avgSize | number | the average size of each messages |
| users | Array\<object>  | list of connected users with some stats |
| users.nickName | string | the uniq nickName of this user |
| users.pingAvg | number | the average of ping timer for this user |
| users.uptime | string formated | the uptime for this user |
