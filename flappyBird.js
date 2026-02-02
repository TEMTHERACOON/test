const game = document.getElementById("game")
const bird = document.getElementById("bird")
const bgMusic = document.getElementById("bg-music")
let birdY = 300
let velocity = 0
let gravity = 0.3
let pipes = []
let gameOver = false
let score = 0
let gameStarted = false
let animationId = null
let pipeIntervalId = null

function startGame() {
  if (!gameStarted) {
    gameStarted = true
    gameOver = false
    birdY = 300
    velocity = 0
    score = 0
    document.getElementById("score").textContent = "0"

    bgMusic.currentTime = 0
    bgMusic.volume = 0.4   
    bgMusic.play()

    pipes.forEach(pipe => {
      if (pipe.topPipe && pipe.topPipe.parentNode) pipe.topPipe.remove()
      if (pipe.bottomPipe && pipe.bottomPipe.parentNode) pipe.bottomPipe.remove()
    })
    pipes = []
    
    if (pipeIntervalId) clearInterval(pipeIntervalId)
    pipeIntervalId = setInterval(createPipe, 2000)
    
    update()
  }
}

function jump() {
  if (!gameOver) {
    velocity = -8
    if (!gameStarted) startGame()
  }
}

document.addEventListener("click", jump)
document.addEventListener("touchstart", (e) => {
  e.preventDefault()
  jump()
})

function createPipe() {
  if (gameOver || !gameStarted) return
  
  const gap = 200
  const gameHeight = game.clientHeight
  const minHeight = 60
  const maxTopHeight = gameHeight - gap - minHeight
  const topHeight = Math.random() * (maxTopHeight - minHeight) + minHeight
  const bottomHeight = gameHeight - topHeight - gap

  const topPipe = document.createElement("div")
  topPipe.className = "pipe top"
  topPipe.style.height = topHeight + "px"
  topPipe.style.left = game.clientWidth + "px"

  const bottomPipe = document.createElement("div")
  bottomPipe.className = "pipe bottom"
  bottomPipe.style.height = bottomHeight + "px"
  bottomPipe.style.left = game.clientWidth + "px"

  game.appendChild(topPipe)
  game.appendChild(bottomPipe)

  pipes.push({ topPipe, bottomPipe, passed: false })
}

function update() {
  if (!gameStarted) return

  if (gameOver) {
    if (animationId) cancelAnimationFrame(animationId)
    return
  }

  velocity += gravity
  birdY += velocity
  bird.style.top = birdY + "px"

  const birdSize = bird.clientHeight
  const gameHeight = game.clientHeight

  if (birdY < 0) {
    birdY = 0
    velocity = 0
  }
  
  if (birdY > gameHeight - birdSize) {
    endGame()
    return
  }

  const birdRect = {
    x: parseFloat(bird.style.left) || 60,
    y: birdY,
    width: bird.clientWidth,
    height: birdSize
  }

  pipes.forEach((pipe) => {
    let left = parseFloat(pipe.topPipe.style.left)
    left -= 4
    pipe.topPipe.style.left = left + "px"
    pipe.bottomPipe.style.left = left + "px"

    const pipeX = left
    const pipeWidth = pipe.topPipe.clientWidth
    
    if (!pipe.passed && pipeX + pipeWidth < birdRect.x) {
      pipe.passed = true
      score++
      document.getElementById("score").textContent = score
    }

    if (birdRect.x + birdRect.width > pipeX &&
        birdRect.x < pipeX + pipeWidth) {
      const topPipeHeight = parseFloat(pipe.topPipe.style.height)
      const bottomPipeHeight = parseFloat(pipe.bottomPipe.style.height)
      
      if (birdRect.y < topPipeHeight || 
          birdRect.y + birdRect.height > gameHeight - bottomPipeHeight) {
        endGame()
        return
      }
    }
  })

  pipes = pipes.filter(pipe => {
    if (parseFloat(pipe.topPipe.style.left) < -100) {
      if (pipe.topPipe.parentNode) pipe.topPipe.remove()
      if (pipe.bottomPipe.parentNode) pipe.bottomPipe.remove()
      return false
    }
    return true
  })

  animationId = requestAnimationFrame(update)
}

function endGame() {
  bgMusic.pause()

  if (gameOver) return
  
  gameOver = true
  gameStarted = false
  
  if (pipeIntervalId) {
    clearInterval(pipeIntervalId)
    pipeIntervalId = null
  }
  
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  setTimeout(() => {
    alert("Game Over! Score: " + score)
    startGame()
  }, 100)
}

const scoreDisplay = document.createElement("div")
scoreDisplay.id = "score"
scoreDisplay.textContent = "0"
game.appendChild(scoreDisplay)
