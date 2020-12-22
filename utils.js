export function form_party() {
    if (!me.party) {
        send_party_request("D3lphes")
    }

    on_party_request = name => accept_party_request(name)
    on_party_invite = name => accept_party_invite(name)
}

export function smart_target_and_attack(monster_filter_list) {
    if (!Array.isArray(monster_filter_list)) {
        monster_filter_list = [monster_filter_list]
    }

    for (let monster_filter of monster_filter_list) {
        if (!mob || mob.dead) {
            mob = get_nearest_monster(monster_filter)
            change_target(mob)
        } else {
            break
        }
    }

    smart_attack(mob)
}

export function smart_attack(monster, tank = null) {
    if (monster && !monster.dead) {
        if (tank) {
            if (tank.name === me.name) {
                move(monster.real_x + 25, monster.real_y)
            } else if (me.ctype === "priest" || me.ctype === "wizard" || me.ctype === "ranger") {
                move(monster.real_x - (monster.real_x - tank.real_x) * 2.5, monster.real_y - (monster.y - tank.real_y) * 2.5)
            } else {
                move(monster.real_x - (monster.real_x - tank.real_x) * -1, monster.real_y - (monster.y - tank.real_y) * -1)
            }
        } else {
            if (me.ctype === "priest" || me.ctype === "wizard" || me.ctype === "ranger") {
                move(monster.real_x + 50, monster.real_y)
            } else {
                move(monster.real_x + 25, monster.real_y)
            }
        }


        if (can_attack(monster)) {
            attack(monster)
        }
    }
}

export function distance_sq(entity1, entity2) {
    return (entity2.real_x - entity1.real_x) * (entity2.real_x - entity1.real_x) + (entity2.real_y - entity1.real_y) * (entity2.real_y - entity1.real_y)
}