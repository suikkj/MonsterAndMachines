// Priority: 0
// File: kubejs/server_scripts/dice_rolling.js
// RPG dice rolling system with public/private modes and saved macros

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event

    // Helper function to roll dice
    const rollDice = (player, expression, label) => {
        // Ensure expression is a JS string (fixes NBT string issues)
        const exprStr = String(expression)

        // Regex for XdY+Z or XdY-Z or just XdY or dY
        const regex = /^(\d*)d(\d+)(?:([+-])(\d+))?$/
        const match = exprStr.match(regex)

        if (!match) {
            return { success: false, error: 'Valor inválido! Use os formatos como "d20", "2d6", ou "1d10+5".' }
        }

        let count = parseInt(match[1])
        if (isNaN(count)) count = 1

        const sides = parseInt(match[2])

        let modifier = 0
        if (match[3] && match[4]) {
            modifier = parseInt(match[4])
            if (match[3] === '-') modifier = -modifier
        }

        // Safety limits
        if (count > 100) return { success: false, error: 'Muitos dados! Maximo é 100.' }
        if (sides > 1000) return { success: false, error: 'Muitos lados! Maximo é 1000.' }

        let total = 0
        let rolls = []

        for (let i = 0; i < count; i++) {
            let roll = Math.floor(Math.random() * sides) + 1
            rolls.push(roll)
            total += roll
        }

        total += modifier

        // Format output
        let rollComponents = []
        rolls.forEach((roll, index) => {
            let color = 'gray'
            if (sides === 100) {
                if (roll === 1) color = 'green'
                else if (roll === 100) color = 'red'
            } else {
                if (roll === 1) color = 'red'
                else if (roll === sides) color = 'green'
            }

            let comp = Component.literal(roll.toString()).color(color)
            if (index < rolls.length - 1) {
                comp.append(Component.gray(', '))
            }
            rollComponents.push(comp)
        })

        let message = Component.yellow(player.displayName.string)
            .append(Component.white(' rolled '))

        if (label) {
            message.append(Component.gold(`${label} `))
            message.append(Component.gray(`(${exprStr})`))
        } else {
            message.append(Component.aqua(exprStr))
        }

        message.append(Component.white(': '))
            .append(Component.gray('['))

        rollComponents.forEach(comp => message.append(comp))

        message.append(Component.gray(']'))

        if (modifier !== 0) {
            message.append(Component.white(modifier >= 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`))
        }

        message.append(Component.white(' = '))
        message.append(Component.green(total.toString()).bold(true))

        return { success: true, message: message }
    }

    // Helper to get saved dice expression
    const getSavedDice = (player, name) => {
        try {
            const savedData = player.persistentData.getString('savedDice_' + name)
            if (savedData && savedData.length > 0) {
                return savedData
            }
        } catch (e) {
            // Ignore errors
        }
        return null
    }

    // Helper to save dice expression
    const saveDice = (player, name, expression) => {
        player.persistentData.putString('savedDice_' + name, expression)
    }

    // /roll <expression> - Public roll (broadcasts to all)
    event.register(
        Commands.literal('roll')
            .then(Commands.literal('public')
                .then(Commands.argument('input', Arguments.GREEDY_STRING.create(event))
                    .executes(ctx => {
                        const player = ctx.source.player
                        const input = Arguments.GREEDY_STRING.getResult(ctx, 'input')

                        // Check for saved macro
                        let expression = input
                        let label = null

                        const savedExpr = getSavedDice(player, input)
                        if (savedExpr) {
                            expression = savedExpr
                            label = input
                        }

                        const result = rollDice(player, expression, label)

                        if (result.success) {
                            // Broadcast to all players
                            ctx.source.server.playerList.players.forEach(p => {
                                p.sendSystemMessage(result.message)
                            })
                            return 1
                        } else {
                            ctx.source.sendFailure(Component.of(result.error).red())
                            return 0
                        }
                    })
                )
            )
            .then(Commands.literal('private')
                .then(Commands.argument('input', Arguments.GREEDY_STRING.create(event))
                    .executes(ctx => {
                        const player = ctx.source.player
                        const input = Arguments.GREEDY_STRING.getResult(ctx, 'input')

                        // Check for saved macro
                        let expression = input
                        let label = null

                        const savedExpr = getSavedDice(player, input)
                        if (savedExpr) {
                            expression = savedExpr
                            label = input
                        }

                        const result = rollDice(player, expression, label)

                        if (result.success) {
                            // Private message - only to the rolling player
                            const privateMsg = Component.gray('[Private] ').append(result.message)
                            player.sendSystemMessage(privateMsg)
                            return 1
                        } else {
                            ctx.source.sendFailure(Component.of(result.error).red())
                            return 0
                        }
                    })
                )
            )
            .then(Commands.argument('input', Arguments.GREEDY_STRING.create(event))
                .executes(ctx => {
                    const player = ctx.source.player
                    const input = Arguments.GREEDY_STRING.getResult(ctx, 'input')

                    // Check for saved macro
                    let expression = input
                    let label = null

                    const savedExpr = getSavedDice(player, input)
                    if (savedExpr) {
                        expression = savedExpr
                        label = input
                    }

                    const result = rollDice(player, expression, label)

                    if (result.success) {
                        // Default is public - broadcast to all
                        ctx.source.server.playerList.players.forEach(p => {
                            p.sendSystemMessage(result.message)
                        })
                        return 1
                    } else {
                        ctx.source.sendFailure(Component.of(result.error).red())
                        return 0
                    }
                })
            )
    )

    // /save-dice <name> <expression>
    event.register(
        Commands.literal('save-dice')
            .then(Commands.argument('name', Arguments.STRING.create(event))
                .then(Commands.argument('expression', Arguments.GREEDY_STRING.create(event))
                    .executes(ctx => {
                        const player = ctx.source.player
                        const name = Arguments.STRING.getResult(ctx, 'name')
                        const expression = Arguments.GREEDY_STRING.getResult(ctx, 'expression')

                        // Validate expression
                        const regex = /^(\d*)d(\d+)(?:([+-])(\d+))?$/
                        if (!regex.test(expression)) {
                            ctx.source.sendFailure(Component.of('Valor inválido! Use os formatos como "d20", "2d6", ou "1d10+5".').red())
                            return 0
                        }

                        // Save using new method (individual keys)
                        saveDice(player, name, expression)

                        player.sendSystemMessage(Component.green('Dado \'' + name + '\' salvo como \'' + expression + '\''))
                        return 1
                    })
                )
            )
    )

    // /list-dice - Show saved dice macros
    event.register(
        Commands.literal('list-dice')
            .executes(ctx => {
                const player = ctx.source.player
                const persistentData = player.persistentData

                let found = false
                let message = Component.gold('Saved Dice Macros:\n')

                // Look for all savedDice_ prefixed keys
                try {
                    const keys = persistentData.getAllKeys()
                    if (keys) {
                        keys.forEach(key => {
                            const keyStr = String(key)
                            if (keyStr.startsWith('savedDice_')) {
                                const name = keyStr.substring('savedDice_'.length)
                                const expr = persistentData.getString(keyStr)
                                if (expr && expr.length > 0) {
                                    message.append(Component.white('  - '))
                                        .append(Component.aqua(name))
                                        .append(Component.gray(': '))
                                        .append(Component.yellow(expr))
                                        .append(Component.white('\n'))
                                    found = true
                                }
                            }
                        })
                    }
                } catch (e) {
                    // Fallback - can't list keys
                }

                if (found) {
                    player.sendSystemMessage(message)
                } else {
                    player.sendSystemMessage(Component.yellow('No saved dice macros found. Use /save-dice <name> <expression> to save one.'))
                }

                return 1
            })
    )

    // /delete-dice <name> - Delete a saved macro
    event.register(
        Commands.literal('delete-dice')
            .then(Commands.argument('name', Arguments.STRING.create(event))
                .executes(ctx => {
                    const player = ctx.source.player
                    const name = Arguments.STRING.getResult(ctx, 'name')

                    const key = 'savedDice_' + name
                    if (player.persistentData.contains(key)) {
                        player.persistentData.remove(key)
                        player.sendSystemMessage(Component.green('Deleted dice macro \'' + name + '\''))
                    } else {
                        player.sendSystemMessage(Component.red('No dice macro named \'' + name + '\' found.'))
                    }

                    return 1
                })
            )
    )
})
