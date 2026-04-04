var generators;
var points;
var highestGenerator;

function mainLoop(){
    // shorthand variables
    generators = player.generators[0][0]
    points = player.points[0][0]
    highestGenerator = player.highestGenerator[0][0]

    // offline progress
    if(!window["player"]||!points[0])return;
    let time = Date.now()
    let diff = (time - player.lastTick)/1000
    player.lastTick = time
    player.timePlayed += diff

    // progress time
    for (let i = 0; i < player.timeInRun[0][0].length; i++) {
        player.timeInRun[0][0][i] = OmegaNum.add(player.timeInRun[0][0][i], diff)
    }

    // fill your game data with new generators, prestige points, and prestige powers when necessary
    fillArrays()

    // produce points
    if (generators[0][0] != undefined) player.points[0][0][0] = player.points[0][0][0].add(OmegaNum.mul(generators[0][0].amount, Generators.mult(0,0)).mul(diff))

    // i is for generator #, j is for prestige layer tier (0 is normal generator)
    for (let j = 0; j < generators.length; j++) {
        // produce power if generator is of tier 1 prestige or above
        if (generators[j][0] != undefined && j > 0) player.power[0][0][j] = OmegaNum.add(player.power[0][0][j], OmegaNum.mul(generators[j][0].amount, Generators.mult(j,0)).mul(diff))

        for (let i = 1; i < generators[j].length; i++) {
            // generator produces the previous one
            player.generators[0][0][j][i-1].amount = OmegaNum.add(generators[j][i-1].amount, OmegaNum.mul(generators[j][i].amount, Generators.mult(j,i)).mul(Generators.hiddenMultiplier(j,i)).mul(diff))
        }
    }

    // run autobuyers
    for (let i = 0; i < player.autoBuyMax[0][0].length; i++) {
        if (player.autoBuyMax[0][0][i]) {
            Generators.maxAll(i)
        }
    }
    for (let i = 0; i < player.autoRelativeGain[0][0].length; i++) {
        if (player.autoRelativeGain[0][0][i]) {
            player.points[0][0][i+1] = OmegaNum.add(player.points[0][0][i+1], Prestige.formula(i+1).mul(diff))
        }
    }
}

setInterval(mainLoop, 40);

function fillArrays() {
    // check for generators
    for (let i = 0; i < points.length; i++) {
        if (player.generators[0][0][i] == undefined) player.generators[0][0].push([])
        if (player.highestGenerator[0][0][i] == undefined) player.highestGenerator[0][0].push(new OmegaNum(10))
        if (player.generators[0][0][i].length == 0 || OmegaNum.gte(generators[i][generators[i].length - 1].bought, 1)) {
            player.generators[0][0][i].push({
                amount: new OmegaNum(0),
                bought: new OmegaNum(0),
            })
        }
        if (generators[i].length > 10) {
            player.highestGenerator[0][0][i] = OmegaNum.add(player.highestGenerator[0][0][i], 1)
            player.generators[0][0][i].splice(1, 1);
        }
    }

    // check for points/power/time
    if (OmegaNum(points[points.length - 1]).gte(1e20)) {
        player.points[0][0].push(new OmegaNum(0))
        player.power[0][0].push(new OmegaNum(1))
        player.timeInRun[0][0].push(new OmegaNum(0))
    }

    // check for autobuyers
    if (player.highestPrestige.gt(player.autoBuyMax[0][0].length + 1)) {
        player.autoBuyMax[0][0].push(true)
    }
    if (player.highestPrestige.gt(player.autoRelativeGain[0][0].length + 2)) {
        player.autoRelativeGain[0][0].push(true)
    }
}

