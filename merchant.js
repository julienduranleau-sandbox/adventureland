import { sleep, inventory_space } from './utils.js'
import { party_members, bank_names, items_to_sell, items_to_upgrade, items_to_compound } from "./config.js"

window.carrier_requests = []
window.recovering_items = false

for (let character_name of party_members) {
    send_party_request(character_name)
}

setInterval(function () {
    use_hp_or_mp()
    mluck_spam()
}, 600)

routine()

async function routine() {
    await assist_party()
    await sell_items()
    await compound_items()
    await upgrade_items()
    // await handle_carrier_requests()
    game_log("Done")
    await sleep(2)
    routine()
}

async function assist_party() {
    set_message("Carrier")

    let party = get_party()

    if (inventory_space() !== character.items.length) {
        await move_to_bank()
        bank_deposit(character.gold)
        await store_inventory()
    }

    for (let name of party_members) {
        if (!party[name]) continue

        set_message("Carrier: " + name)
        await smart_move(party[name]) // x, y, map info stored in party member object
        send_cm(name, "carrier_arrived")
        console.log("CM Sent to " + name)
        await sleep(10)

        if (inventory_space() === 0) {
            use_skill("use_town"); await sleep(8)
            await move_to_bank()
            bank_deposit(character.gold)
            await store_inventory()
        }
    }

    use_skill("use_town"); await sleep(8)
    await move_to_bank()
    bank_deposit(character.gold)
    await store_inventory()
}

async function handle_carrier_requests() {
    if (carrier_requests.length === 0) return

    set_message("Carrier")

    return new Promise(async (character_done) => {
        await store_inventory()
        let name = carrier_requests.shift()
        set_message(`Carrier ${name}`)

        comms.once("carrier_request_done", data => {
            if (data.name === name) {
                character_done()
                clearInterval(follow_interval)
            }
        })

        let waiting_for_position = false

        let follow_interval = setInterval(() => {
            let player = get_player(name)
            if (player) {
                smart_move(player)
                send_cm(name, { type: "carrier_arrived" })
            } else if (!waiting_for_position) {
                waiting_for_position = true
                comms.once("position_answer", async (data) => {
                    if (data.name === name) {
                        await smart_move({
                            x: data.message.x,
                            y: data.message.y,
                            map: data.message.map
                        })
                        waiting_for_position = false
                    }
                })
                send_cm(name, { type: "position_request" })
            }
        }, 2000)
    })
}

async function compound_items() {
    set_message("Compounding")

    await move_to_bank()
    bank_withdraw(character.bank.gold)
    await store_inventory()

    let all_items = character.items.slice()

    for (let bank_name of bank_names) {
        all_items = all_items.concat(character.bank[bank_name])
    }

    const compoundable_items = get_compoundable_items_by_level(all_items)

    if (Object.values(compoundable_items).length === 0) return

    set_message("Comp: Getting items")

    await retrieve(item => {
        if (["cscroll0", "cscroll1", "cscroll2"].includes(item.name)) {
            return true
        }
        if (items_to_compound.filter(item_to_compound => item_to_compound.name === item.name).length !== 0) {
            if (compoundable_items[`${item.name}-${item.level}`]) {
                return true
            }
        }
        return false
    }, 3)

    await move_outside()

    set_message("Comp: Merge")

    let done_compounding = false

    while (!done_compounding) {
        done_compounding = true

        let items_by_level = get_compoundable_items_by_level()

        for (let item_to_compound of items_to_compound) {
            for (let level = 0; level < item_to_compound.level; level++) {
                let index = `${item_to_compound.name}-${level}`
                if (items_by_level[index] && items_by_level[index].length >= 3) {
                    const grade = item_grade(character.items[items_by_level[index][0]])
                    if (locate_item(`cscroll${grade}`) === -1) {
                        await buy_with_gold(`cscroll${grade}`, 1)
                    }
                    await compound(items_by_level[index][0], items_by_level[index][1], items_by_level[index][2], locate_item(`cscroll${grade}`))
                    done_compounding = false
                }
            }
        }
    }

    set_message("Done compounding")
}

