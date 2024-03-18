let circles = []
let mousePosition = {x: 0, y: 0}
let spawnTime = 25
let lastSpawn = -1

class Circles {
    constructor(canvas, ctx) {
        this.canvas = canvas
        this.ctx = ctx
        this.x = Math.random() * (canvas.width)
        this.y = Math.random() * (canvas.height)
        this.life = 0
        this.dx = (Math.random() > 0.5) ? -0.5 : 0.5
        this.dy = (Math.random() > 0.5) ? -0.5 : 0.5
        this.size = Math.ceil(Math.random() * 3)
    }

    render() {
        this.life++
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI)
        this.ctx.stroke()
        this.ctx.fill()
        this.ctx.restore()
    }

    move() {
        const dist = 150
        if (this.x  >= mousePosition.x - dist && this.x <= mousePosition.x + dist && this.y >= mousePosition.y - dist && this.y <= mousePosition.y + dist) {
            const x = mousePosition.x - this.x;
            const y = mousePosition.y - this.y;
            const l = Math.sqrt(x * x + y * y);     
            const dx = (x / l) * 25;
            const dy = (y / l) * 25;
            this.x += -dx
            this.y += -dy    
        } else {
            this.x += this.dx
            this.y += this.dy
        }
    }

    connectWithNearest() {
        circles.forEach((c) => {
            let x = c.x - this.x;
            let y = c.y - this.y;
            let l = Math.sqrt(x * x + y * y);
            if (l <= 75 * this.size) {
                this.ctx.save()
                this.ctx.beginPath()
                this.ctx.strokeStyle = "rgba(0,0,0,"+25/l+")"
                this.ctx.moveTo(this.x, this.y)
                this.ctx.lineTo(c.x, c.y)
                this.ctx.stroke()
                this.ctx.restore()
            }
        })
    }
}

let Main = {
    Block: document.getElementById('Block'),
    canvas: document.createElement('canvas'),
    menu: function() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.Block.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
        window.addEventListener('mousemove', function(e) {
            mousePosition.x = e.offsetX
            mousePosition.y = e.offsetY
        })
        loop()
    }
}

function loop() {
    Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height)
    requestAnimationFrame(loop)
    let time = Date.now()
    if (time >= (lastSpawn + spawnTime)) {
        circles.push(new Circles(Main.canvas, Main.ctx))
        lastSpawn = time
    }
    circles.forEach((c, i) => {
        c.connectWithNearest()
        c.move()
        c.render()
        if (c.life >= 250) {
            circles.splice(i, 1)
        }
    })
}

Main.menu()