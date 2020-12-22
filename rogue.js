import { run_quest } from 'http://localhost/adventureland/quests.js'
import * as utils from 'http://localhost/adventureland/utils.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null

utils.form_party()

window.tick_interval = setInterval(() => {
    if (me.rip) {
        active_quest = null
        respawn()
    }

    use_hp_or_mp()
    loot()


    // if (me.mp === me.max_mp) {
    //     if (can_use("invis") && mob && !mob.dead) {
    //         use_skill("invis", me)
    //     }
    // }

    run_quest([
        "snowman",
        //"squigs",
        "assist_iris",
        // "snakes"
    ])

    set_message(active_quest)

}, 1000 / 4)
