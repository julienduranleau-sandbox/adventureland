import { run_quest } from 'http://68.107.27.193/delphes/quests.js'
import * as utils from 'http://68.107.27.193/delphes/utils.js'
import * as comms from 'http://68.107.27.193/delphes/comms.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null
window.is_tank = false

comms.init_comms()

window.tick_interval = setInterval(() => {
    let iris = get_player("Iriss")
    let luna = get_player("Lunaa")

    utils.form_party()
    
    if (me.rip) {
        active_quest = null
        respawn()
    }

    loot()

    if (!is_on_cooldown("heal")) {
        if (iris && iris.hp / iris.max_hp < 0.85) {
            heal(iris)
        } else if (me.hp / me.max_hp < 0.75) {
            heal(me)
        } else if (luna && luna.hp / luna.max_hp < 0.75) {
            heal(luna)
        }
    }

    use_hp_or_mp()

    if (me.mp === me.max_mp) {
        if (can_use("curse") && mob && !mob.dead) {
            use_skill("curse", mob)
        }
    }

    run_quest([
        "grinch_active",
        "snowman",
//        "candy_canes",
        "assist_iris",
        // "squigs",
        //"bats"
    ])

    set_message(active_quest)

}, 1000 / 4)
