import { memory } from './memory.js'

export function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

export function reach_monster(c, type, range = 1000) {
    for (let id in c.parent.entities) {
        let m = c.parent.entities[id]
        if (m.type != "monster" || !m.visible || m.dead) continue
        if (m.mtype != type) continue
        if (c.parent.distance(c.character, m) < 1000) {
            if (c.smart.moving) c.stop()
            return true
        }
    }

    if (!c.smart.moving) {
        c.smart_move(type)
    }

    return false
}

export function heal_and_regen_party() {
    let party_members = Object.keys(get_party())
        .map(get_entity)
        .filter(x => x !== undefined)

    for (let c of memory.chars_by_role.priests) {
        const need_healing = party_members
            .filter(a => a.hp < a.max_hp - 300)
            .sort((a, b) => {
                a.max_hp - a.hp > b.max_hp - b.hp
            })

        if (need_healing.length === 0) break

        if (c.can_heal(need_healing[0])) {
            c.parent.next_skill.attack = new Date("2042-01-01")
            c.heal(need_healing[0])
        }
    }

    for (let c of memory.chars) {
        c.use_hp_or_mp()
    }
}

export function smart_target_and_attack(c, monster_filter_list, use_formation = false, kill_safespot = null) {
    if (!Array.isArray(monster_filter_list)) {
        monster_filter_list = [monster_filter_list]
    }

    let target = (use_formation)
        ? get_entity(memory.party_target_id) || null
        : c.get_target()

    if (target === null || target.dead) { //  || target.target
        for (let monster_filter of monster_filter_list) {
            const mob = c.get_nearest_monster(monster_filter)
            if (mob) {
                if (use_formation) {
                    memory.party_target_id = mob.id
                    target = mob
                } else {
                    c.change_target(mob)
                    target = mob
                }
                break
            }
        }
    }

    if (target) { //  && !c.mob.dead
        smart_attack(c, target, use_formation, kill_safespot)
    }
}

function smart_attack_formation(c, monster, kill_safespot) {
    const range = 400

    if (c.character.ctype === "warrior") {
        let healer = (memory.chars_by_role.priests.length === 0)
            ? null
            : memory.chars_by_role.priests[0].character

        let bubble_color = 0xFF0000

        if (healer) {
            if (is_on_cooldown("taunt") === false) {
                let party_members = Object.keys(get_party())

                for (let entity_id in c.entities) {
                    const entity = c.parent.entities[entity_id]
                    if (entity && entity.type === "monster" && entity.target && party_members.includes(entity.target)) {
                        console.log("TAUNTING")
                        c.party_say(`Taunting for ${entity.target}`)
                        c.use_skill("taunt", entity.id)
                        break
                    }
                }
            }

            let healer_distance = c.distance(c.character, healer)

            if (healer_distance < range) {
                bubble_color = 0x00FF00

                if (monster.target && kill_safespot) {
                    c.move(kill_safespot.x, kill_safespot.y)
                } else {
                    c.move(monster.real_x + 25, monster.real_y)
                }

                if (c.can_attack(monster)) {
                    c.attack(monster) //.then((data) => c.reduce_cooldown("attack", character.ping * 0.8))
                }
            } else {
                if (kill_safespot) c.move(kill_safespot.x, kill_safespot.y)
            }
        } else {
            if (kill_safespot) c.move(kill_safespot.x, kill_safespot.y)
        }

        draw_circle(c.character.x, c.character.y, range, 3, bubble_color)

    } else {
        if (memory.chars_by_role.warriors.length === 0) return

        const tank = memory.chars_by_role.warriors[0].character
        const angle = Math.atan2(monster.y - tank.y, monster.x - tank.x)

        if (monster.target !== tank.id) {
            if (kill_safespot) {
                c.move(kill_safespot.x, kill_safespot.y)
            } else {
                c.move(tank.x, tank.y)
            }
            return
        }

        if (c.character.ctype === "priest" || c.character.ctype === "mage" || c.character.ctype === "ranger") {
            c.move(tank.x - Math.cos(angle) * 30, tank.y - Math.sin(angle) * 30)
        } else {
            c.move(tank.x + Math.cos(angle + Math.PI / 3) * 40, tank.y + Math.sin(angle + Math.PI / 3) * 30)
        }

        if (c.can_attack(monster)) {
            c.attack(monster) // .then((data) => c.reduce_cooldown("attack", character.ping * 0.8))
        }
    }
}

function smart_attack_solo(c, monster) {
    if (c.character.ctype === "priest" || c.character.ctype === "wizard" || c.character.ctype === "ranger") {
        if (monster.target !== c.character.name) {
            c.move(monster.real_x + 75, monster.real_y)
        }
    } else {
        c.move(monster.real_x + 25, monster.real_y)
    }

    if (c.can_attack(monster)) {
        c.attack(monster) // .then((data) => c.reduce_cooldown("attack", c.character.ping * 0.8))
    }
}

export function smart_attack(c, monster, use_formation = false, kill_safespot = null) {
    if (use_formation) {
        smart_attack_formation(c, monster, kill_safespot)
    } else {
        smart_attack_solo(c, monster)
    }
}

export function distance_sq(entity1, entity2) {
    return (entity2.real_x - entity1.real_x) * (entity2.real_x - entity1.real_x) + (entity2.real_y - entity1.real_y) * (entity2.real_y - entity1.real_y)
}

export function inventory_space(inventory = null) {
    if (inventory) return inventory.filter(slot => slot === null).length
    else return character.items.filter(slot => slot === null).length
}

export async function transfer_inventory_to(c, to_name, transfer_gold = true) {
    if (transfer_gold) {
        c.send_gold(to_name, c.character.gold)
    }

    for (let i = 0; i < c.character.items.length; i++) {
        if (c.character.items[i] !== null) {
            if (["Tracktrix"].includes(c.character.items[i])) continue
            c.send_item(to_name, i, 9999)
            await sleep(0.1)
        }
    }
}