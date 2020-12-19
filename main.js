const me = character
let mob = null

const base_url = "https://raw.githubusercontent.com/julienduranleau-sandbox/adventureland/master/main.js"
const script_name = "Priest"

function update_script() {
    fetch(base_url).then(resp => resp.text()).then(script => {
        parent.api_call("save_code", { code: script, slot: 1, name: script_name, auto: true, electron: true }, { promise: true });
    })
}



function tick() {
    if (me.rip) respawn()

    use_hp_or_mp()

    if (me.party !== "Garrus") {
        send_party_request("Garrus", "invite")
    }

    loot()

    // show_json(mob)

    if (!mob || mob.dead) {
        mob = get_nearest_monster({ type: "squigtoad" })
    }

    if (!mob) {
        mob = get_nearest_monster({ type: "squig" })
    }

    // Heal when below 75%
    if (me.hp / me.max_hp < 0.75) {
        set_message("Heal")
        heal(me)
    }

    if (!is_in_range(mob)) {
        move(mob.x, mob.y)
        set_message("Move")
    } else {
        if (can_attack(mob)) {
            attack(mob)
        }

        //set_message("Attack");
    }
}

setInterval(tick, 1000 / 4)
