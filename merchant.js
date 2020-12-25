import { sleep } from 'http://68.107.27.193/delphes/utils.js'

window.me = character

const items_to_sell = [

]

const items_to_upgrade = [
    { name: "ornamentstaff", level: 7 },
    { name: "candycanesword", level: 7 },
    { name: "merry", level: 7 },
    { name: "mittens", level: 6 },
]

const items_to_compound = [
    { name: "hpbelt", level: 3 },
    { name: "hpamulet", level: 3 },
    { name: "ringsj", level: 3 },
    { name: "dexring", level: 3 },
    { name: "strring", level: 3 },
    { name: "intring", level: 3 },
    { name: "vitring", level: 3 },
    { name: "strearing", level: 3 },
    { name: "dexearing", level: 3 },
    { name: "intearing", level: 3 },
    { name: "vitearing", level: 3 },
    { name: "wbook0", level: 2 },
]

tick()
async function tick() {
    await compound_items()
//    await sell_items()
    await upgrade_items()

    setTimeout(tick, 1000/4)
}

async function move_to_bank() {
    set_message("Banking")
    if (me.bank === undefined || me.bank === null) {
        await smart_move({x: 0, y: -76, map:"bank"})
    }
}

async function deposit_gold(amount) {
    await move_to_bank()
    bank_store(amount)
}

async function withdraw_gold(amount) {
    await move_to_bank()
    bank_store(amount)
}

async function store_inventory() {
    await move_to_bank()

    for (let i = 0; i < me.items.length; i++) {
        for (let bank_name in me.bank) {
            if (bank_name.indexOf("items") !== 0) continue
            if (me.bank[bank_name].filter(item => item === null).length === 0) continue

            await parent.socket.emit("bank", { operation: "swap", pack: bank_name, str: -1, inv: i});
        }
    }

    await sleep(1)
}

async function compound_items() {
    await move_to_bank()

    bank_withdraw(me.bank.gold)

    await store_inventory()

    let n_items_to_compound = 0

    set_message("Getting items")
    // retrieve items from bank
    for (let bank_name in me.bank) {
        let bank_items = me.bank[bank_name]

        for (let i = 0; i < bank_items.length; i++) {

            for (let item_to_compound of items_to_compound) {
                if (bank_items[i] === null) continue

                if (bank_items[i].name === item_to_compound.name && bank_items[i].level < item_to_compound.level) {
                    await retrieve(bank_name, i)
                    n_items_to_compound += 1
                }

                if (["cscroll0", "cscroll1", "cscroll2"].includes(bank_items[i].name)) {
                    await retrieve(bank_name, i)
                }

                if (inventory_space() < 5) break
                else console.log(inventory_space())
            }
            if (inventory_space() < 5) break
        }
        if (inventory_space() < 5) break
    }

    if (n_items_to_compound === 0) return

    await move_outside()

    set_message("Compounding")

    let done_compounding = false

    while (!done_compounding) {
        done_compounding = true

        let items_by_level = get_compoundable_items_by_level()

        for (let item_to_compound of items_to_compound) {
            for (let level = 0; level < item_to_compound.level; level++) {
                let index = `${item_to_compound.name}-${level}`
                if (items_by_level[index] && items_by_level[index].length >= 3) {
                    const grade = item_grade(me.items[items_by_level[index][0]])
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

function get_compoundable_items_by_level() {
    let list = {}

    for (let i = 0; i < me.items.length; i++) {
        let item = me.items[i]
        if (item === null) continue
        if (items_to_compound.filter(item_type => item_type.name === item.name).length === 0) continue

        if (!list[`${item.name}-${item.level}`]) list[`${item.name}-${item.level}`] = [i]
        else list[`${item.name}-${item.level}`].push(i)
    }

    return list
}

async function upgrade_items() {
    await move_to_bank()

    bank_withdraw(me.bank.gold)

    await store_inventory()

    let n_items_to_upgrade = 0

    set_message("Getting items")
    // retrieve items from bank
    for (let item_to_upgrade of items_to_upgrade) {
        for (let bank_name in me.bank) {
            let bank_items = me.bank[bank_name]

            for (let i = 0; i < bank_items.length; i++) {
                if (bank_items[i] === null) continue

                if (bank_items[i].name === item_to_upgrade.name && bank_items[i].level < item_to_upgrade.level) {
                    await retrieve(bank_name, i)
                    n_items_to_upgrade += 1
                }

                if (["scroll0", "scroll1", "scroll2"].includes(bank_items[i].name)) {
                    await retrieve(bank_name, i)
                }

                if (inventory_space() < 5) break
            }
            if (inventory_space() < 5) break
        }
        if (inventory_space() < 5) break
    }

    if (n_items_to_upgrade === 0) {
        console.log("No items to compound")
        return
    }

    await move_outside()

    set_message("Upgrading")

    let done_upgrading = false

    while (!done_upgrading) {
        done_upgrading = true

        for (let item_to_upgrade of items_to_upgrade) {
            for (let i = 0; i < me.items.length; i++) {
                if (me.items[i] === null) continue

                if (me.items[i].name === item_to_upgrade.name && me.items[i].level < item_to_upgrade.level) {
                    const grade = item_grade(me.items[i])

                    if (locate_item(`scroll${grade}`) === -1) {
                        await buy_with_gold(`scroll${grade}`, 1)
                    }

                    await upgrade(i, locate_item(`scroll${grade}`))

                    done_upgrading = false
                }
            }
        }
    }

    set_message("Done upgrading")
}

async function retrieve(bank_name, bank_index, inventory_index = -1) {
    parent.socket.emit("bank", { operation: "swap", pack: bank_name, str: bank_index, inv: inventory_index })
    await sleep(0.2)
}

function inventory_space() {
    return me.items.filter(item => item === null).length
}

async function move_outside() {
    set_message("Going outside")
    await smart_move({ x: -217, y: -50, map: "main" })
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

