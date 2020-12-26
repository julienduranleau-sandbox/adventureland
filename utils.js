export function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

export function form_party() {
    if (!me.party) {
        send_party_request("D3lphes")
    }
}

export function smart_target_and_attack(monster_filter_list, use_formation = false, kill_safespot = null) {
    if (!Array.isArray(monster_filter_list)) {
        monster_filter_list = [monster_filter_list]
    }

    if (!mob || mob.dead || !mob.target) {
        for (let monster_filter of monster_filter_list) {
            if (!mob || mob.dead) {
                mob = get_nearest_monster(monster_filter)
                change_target(mob)
            } else {
                break
            }
        }
    }

    if (mob && !mob.dead) {
        smart_attack(mob, use_formation, kill_safespot)
    }
}

function smart_attack_formation(monster, kill_safespot) {
    if (is_tank) {
        let healer = get_player("D3lphes") 
        let bubble_color = 0xFF0000

        if (healer) {
            let healer_distance = distance_sq(me, healer)

            if (healer_distance < 150 * 150) {
                bubble_color = 0x00FF00

                if (monster.target && kill_safespot) {
                    move(kill_safespot.x, kill_safespot.y)
                } else {
                    move(monster.real_x + 25, monster.real_y)
                }
                
                if (can_attack(monster)) {
                    attack(monster) //.then((data) => reduce_cooldown("attack", me.ping * 0.95) )
                }
            } else {
                if (kill_safespot) move(kill_safespot.x, kill_safespot.y)
            }
        } else {
            if (kill_safespot) move(kill_safespot.x, kill_safespot.y)
        }

        draw_circle(me.x, me.y, 150, 3, bubble_color)

    } else {
        const tank = get_player("Iriss")
        const angle = Math.atan2(monster.y - tank.y, monster.x - tank.x)

        if (me.ctype === "priest" || me.ctype === "wizard" || me.ctype === "ranger") {
            move(tank.x - Math.cos(angle) * 30, tank.y - Math.sin(angle) * 30)
        } else {
            move(tank.x + Math.cos(angle + Math.PI/3) * 40, tank.y + Math.sin(angle + Math.PI/3) * 30)
        }

        if (can_attack(monster)) {
            attack(monster).then((data) => reduce_cooldown("attack", me.ping * 0.95) )
        }
    }
}

function smart_attack_solo(monster) {
    if (me.ctype === "priest" || me.ctype === "wizard" || me.ctype === "ranger") {
        move(monster.real_x + 75, monster.real_y)
    } else {
        move(monster.real_x + 25, monster.real_y)
    }

    if (can_attack(monster)) {
        attack(monster).then((data) => reduce_cooldown("attack", me.ping * 0.95) )
    }
}

export function smart_attack(monster, use_formation = false, kill_safespot = null) {
    if (use_formation) {
        smart_attack_formation(monster, kill_safespot)
    } else {
        smart_attack_solo(monster)
    }
}

export function distance_sq(entity1, entity2) {
    return (entity2.real_x - entity1.real_x) * (entity2.real_x - entity1.real_x) + (entity2.real_y - entity1.real_y) * (entity2.real_y - entity1.real_y)
}

export function inventory_space(inventory = null) {
    if (inventory) return inventory.filter(slot => slot === null).length
    else return me.items.filter(slot => slot === null).length
}