async function sell_items() {
}

function get_compoundable_items_by_level(items = null, filter_minimum_3 = true) {
    let list = {}
    if (!items) items = character.items

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        if (item === null) continue
        if (items_to_compound.filter(item_type => item_type.name === item.name).length === 0) continue

        if (!list[`${item.name}-${item.level}`]) list[`${item.name}-${item.level}`] = [i]
        else list[`${item.name}-${item.level}`].push(i)
    }

    for (let key in list) {
        if (list[key].length < 3) {
            delete list[key]
        }
    }

    return list
}

async function upgrade_items() {
    set_message("Upgrading")

    await move_to_bank()
    bank_withdraw(character.bank.gold)
    await store_inventory()

    let n_items_to_upgrade = 0

    set_message("Upgrading: getting items")

    await retrieve(item => {
        if (["scroll0", "scroll1", "scroll2"].includes(item.name)) {
            return true
        }

        let item_to_upgrade = items_to_upgrade.filter(item_to_upgrade => item_to_upgrade.name === item.name)

        if (item_to_upgrade.length > 0) {
            item_to_upgrade = item_to_upgrade[0]

            if (item.name === item_to_upgrade.name && item.level < item_to_upgrade.level) {
                n_items_to_upgrade += 1
                return true
            }
        }

        return false
    }, 3)

    console.log(`${n_items_to_upgrade} items to upgrade`)

    if (n_items_to_upgrade === 0) return

    await move_outside()

    set_message("Upgrading: crafting")

    let done_upgrading = false

    while (!done_upgrading) {
        done_upgrading = true

        for (let item_to_upgrade of items_to_upgrade) {
            for (let i = 0; i < character.items.length; i++) {
                if (character.items[i] === null) continue

                if (character.items[i].name === item_to_upgrade.name && character.items[i].level < item_to_upgrade.level) {
                    const grade = item_grade(character.items[i])

                    if (locate_item(`scroll${grade}`) === -1) {
                        await buy_with_gold(`scroll${grade}`, 1)
                    }

                    await upgrade(i, locate_item(`scroll${grade}`))

                    done_upgrading = false
                }
            }
        }
    }
}

async function retrieve(filter_fn, keep_n_empty_slots = 0) {
    for (let bank_name of bank_names) {
        for (let i = 0; i < character.bank[bank_name].length; i++) {
            if (character.bank[bank_name][i] === null) continue
            if (filter_fn(character.bank[bank_name][i])) {
                parent.socket.emit("bank", { operation: "swap", pack: bank_name, str: i, inv: -1 })
                await sleep(0.2)
                if (inventory_space() <= keep_n_empty_slots) {
                    return
                }
            }
        }
    }
}

async function move_outside() {
    await smart_move({ x: -217, y: -50, map: "main" })
}

async function move_to_bank() {
    if (character.bank === undefined || character.bank === null) {
        await smart_move({ x: 0, y: -76, map: "bank" })
    }
}

async function deposit_gold(amount) {
    if (character.gold === 0) return

    await move_to_bank()
    bank_store(amount)
}

async function withdraw_gold(amount) {
    await move_to_bank()
    bank_store(amount)
}

async function store_inventory() {
    if (inventory_space() === character.items.length) return

    await move_to_bank()

    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i]) {
            bank_store(i)
            await sleep(0.1)
        }
    }
}

function mluck_spam() {
    for (let id in parent.entities) {
        const entity = parent.entities[id]

        if (entity.type !== "character") continue
        if (entity.npc !== undefined) continue
        if (distance(character, entity) > 320) continue
        if (entity.s.mluck && entity.s.mluck.f === character.name) continue
        if (entity.ctype === "merchant" && entity.name !== character.name) continue

        use_skill("mluck", entity.id)
        break
    }
    for (let i = 0; i < parent.entities.length; i++) {
        let entity = parent.entities[i]
    }
}
/*
craft
compound
exchange
find_npc
item_grade
item_properties
item_value
locate_item
transport
*/


/*
active=true;
parent.code_active=true;
set_message("Code Active");
parent.socket.emit("code",{run:1});
*/

