import { inventory_space } from 'http://68.107.27.193/delphes/utils.js'

let listeners = {

}

export function once(event_name, fn) {
    on(event_name, fn, true)
}

export function on(event_name, fn, once = false) {
    let id = Date.now() + Math.random()

    if (!listeners[event_name]) {
        listeners[event_name] = []
    }

    listeners[event_name].push({ id, fn, once })

    return id
}

export function off(id) {
    for (let event_name in listeners) {
        listeners[event_name] = listeners[event_name].filter(e => {
            return e.id !== id
        })
    }
}

export function trigger(event_name, params) {
    if (!listeners[event_name]) {
        return false
    }

    for (let i = listeners[event_name].length - 1; i >= 0; i--) {
        listeners[event_name][i].fn(...params)
        if (listeners[event_name][i].once) {
            listeners[event_name].splice(i, 1)
        }
    }
}

export function init_comms() {
    on_party_request = name => accept_party_request(name)
    on_party_invite = name => accept_party_invite(name)

    me.all((event_name, data) => {
        trigger(event_name, [data])
    })

    on("cm", data => {
        console.log(`CM from ${data.name} : ${data.message.type}`)
        trigger(data.message.type, [data])
    })

    on("loot", data => {
        if (inventory_space() < 7) {
            send_cm("D3lMarket", {
                type: "carrier_request"
            })
        }
    })

    on("position_request", data => {
        send_cm(data.name, {
            type: "position_answer",
            x: me.real_x,
            y: me.real_y,
            map: me.map
        })
    })
    
    on("carrier_request", data => {
        if (["D3lphes", "Iriss", "Lunaa"].includes(data.name)) {
            if (carrier_requests.indexOf(data.name === -1)) {
                carrier_requests.push(data.name)
            }
        }
    })

    on("carrier_arrived", data => {
        if (inventory_space() === character.items.length) {
            send_cm(data.name, { type: "carrier_request_done" })
        } else {
            for (i = 0; i < me.items.length; i++) {
                send_item("D3lMarket", i, 500)
            }
        }
    })
}
