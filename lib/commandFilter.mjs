export const commands = [
    'add',
    'delete',
    'remove'
]

function toRegex(commands) {
    return commands.join('|')
}

export default function commandFilter(data) {
    const regex = new RegExp(toRegex(commands))
    return (
        data &&
        data.content &&
        data.content.match(regex)
    )
}