import { quests, pick_quest } from './quests.js'
import { memory } from './memory.js'

export function initialize_party(members) {
    members
        .filter(name => name !== memory.main_char_name)
        .map(name => start_character(name, 6))
}

export function logout_party(members) {
    members
        .filter(name => name !== memory.main_char_name)
        .map(stop_character)
}

export function update_manager() {
    const old_quest_name = memory.quest_name
    const quest_name = pick_quest([
        "phoenix_passive",
        // "spiders",
        "bigbirds",
    ])

    if (old_quest_name !== quest_name) {
        memory.quest_name = quest_name

        for (let c of memory.chars) {
            c.stop()
        }
    }
}