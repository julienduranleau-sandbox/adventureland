import { initialize_party, logout_party, update_manager } from "./manager.js"
import { memory } from "./memory.js"
import { quests } from "./quests.js"
import { party_members, party_whitelist } from "./config.js"
import { transfer_inventory_to } from "./utils.js"

const is_main = parent.parent === parent

main_shared()

function main_shared() {
    if (is_main)
        main_unique()
    else
        parent.parent.addCharacter(window)
}

function main_unique() {
    console.clear()
    customize_ui()
    define_global_functions()
    memory.main_char_name = character.name

    memory.chars.push(window)
    assign_char_by_role(window)
    init_merchant_messaging(window)

    initialize_party(party_members)

    let last_heartbeat = -1

    setInterval(() => {
        if (parent.heartbeat === last_heartbeat) return
        last_heartbeat = parent.heartbeat

        clear_drawings()

        update_manager()

        const quest = quests[memory.quest_name]

        for (let c of memory.chars) {
            if (c.character.rip) {
                c.respawn()
            }
        }

        // loot with main
        loot()

        if (quest !== null) {
            quest.run()
        }

    }, 1000 / 60)
}

function define_global_functions() {
    window.on_party_request = name => {
        if (party_whitelist.includes(name)) {
            accept_party_request(name)
        }
    }

    window.on_destroy = () => {
        logout_party(party_members)
    }

    parent.addCharacter = c => {
        memory.chars.push(c)
        assign_char_by_role(c)
        init_merchant_messaging(c)
        c.send_party_request(memory.main_char_name)
    }
}

function customize_ui() {
    const codeui = parent.document.querySelector("#codeui")
    codeui.style.background = "transparent"
    codeui.style.border = "none"
    codeui.style.top = "auto"
    codeui.style.bottom = "456px"
    codeui.style.left = "-695px"
    codeui.style.boxShadow = "none"

    const maincode = parent.document.querySelector(".maincode")
    maincode.style.height = "0px"

    const bottomrightcodecorner = parent.document.querySelector("#bottomrightcodecorner")
    bottomrightcodecorner.style.display = "none"
}

function assign_char_by_role(c) {
    memory.chars_by_role[c.character.ctype + "s"].push(c)
}

function init_merchant_messaging(c) {
    c.character.on("cm", cm => {
        if (cm.name === "D3lMarket" && cm.message === "carrier_arrived") {
            transfer_inventory_to(c, "D3lMarket", true)
        }
    })
}