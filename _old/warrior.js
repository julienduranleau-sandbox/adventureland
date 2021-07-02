import { run_quest } from './quests.js'
import * as utils from './utils.js'
import * as comms from './comms.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null
window.is_tank = true

comms.init_comms()

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
        "grinch_active",
        "snowman",
        //        "candy_canes",
        "vampire_passive",
        "phoenix_passive",
        "ghosts",
        // "bats_alternative",
        //"bats",
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
