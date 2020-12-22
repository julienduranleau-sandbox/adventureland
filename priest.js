import { run_quest } from 'http://68.107.27.193/delphes/quests.js'
import * as utils from 'http://68.107.27.193/delphes/utils.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null

utils.form_party()

window.tick_interval = setInterval(() => {
    let iris = get_player("Iriss")
    let luna = get_player("Lunaa")

    if (me.rip) {
        active_quest = null
        respawn()
    }

    loot()

    if (can_use("heal")) {
        // Heal when below 75%
        if (me.hp / me.max_hp < 0.75) {
            heal(me)
        }
        if (iris && iris.hp / iris.max_hp < 0.9) {
            heal(iris)
        }
        if (luna && luna.hp / luna.max_hp < 0.75) {
            heal(luna)
        }
    }

    if (me.mp - 300 < me.max_mp) {
        use_hp_or_mp()
    }

    if (me.mp === me.max_mp) {
        if (can_use("curse") && mob && !mob.dead) {
            use_skill("curse", mob)
        }
    }

    /**
     * TODO
     * 
     * Replace active quest with a custom assist on party with party member list
     * Follow, heal, buff, assist target
     *  - Will probably require the use of change_target and stuff instead of mob
     */
    run_quest([
        "snowman",
        "assist_iris",
        // "squigs",
        // "snakes"
    ])

    set_message(active_quest)

}, 1000 / 4)
