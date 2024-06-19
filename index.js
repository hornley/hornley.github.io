let circles = []
let mousePosition = {x: 0, y: 0}
let spawnTime = 25 * window.devicePixelRatio
let lastSpawn = -1
let lastscroll = 0
let pages = []
let proficiencies = {"python": 3, "java": 2, "cpp": 2, "js": 2}

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
        this.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    }

    render() {
        this.life++
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.fillStyle = `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`
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
            this.x += this.dx / this.size * 3
            this.y += this.dy / this.size * 3
        }
    }

    connectWithNearest() {
        circles.forEach((c, i) => {
            let x = c.x - this.x;
            let y = c.y - this.y;
            let l = Math.sqrt(x * x + y * y);
            if (l <= 75 * this.size) {
                this.ctx.save()
                this.ctx.beginPath()
                // this.ctx.strokeStyle = `rgb(${this.color[0]},${this.color[1]},${this.color[2]})`
                this.ctx.strokeStyle = `rgba(0,0,0,${25/l})`
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
    observer: new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting === true) {
            const topNav = document.getElementById("myTopnav")
            const homeButton = document.getElementById("HomeButton")
            if (entries[0].target.className.includes("Block")) {
                topNav.style.visibility = "visible"
                homeButton.style.visibility = "hidden"
            } else {
                topNav.style.visibility = "hidden"
                homeButton.style.visibility = "visible"
            }
        }
    }, { threshold: 0.8 }),
    menu: function() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.Block.appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
        window.addEventListener('mousemove', function(e) {
            mousePosition.x = e.pageX
            mousePosition.y = e.pageY
        })
        pages.push("Block")
        pages.push("Skills")
        pages.push("AboutMe")
        pages.forEach((page) => {
            Main.observer.observe(document.getElementById(page))
        })
        loop()
    }
}

function skillHover(hoveredNode) {
    let skillContainerDiv = document.getElementById("SkillsContainer")

    skillContainerDiv.childNodes.forEach((node) => {
        let id = "" + node.id
        if (id.includes("Skill-div") && node.children[0] !== hoveredNode) {
            node.style.opacity = 0.2
        } else if (id.includes("Skill-div") && node.children[0] === hoveredNode) {
            let tooltip = node.lastChild.previousSibling
            tooltip.style.visibility = 'visible'
            tooltip.style.opacity = '1'
            tooltip.style.top = `${mousePosition.y - 60}px`
            tooltip.style.left = `${mousePosition.x - 60}px`
        }
    })
}

function skillHoverOut() {
    let skillContainerDiv = document.getElementById("SkillsContainer")

    skillContainerDiv.childNodes.forEach((node) => {
        let id = "" + node.id
        if (id.includes("Skill-div")) {
            node.style.opacity = 1
            let tooltip = node.lastChild.previousSibling
            tooltip.style.visibility = 'hidden'
            tooltip.style.opacity = '0'
            tooltip.style.top = `0px`
            tooltip.style.left = `0px`
        } 
    })
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