import { run_quest } from 'http://68.107.27.193/delphes/quests.js'
import * as utils from 'http://68.107.27.193/delphes/utils.js'

window.me = character
window.mob = null
window.active_quest = null
window.quest_data = null
window.is_tank = false

on_party_request = name => accept_party_request(name)
on_party_invite = name => accept_party_invite(name)

window.tick_interval = setInterval(() => {
    if (me.rip) {
        active_quest = null
        respawn()
    }

    utils.form_party()

    use_hp_or_mp()
    loot()


    // if (me.mp === me.max_mp) {
    //     if (can_use("invis") && mob && !mob.dead) {
    //         use_skill("invis", me)
    //     }
    // }
    // 

    /*
    let t = get_target_of(get_player("Iriss"))
    if (can_attack(t)) {
        attack(t)
    }
    */

    run_quest([
        "grinch",
        "snowman",
//        "candy_canes",
        "assist_iris",
//        "snakes"
    ])

    set_message(active_quest)

}, 1000 / 4)
