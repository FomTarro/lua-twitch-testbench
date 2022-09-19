const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const { AppConfig } = require('./app.config');
const ChannelPointRedeemsList = require('./models');

const app = express();
// Makes an http server out of the express server
const httpServer = http.createServer(app);
// Makes a websocket server out of the http server
const wss = new WebSocket.Server({ server: httpServer, path: '/test' });

// in MS
let interval = 1000;
let timer = undefined;
let bitMin = 100;
let bitMax = 10000;
let channelRedeemNames = [];

wss.on('connection', (ws) => {
    console.log("WS client connected!");
    sendChannelRedeemsList();
    ws.on('message', (message) => {
        console.log(message)
        const parsed = JSON.parse(message);
        if (parsed.type === "FREQUENCY") {
            interval = parsed.data.value ? parsed.data.value : 1000;
            console.log(`updating frequency to: ${parsed.data}`);
        } else if (parsed.type === "FREQUENCY_ENABLED") {
            if (parsed.data.enabled === true && timer === undefined) {
                publishLoop()
            } else if (parsed.data.enabled === false) {
                stopPublish();
            }
        } else if (parsed.type === "BIT_RANGES") {
            bitMin = parsed.data.min;
            bitMax = parsed.data.max;
        } else if (parsed.type === "CHANNEL_POINT_REDEEMS") {
            channelRedeemNames = parsed.data.filter(function (e) { return e.length > 0 });
        } else if (parsed.type === "EVENT_TYPE") {
            const eventType = Math.min(Math.max(parsed.data.value, 0), eventList.length)
            eventList[eventType].enabled = parsed.data.checked;
            console.log(`updating event type ${eventType} to: ${parsed.data.checked}`);
        } else if (parsed.type === "EVENT_PUBLISH_INSTANT") {
            const eventType = Math.min(Math.max(parsed.data, 0), eventList.length);
            sendOneOff(eventType);
        }else if(parsed.type === "CHANNEL_POINT_REDEEMS_REQUEST"){
            sendChannelRedeemsList();
        } else if (parsed.type === "STATE_REQUEST") {
            ws.send(JSON.stringify({ type: "STATE_RESPONSE", data: { frequency: { value: interval, enabled: timer !== undefined }, events: eventList, bits: { min: bitMin, max: bitMax }, redeems: channelRedeemNames } }));
        }
    });
});

wss.on('close', (ws) => {

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

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getRandomUser() {
    const id = makeID(10);
    return {
        display_name: `USER_${id}`,
        user_name: `user_${id}`,
        user_id: stringToNumber(id)
    }
}

function stringToNumber(str) {
    let hash = 0, i, chr;
    if (str.length === 0) {
        return hash;
    }
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return parseInt(hash);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// HEY LUA: Add randomization/cusomization inside the "Customize" functions
// Payload definitions follow below

const STREAMER_CHANNEL_NAME = "LuaVLucky";
const STREAMER_CHANNEL_ID = 123456789

const BITS_EVENT_V1_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-bits-events-v1.` + STREAMER_CHANNEL_ID,
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
            message_type: `bits_events`,
            message_id: `8145728a4-35f0-4cf7-9dc0-f2ef24de1eb6`
        }
    }
}

function customize_BITS_EVENT_V1_JSON() {
    const copy = clone(BITS_EVENT_V1_JSON);
    const user = getRandomUser();
    copy.data.message.data.user_name = user.user_name;
    copy.data.message.data.user_id = user.channel_id;
    copy.data.message.data.channel_name = STREAMER_CHANNEL_NAME;
    copy.data.message.data.channel_id = STREAMER_CHANNEL_ID;

    copy.data.message.data.bits_used = getRandomInt(bitMin, bitMax);
    return twitchify(copy);
}

const BITS_EVENT_V2_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-bits-events-v2.` + STREAMER_CHANNEL_ID,
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
            message_type: `bits_events`,
            message_id: `8145728a4-35f0-4cf7-9dc0-f2ef24de1eb6`,
            is_anonymous: true
        }
    }
}

function customize_BITS_EVENT_V2_JSON() {
    const copy = clone(BITS_EVENT_V2_JSON);
    const user = getRandomUser();
    copy.data.message.data.user_name = user.display_name;
    copy.data.message.data.user_id = user.user_id;
    copy.data.message.data.channel_name = STREAMER_CHANNEL_NAME
    copy.data.message.data.channel_id = STREAMER_CHANNEL_ID;

    copy.data.message.data.bits_used = getRandomInt(bitMin, bitMax);
    return twitchify(copy);
}

const CHANNEL_POINTS_EVENT_JSON = {
    type: "MESSAGE",
    data: {
        topic: "channel-points-channel-v1." + STREAMER_CHANNEL_ID,
        message: {
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
                        title: `redeem title`,
                        prompt: `text prompt`,
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
                    status: `FULFILLED`
                }
            }
        }
    }
}

function customize_CHANNEL_POINTS_EVENT_JSON() {
    const copy = clone(CHANNEL_POINTS_EVENT_JSON);
    const user = getRandomUser();

    copy.data.message.data.redemption.user.login = user.user_name;
    copy.data.message.data.redemption.user.display_name = user.display_name;
    copy.data.message.data.redemption.user.id = user.user_id;

    copy.data.message.data.redemption.reward.title = channelRedeemNames.length > 0 ? channelRedeemNames[Math.floor((Math.random() * channelRedeemNames.length))] : "MYSTERY REDEEM";
    copy.data.message.data.redemption.reward.id = stringToNumber(copy.data.message.data.redemption.reward.title);
    copy.data.message.data.redemption.reward.channel_id = STREAMER_CHANNEL_ID;
    return twitchify(copy);
}

