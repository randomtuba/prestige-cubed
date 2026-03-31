var generators;
var points;
var highestGenerator;

function mainLoop(){
    generators = player.generators[0][0]
    points = player.points[0][0]
    highestGenerator = player.highestGenerator[0][0]

    if(!window["player"]||!points[0])return;
    let time = Date.now()
    let diff = (time - player.lastTick)/1000
    player.lastTick = time
    player.timePlayed += diff

    checkForGenerators()

    if (generators[0][0] != undefined) player.points[0][0][0] = points[0].add(OmegaNum.mul(generators[0][0].amount, Generators.mult(0)).mul(diff))
    for (let i = 1; i < generators[0].length; i++) {
        player.generators[0][0][0][i-1].amount = OmegaNum.add(generators[0][i-1].amount, OmegaNum.mul(generators[0][i].amount, Generators.mult(i)).mul(Generators.hiddenMultiplier(i)).mul(diff))
    }
}

setInterval(mainLoop, 40);

function checkForGenerators() {
    if (generators[0].length == 0 || OmegaNum.gte(generators[0][generators[0].length - 1].bought, 1)) {
        player.generators[0][0][0].push({
            amount: new OmegaNum(0),
            bought: new OmegaNum(0),
        })
    }
    if (generators[0].length > 10) {
        player.highestGenerator[0][0][0] = player.highestGenerator[0][0][0].add(1)
        player.generators[0][0][0].splice(1, 1);
    }
}

const Generators = {
    mult(x) {
        return OmegaNum.pow(2, player.generators[0][0][0][x].bought)
    },
    cost(x) {
        let a = OmegaNum.add(x, player.highestGenerator[0][0][0].sub(10))
        if (x == 0) a = 0
        return OmegaNum.pow(10, OmegaNum.pow(2, a)).mul(OmegaNum.pow(10, OmegaNum.pow(2, a)).pow(player.generators[0][0][0][x].bought))
    },
    buy(x) {
        if (points[0].gte(Generators.cost(x))) {
            player.points[0][0][0] = points[0].sub(Generators.cost(x))
            player.generators[0][0][0][x].bought = OmegaNum.add(generators[0][x].bought, 1)
            player.generators[0][0][0][x].amount = OmegaNum.add(generators[0][x].amount, 1)
        }
    },
    hiddenMultiplier(x) {
        if (x > 1 || highestGenerator[0].lte(10)) {
            return new OmegaNum(1)
        } else {
            let t = new OmegaNum(player.timePlayed)
            let n = player.highestGenerator[0][0][0].sub(10)
            let m = OmegaNum.pow(2, player.points[0][0][0].max(100).logBase(100).sub(1))
            return t.pow(n).mul(m.pow(2 - (1 / n)))
        }
    }
}