const Generators = {
    mult(a,x) {
        return OmegaNum.pow(2, player.generators[0][0][a][x].bought).mul(Generators.powerMultiplier(a))
    },
    cost(a,x) {
        let tier = OmegaNum.add(x, new OmegaNum(player.highestGenerator[0][0][a]).sub(10))
        if (x == 0) tier = 0
        return OmegaNum.pow(10, OmegaNum.pow(2, tier)).mul(OmegaNum.pow(10, OmegaNum.pow(2, tier)).pow(player.generators[0][0][a][x].bought))
    },
    buy(a,x) {
        if (OmegaNum.gte(points[a], Generators.cost(a,x))) {
            player.points[0][0][a] = OmegaNum.sub(points[a], Generators.cost(a,x))
            player.generators[0][0][a][x].bought = OmegaNum.add(generators[a][x].bought, 1)
            player.generators[0][0][a][x].amount = OmegaNum.add(generators[a][x].amount, 1)
        }
    },
    buyMax(a,x) {
        let tier = OmegaNum.add(x, new OmegaNum(player.highestGenerator[0][0][a]).sub(10))
        if (x == 0) tier = 0

        if (OmegaNum.gte(points[a], Generators.cost(a,x))) {
            player.generators[0][0][a][x].amount = OmegaNum.add(generators[a][x].amount, OmegaNum.affordGeometricSeries(player.points[0][0][a], OmegaNum.pow(10, OmegaNum.pow(2, tier)), OmegaNum.pow(10, OmegaNum.pow(2, tier)), player.generators[0][0][a][x].bought))
            player.generators[0][0][a][x].bought = OmegaNum.add(generators[a][x].bought, OmegaNum.affordGeometricSeries(player.points[0][0][a], OmegaNum.pow(10, OmegaNum.pow(2, tier)), OmegaNum.pow(10, OmegaNum.pow(2, tier)), player.generators[0][0][a][x].bought).sub(1))
            player.points[0][0][a] = OmegaNum.sub(points[a], Generators.cost(a,x))
            player.generators[0][0][a][x].bought = OmegaNum.add(generators[a][x].bought, 1)
        }
    },
    maxAll(x) {
        for (let i = 0; i < generators[x].length; i++) {
            this.buyMax(x, i)
        }
    },
    hiddenMultiplier(a,x) {
        if (x > 1 || OmegaNum.lte(highestGenerator[a], 10)) {
            return new OmegaNum(1)
        } else {
            let t = new OmegaNum(player.timeInRun[0][0][a])
            let n = new OmegaNum(player.highestGenerator[0][0][a]).sub(10)
            let m = OmegaNum.pow(2, OmegaNum.max(player.points[0][0][a], 100).logBase(100).sub(1))
            let p = Generators.powerMultiplier(a)
            return t.pow(n).mul(m.pow(2 - (1 / n))).mul(p.pow(n))
        }
    },
    powerMultiplier(x) {
        let mult = new OmegaNum(1)
        let pow = new OmegaNum(1)
        for (let i = x+1; i < player.power[0][0].length; i++) {
            mult = OmegaNum.mul(mult, OmegaNum.pow(player.power[0][0][i], pow))
            pow = pow.add(1)
        }
        return mult
    },
}

const Prestige = {
    formula(x) {
        let amt = new OmegaNum(player.points[0][0][x-1])
        return OmegaNum.pow(10, (amt.logBase(1e24).sub(1)).mul(9).div(OmegaNum.logBase(amt.log10(), 2))).mul(10).floor()
    },
    reset(x, force) {
        if (force || new OmegaNum(player.points[0][0][x-1]).gte(1e24)) {
            if (!force) {
                player.points[0][0][x] = new OmegaNum(player.points[0][0][x]).add(Prestige.formula(x))
                if (player.highestPrestige.lt(x)) player.highestPrestige = new OmegaNum(x)
            }
            player.points[0][0][x-1] = x == 1 ? new OmegaNum(10) : new OmegaNum(0)
            player.generators[0][0][x-1].splice(0, player.generators[0][0][x-1].length)
            player.highestGenerator[0][0][x-1] = new OmegaNum(10)
            player.timeInRun[0][0][x-1] = new OmegaNum(0)
            if (x > 1) {
                player.power[0][0][x-1] = new OmegaNum(1)
                Prestige.reset(x-1, true)
            }
        }
    }
}