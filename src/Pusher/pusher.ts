import Pusher from "pusher";

export const pusher = new Pusher({
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    appId: process.env.PUSHER_ID,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: process.env.PUSHER_TLS === "true" ? true : false,
    encrypted: process.env.PUSHER_ENCRPT === "true" ? true : false,
})
export const channel: string = "lireddit"