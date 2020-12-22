import { run_quest } from 'http://localhost/adventureland/quests.js'
import * as utils from 'http://localhost/adventureland/utils.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null

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

utils.form_party()

window.tick_interval = setInterval(() => {
    if (me.rip) {
        active_quest = null
        respawn()
    }

    use_hp_or_mp()
    loot()

    run_quest([
        "phoenix",
        // "snowman",
        // "turtles",
        // "bats_alternative",
        // "bats",
    ])

    set_message(active_quest)

}, 1000 / 4)
