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

    phoenix: {
        init() {
            smart_move({ x: -2, y: -1168, map: "cave" })
        },
        run() {
            smart_target_and_attack([{ type: "phoenix", max_att: 350 }, { type: "mvampire", max_att: 350 }]) /**/
        }
    },

    assist_iris: {
        condition() {
            return get_characters().filter(c => c.name === "Iriss").length === 1
        },
        init() {
            send_cm("Iriss", { type: "position_request" })
            quest_data.waiting_for_position = true

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

            if (!tank) {
                return
            }

            const tank_target = get_target_of(tank)

            if (tank.moving) {
                // const dst = distance_sq(tank, me)

                if (can_move_to(tank.real_x, tank.real_y)) {
                    return move(tank.real_x, tank.real_y)
                } else {
                    smart_move({ x: tank.real_x, y: tank.real_y });
                }
            }

            if (tank_target && tank_target.target) {
                mob = tank_target
                change_target(mob)
                smart_attack(tank_target, tank)
            }
        }
    }
}

export function run_quest(quest_list) {
    for (let quest_name of quest_list) {
        if (quests[quest_name].condition === undefined || quests[quest_name].condition()) {
            if (quest_name !== active_quest) {
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

