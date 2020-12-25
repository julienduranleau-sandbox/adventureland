import { run_quest } from 'http://68.107.27.193/delphes/quests.js'
import * as utils from 'http://68.107.27.193/delphes/utils.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null
window.is_tank = true

on_party_request = name => accept_party_request(name)
on_party_invite = name => accept_party_invite(name)

me.on("cm", data => {
    if (data.message.type === "position_request") {
        send_cm(data.name, {
            type: "position_answer",
            x: me.real_x,
            y: me.real_y,
            map: me.map
        })
    }
})

window.tick_interval = setInterval(() => {
    clear_drawings()

    if (me.rip) {
        active_quest = null
        respawn()
    }

    utils.form_party()

    use_hp_or_mp()
    loot()

    run_quest([
        "grinch",
        "snowman",
//        "candy_canes",
        "vampire",
        "phoenix",
        //"ghosts",
        // "bats_alternative",
        "bats",
//        "snakes",
        //"water_spirits",
    ])
    
    if (can_use("taunt")) {
        let party_members = []

        for (let entity_id in parent.entities) {
            let entity = parent.entities[entity_id]

            if (entity && entity.party === me.party) {
                party_members.push(entity.name)
            }
        }

        for (let entity_id in parent.entities) {
            let entity = parent.entities[entity_id]
            if (!entity || entity.type !== "monster") continue

            if (party_members.includes(entity.target)) {
                party_say(`Taunting for ${entity.target}`)
                use_skill("taunt", entity)
            }
        }
    }

    set_message(active_quest)

}, 1000 / 4)
