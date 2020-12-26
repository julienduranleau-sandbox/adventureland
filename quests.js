import { smart_target_and_attack, smart_attack, distance_sq } from 'http://68.107.27.193/delphes/utils.js'

const quests = {
    snowman: {
        condition() {
            let time = new Date()
            let snowman_spawn = new Date(parent.S.snowman.spawn)
            let snowman_timer = (snowman_spawn - time) / 1000
            return snowman_timer < 60 || parent.S.snowman.live === true
        },
        init() {
            smart_move({ x: 1097, y: -909, map: "winterland" })
        },
        run() {
            smart_target_and_attack({ type: "snowman" })
        }
    },

    snakes: {
        init() {
            smart_move({ x: -154, y: 1876, map: "main" })
        },
        run() {
            smart_target_and_attack({ type: "snake" })
        }
    },

    boars: {
        init() {
            smart_move({ x: 239, y: -710, map: "winterland" })
        },
        run() {
            smart_target_and_attack({ type: "boar" }, true, { x: 239, y: -710 })
        }
    },

    water_spirits: {
        init() {
            smart_move({ x: 762, y: 237, map: "winterland" })
        },
        run() {
            smart_target_and_attack({ type: "iceroamer" }, true, { x: 762, y: 237 })
        }
    },

    squigs: {
        init() {
            smart_move({ x: -1164, y: 361, map: "main" })
        },
        run() {
            smart_target_and_attack([{ type: "squigtoad" }, { type: "squig" }])
        }
    },

    turtles: {
        init() {
            smart_move({ x: -1064, y: 1139, map: "main" })
        },
        run() {
            smart_target_and_attack([{ type: "tortoise" }])
        }
    },

    goos: {
        init() {

        },
        run() {
            smart_target_and_attack({ type: "goo" })
        }
    },

    bats: {
        init() {
            smart_move({ x: -73, y: -455, map: "cave" })
        },
        run() {
            smart_target_and_attack({ type: "bat" })
        }
    },

    bats_alternative: {
        condition() {
            return (new Date()).getMinutes() > 30
        },
        init() {
            smart_move({ x: 307, y: -1060, map: "cave" })
        },
        run() {
            smart_target_and_attack({ type: "bat" })
        }
    },


    ghosts: {
        init() {
            smart_move({ x: 534, y: -1064, map: "halloween" })
        },
        run() {
            //smart_target_and_attack({ type: "ghost" }, true, { x: 534, y: -1064 })
            smart_target_and_attack({ type: "ghost" }, true)
        }
    },

    phoenix_active: {
        init() {
        },
        run() {
            let phoenix = get_nearest_monster({type: "phoenix"})

            if (phoenix) {
                smart_target_and_attack({ type: "phoenix" }, true)
            } else {
                smart_move("phoenix")
            }
        }
    },

    phoenix_passive: {
        condition() {
            return get_nearest_monster({ type: "phoenix", max_att: 400 }) !== null
            //return G.maps.main.monsters.filter(monster => monster.type === "phoenix").length > 0
        },
        init() {
            //smart_move({ x: -2, y: -1168, map: "cave" })
        },
        run() {
            smart_target_and_attack({ type: "phoenix" }, true)
        }
    },

    vampire_passive: {
        condition() {
            return get_nearest_monster({ type: "mvampire", max_att: 400 }) !== null
            //return G.maps.cave.monsters.filter(monster => monster.type === "mvampire").length > 0
        },
        init() {
            smart_move({ x: -2, y: -1168, map: "cave" })
        },
        run() {
            smart_target_and_attack({ type: "mvampire" })
        }
    },

    candy_canes: {
        condition() {
            return locate_item("candycane") > -1 && me.items.filter(item => item === null).length > 0
        },
        init() {
            smart_move(find_npc("santa"))
        },
        run() {
            for (let i = 0; i < me.items.length; i++) {
                if (me.items[i].name === "candycane") {
                    exchange(i)
                    break
                }
            }
        }
    },

    mistletoes: {
        condition() {
            return locate_item("mistletoe") > -1 && me.items.filter(item => item === null).length > 0
        },
        init() {
            smart_move({ x: 94, y: -166, map: "winter_inn" })
        },
        run() {
            for (let i = 0; i < me.items.length; i++) {
                if (me.items[i].name === "mistletoe") {
                    exchange(i)
                    break
                }
            }
        }
    },

    grinch_passive: {
        condition() {
            let time = new Date()
            let spawn = new Date(parent.S.grinch.spawn)
            let timer = (spawn - time) / 1000

            let timer_ok = timer < 60 || parent.S.grinch.live === true
            let grinch_nearby = get_nearest_monster({ type: "grinch"})

            return timer_ok && grinch_nearby
        },
        init() {
        },
        run() {
            let grinch_mob = get_nearest_monster({ type: "grinch"})

            smart_target_and_attack({ type: "grinch" })
        }
    },

    grinch_active: {
        condition() {
            let time = new Date()
            let spawn = new Date(parent.S.grinch.spawn)
            let timer = (spawn - time) / 1000

            let timer_ok = timer < 60 || parent.S.grinch.live === true
            let grinch_nearby = get_nearest_monster({ type: "grinch"})

            return timer_ok// && grinch_nearby
        },
        init() {
            let kane = get_player("Kane")
            if (kane === null) {
                smart_move({x: -970, y: 1748, map: "main"})
                //smart_move({x: 1098, y: 1044, map: "main"})
            }
        },
        run() {
            let grinch_mob = get_nearest_monster({ type: "grinch"})

            if (grinch_mob === null) {
                let kane = get_player("Kane")
                if (kane) {
                    move(kane.x, kane.y)
                }
            }

            smart_target_and_attack({ type: "grinch" })
        }
    },

    assist_iris: {
        condition() {
            return get_characters().filter(c => c.name === "Iriss").length === 1
        },
        init() {
            me.on("cm", data => {
                if (data.name === "Iriss" && data.message.type === "position_answer") {
                    smart_move({
                        x: data.message.x,
                        y: data.message.y,
                        map: data.message.map
                    })
                    quest_data.waiting_for_position = false
                }
            })
        },
        run() {
            const tank = get_player("Iriss")

            if (!tank && !smart.moving && !quest_data.waiting_for_position) {
                send_cm("Iriss", { type: "position_request" })
                quest_data.waiting_for_position = true
                return
            }

            if (!tank || smart.moving) {
                return
            }

            const tank_target = get_target_of(tank)

            if (tank_target && tank_target.target) {
                mob = tank_target
                change_target(mob)
                smart_attack(tank_target, true)
            } else {
                if (can_move_to(tank.real_x, tank.real_y)) {
                    return move(tank.real_x, tank.real_y)
                } else {
                    smart_move({ x: tank.real_x, y: tank.real_y });
                }
            }
        }
    }
}

export function run_quest(quest_list) {
    // if (smart.moving) return

    for (let quest_name of quest_list) {
        if (quests[quest_name].condition === undefined || quests[quest_name].condition()) {
            if (quest_name !== active_quest) {
                stop()
                active_quest = quest_name
                quest_data = {}
                quests[quest_name].init()
            }
            break
        }
    }

    if (active_quest && quests[active_quest] && !smart.moving) {
        quests[active_quest].run()
    }

}