const CHANNEL_SUB_EVENT_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-subscribe-events-v1.` + STREAMER_CHANNEL_ID,
        message: {
            user_name: `tww2`,
            display_name: `TWW2`,
            channel_name: `mr_woodchuck`,
            user_id: 13405587,
            channel_id: 89614178,
            time: `2015-12-19T16:39:57-08:00`,
            sub_plan: 1000,
            sub_plan_name: `Channel Subscription`,
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

function customize_CHANNEL_SUB_EVENT_JSON() {
    const user = getRandomUser();

    const copy = clone(CHANNEL_SUB_EVENT_JSON);
    copy.data.message.user_name = user.user_name;
    copy.data.message.display_name = user.display_name;
    copy.data.message.user_id = user.user_id;
    copy.data.message.channel_name = STREAMER_CHANNEL_NAME;
    copy.data.message.sub_plan_name = `Channel Subscription ${copy.data.message.channel_name}`;
    copy.data.message.channel_id = STREAMER_CHANNEL_ID;
    return twitchify(copy);
}

const CHANNEL_SUB_GIFT_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `channel-subscribe-events-v1.` + STREAMER_CHANNEL_ID,
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

function customize_CHANNEL_SUB_GIFT_JSON() {
    const copy = clone(CHANNEL_SUB_GIFT_JSON);
    const user = getRandomUser();
    copy.data.message.user_name = user.user_name;
    copy.data.message.display_name = user.display_name;
    copy.data.message.user_id = user.user_id;
    copy.data.message.channel_name = STREAMER_CHANNEL_NAME;
    copy.data.message.channel_id = STREAMER_CHANNEL_ID;

    const recipient = getRandomUser();
    copy.data.message.recipient_user_name = recipient.user_name;
    copy.data.message.recipient_display_name = recipient.display_name;
    copy.data.message.recipient_id = recipient.user_id;
    return twitchify(copy);
}

const FOLLOW_JSON = {
    type: `MESSAGE`,
    data: {
        topic: `following.` + STREAMER_CHANNEL_ID,
        message: {
            display_name: `LuckyRadio`,
            username: `luckyradio`,
            user_id: 629200915
        }
    }
}

function customize_FOLLOW_JSON() {
    const copy = clone(FOLLOW_JSON);
    const user = getRandomUser();
    copy.data.message.username = user.user_name;
    copy.data.message.display_name = user.display_name;
    copy.data.message.user_id = user.user_id;
    return twitchify(copy);
}

function twitchify(obj){
    if(obj.data && obj.data.message){
        obj.data.message = JSON.stringify(obj.data.message);
    }
    return obj;
}

const STREAMELEMENTS_DONATION_JSON = {
    _id: `62ef1aa31b93434238ed86d9`,
    channel: `5fb777f4921bf01357ced464`,
    type: `tip`,
    provider: `twitch`,
    createdAt: `2022-08-07T01:50:56.168Z`,
    data: {
        tipId: `62ef1a8095363a53a92b9be0`,
        username: `LuaVLucky`,
        amount: 1,
        currency: `USD`,
        message: `wooooo`,
        avatar: `https://cdn.streamelements.com/static/default-avatar.png`
    },
    updatedAt: `2022-08-07T01:50:56.168Z`,
    activityId: `62ef1aa31b93434238ed86d9`
}

function customize_STREAMELEMENTS_DONATION_JSON() {
    const copy = clone(STREAMELEMENTS_DONATION_JSON);
    const user = getRandomUser();
    copy.data.username = user.user_name;
    copy.data.amount = getRandomInt(bitMin, bitMax);
    return copy;
}

const eventList = [
    { name: "Bits V1", func: customize_BITS_EVENT_V1_JSON, enabled: false, quantity: () => {return 1} },
    { name: "Bits V2", func: customize_BITS_EVENT_V2_JSON, enabled: false, quantity: () => {return 1} },
    { name: "Channel Points", func: customize_CHANNEL_POINTS_EVENT_JSON, enabled: false, quantity: () => {return 1} },
    { name: "Subscription", func: customize_CHANNEL_SUB_EVENT_JSON, enabled: false, quantity: () => {return 1} },
    { name: "Subscription (Gift)", func: customize_CHANNEL_SUB_GIFT_JSON, enabled: false, quantity: () => {return Math.floor(Math.random() * 100)} },
    { name: "Follow", func: customize_FOLLOW_JSON, enabled: false, quantity: () => {return 1}},
    { name: "Donation (StreamElements)", func: customize_STREAMELEMENTS_DONATION_JSON, enabled: false, quantity: () => {return 1} },
]

function sendPayload(payload) {
    if (wss && wss.clients) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload));
            }
        });
    }
}

function publishLoop() {
    // makes a copy
    const possibleEvents = eventList.filter(function (e) { return e.enabled === true });
    if (possibleEvents.length > 0) {
        const chosen = possibleEvents[Math.floor((Math.random() * possibleEvents.length))];
        const quantity = chosen.quantity()
        for(let i = 0; i < quantity; i++){
            const payload = chosen.func();
            sendPayload(payload);
        }
    }
    timer = setTimeout(publishLoop, interval);
}

function stopPublish() {
    if (timer) {
        clearTimeout(timer);
    }
    timer = undefined;
}

function sendOneOff(index) {
    if (index >= 0 && index < eventList.length) {
        const chosen = eventList[index];
        const quantity = chosen.quantity()
        for(let i = 0; i < quantity; i++){
            const payload = chosen.func();
            sendPayload(payload);
        }
    }
}

function sendChannelRedeemsList(){
    const redeems = channelRedeemNames.map((x) => {return {name: x, id: stringToNumber(x)}; });
    sendPayload(new ChannelPointRedeemsList(STREAMER_CHANNEL_ID, redeems));
}

launch();
publishLoop();