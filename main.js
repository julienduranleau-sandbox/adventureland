const me = character
let mob = null

const baseURL = "https://raw.githubusercontent.com/D4ddy-LiLd4rk/AdventureLand/master/";

function update_test() {
    fetch(file).then(resp.text()).then(script => {
        upload_code(1, "Priest", script)
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
