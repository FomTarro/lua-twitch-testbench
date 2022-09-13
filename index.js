const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const { AppConfig } = require('./app.config');

const app = express();
// Makes an http server out of the express server
const httpServer = http.createServer(app);
// Makes a websocket server out of the http server
const wss = new WebSocket.Server({ server: httpServer, path: '/test' });

// in MS
let interval = 1000;
let timer = undefined;
let eventType = 0;

wss.on('connection', (ws) => {
    console.log("WS client connected!");
    ws.on('message', (message) => {
        console.log(message)
        const parsed = JSON.parse(message);
        if(parsed.type === "FREQUENCY"){
            interval = parsed.data ? parsed.data : 1000;
            console.log(`updating frequency to: ${parsed.data}`);
        }else if(parsed.type === "EVENT_TYPE"){
            eventType = Math.min(Math.max(parsed.data, 0), eventList.length)
            console.log(`updating event type to: ${parsed.data}`);
        }
    });
});

wss.on('close', (ws) => {
    if(timer){
        clearTimeout(timer);
    }
});

async function launch() {
    const port = AppConfig.PORT;
    const baseDirectory = path.join(__dirname, './public');

    // Tells the browser to redirect to the given URL
    app.get(['', '/'], (req, res) => {
        const file = path.join(baseDirectory, 'index.html')
        res.sendFile(file);
    });

    // Starts the http server
    httpServer.listen(port, () => {
        // code to execute when the server successfully starts
        console.log(`started on ${port}`);
    });
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

// HEY LUA: Add randomization/cusomization inside the "Customize" functions
// Payload definitions follow below

const BITS_EVENT_V1_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-bits-events-v1.44322889`,
        message: {
            data: {
                user_name: `dallasnchains`,
                channel_name: `dallas`,
                user_id: 129454141,
                channel_id: 44322889,
                time: `2017-02-09T13:23:58.168Z`,
                chat_message: `cheer10000 New badge hype!`,
                bits_used: 10000,
                total_bits_used: 25000,
                context: `cheer`,
                badge_entitlement: {
                    new_version: 25000,
                    previous_version: 10000
                }
            },
            version: 1.0,
            message_type: `bits_event`,
            message_id: `8145728a4-35f0-4cf7-9dc0-f2ef24de1eb6`
        }
    }
}

function customize_BITS_EVENT_V1_JSON(){
    const copy = clone(BITS_EVENT_V1_JSON);
    copy.data.message.data.channel_name = "LUA V LUCKY";
    return copy;
}

const BITS_EVENT_V2_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-bits-event-v2.46024993`,
        message: {
            data: {
                user_name: `jwp`,
                channel_name: `bontakun`,
                user_id: 95546976,
                channel_id: 46024993,
                time: `2017-02-09T13:23:58.168Z`,
                chat_message: `cheer10000 New badge hype!`,
                bits_used: 10000,
                total_bits_used: 25000,
                context: `cheer`,
                badge_entitlement: {
                    new_version: 25000,
                    previous_version: 10000
                }
            },
            version: 1.0,
            message_type: `bits_event`,
            message_id: `8145728a4-35f0-4cf7-9dc0-f2ef24de1eb6`,
            is_anonymous: true
        }
    }
}

function customize_BITS_EVENT_V2_JSON(){
    const copy = clone(BITS_EVENT_V2_JSON);
    copy.data.message.data.user_name = "LUA V LUCKY";
    return copy;
}

const CHANNEL_POINTS_EVENT_JSON = {
    type: `reward-redeemed`,
    data: {
        timestamp: `2019-11-12T01:29:34.98329743Z`,
        redemption: {
            id: `9203c6f0-51b6-4d1d-a9ae-8eafdb0d6d47`,
            user: {
                id: 30515034,
                login: `davethecust`,
                display_name: `davethecust`
            },
            channel_id: 30515034,
            redeemed_at: `2019-12-11T18:52:53.128421623Z`,
            reward: {
                id: `6ef17bb2-e5ae-432e-8b3f-5ac4dd774668`,
                channel_id: 30515034,
                title: `hit a gleesh walk on stream`,
                prompt: `cleanside's finest`,
                cost: 10,
                is_user_input_required: true,
                is_sub_only: false,
                image: {
                    url_1x: `https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-1.png`,
                    url_2x: `https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-2.png`,
                    url_4x: `https://static-cdn.jtvnw.net/custom-reward-images/30515034/6ef17bb2-e5ae-432e-8b3f-5ac4dd774668/7bcd9ca8-da17-42c9-800a-2f08832e5d4b/custom-4.png`
                },
                default_image: {
                    url_1x: `https://static-cdn.jtvnw.net/custom-reward-images/default-1.png`,
                    url_2x: `https://static-cdn.jtvnw.net/custom-reward-images/default-2.png`,
                    url_4x: `https://static-cdn.jtvnw.net/custom-reward-images/default-4.png`
                },
                background_color: `#00C7AC`,
                is_enabled: true,
                is_paused: false,
                is_in_stock: true,
                max_per_stream: { is_enabled: false, max_per_stream: 0 },
                should_redemptions_skip_request_queue: true
            },
            user_input: `yeooo`,
            status: `FULFILLED`
        }
    }
}

function customize_CHANNEL_POINTS_EVENT_JSON(){
    const copy = clone(CHANNEL_POINTS_EVENT_JSON);
    return copy;
}


const CHANNEL_SUB_EVENT_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-subscribe-events-v1.44322889`,
        message: {
            user_name: `tww2`,
            display_name: `TWW2`,
            channel_name: `mr_woodchuck`,
            user_id: 13405587,
            channel_id: 89614178,
            time: `2015-12-19T16:39:57-08:00`,
            sub_plan: 1000,
            sub_plan_name: `Channel Subscription (mr_woodchuck)`,
            cumulative_months: 9,
            streak_months: 3,
            context: `resub`,
            is_gift: false,
            sub_message: {
                message: `A Twitch baby is born! KappaHD`,
                emotes: [
                    {
                        start: 23,
                        end: 7,
                        id: 2867
                    }
                ]
            }
        }
    }
}

function customize_CHANNEL_SUB_EVENT_JSON(){
    const copy = clone(CHANNEL_SUB_EVENT_JSON);
    return copy;
}

const CHANNEL_SUB_GIFT_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-subscribe-events-v1.44322889`,
        message: {
            user_name: `tww2`,
            display_name: `TWW2`,
            channel_name: `mr_woodchuck`,
            user_id: 13405587,
            channel_id: 89614178,
            time: `2015-12-19T16:39:57-08:00`,
            sub_plan: 1000,
            sub_plan_name: `Channel Subscription (mr_woodchuck)`,
            months: 9,
            context: `subgift`,
            is_gift: true,
            sub_message: {
                message: ``,
                emotes: null
            },
            recipient_id: 19571752,
            recipient_user_name: `forstycup`,
            recipient_display_name: `forstycup`
        }
    }
}

function customize_CHANNEL_SUB_GIFT_JSON(){
    const copy = clone(CHANNEL_SUB_GIFT_JSON);
    return copy;
}

const eventList = [
    customize_BITS_EVENT_V1_JSON,
    customize_BITS_EVENT_V2_JSON,
    customize_CHANNEL_POINTS_EVENT_JSON,
    customize_CHANNEL_SUB_EVENT_JSON,
    customize_CHANNEL_SUB_GIFT_JSON
]

function publish() {
    // makes a copy
    const payload = eventList[eventType]();
    // console.log(`Publishing event type: ${eventType}`)
    if(wss && wss.clients){
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });
    }
    timer = setTimeout(publish, interval);
}

launch();
publish();