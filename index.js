const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const wn = 10;
const hn = 10;
let unit = parseInt(screenWidth / wn);
if (unit % 2 === 1) {
  unit--;
}
let disable = false;

canvas.width = screenWidth;
canvas.height = screenHeight;

const stars = [];    
for (let i = 0; i < wn; i++) {
  const line = []
  for (let j = 0; j < hn; j++) {
    line.push({
      color: this.randomColor(),
      left: false,
      right: false,
      top: false,
      bottom: false,
      active: false,
      x: i * unit,
      y: canvas.height - j * unit - unit,
      tx: null,
      ty: 0,
    });
  }
  stars.push(line);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < stars.length; i++) {
    const line = stars[i];
    for (let j = 0; j < line.length; j++) {
      drawRoundRect(line[j].x, line[j].y, unit, unit, 4, line[j].color, line[j]);
    }
  }
}

function drawRoundRect(x, y, width, height, radius, color, data){
  const borderColor = '#fff';
  const activeBorderColor = '#000';
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, width  - 2, height - 2);

  ctx.lineWidth = 1;
  ctx.strokeStyle = data.top ? activeBorderColor : borderColor;
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
  ctx.lineTo(width - radius + x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = data.right ? activeBorderColor : borderColor;
  ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
  ctx.lineTo(width + x, height + y - radius);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = data.bottom ? activeBorderColor : borderColor;
  ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
  ctx.lineTo(radius + x, height +y);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = data.left ? activeBorderColor : borderColor;
  ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
  ctx.lineTo(x, y + radius);
  ctx.stroke();
  ctx.closePath();
}

function randomColor() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const num = parseInt(Math.random() * 4);
  return colors[num];
}

// drawRoundRect(60, 60, 20, 20, 4, 'red')
draw();

canvas.addEventListener('touchstart', function(e) {
  if (disable) {
    return;
  }
  disable = true;
  const x = e.targetTouches[0].clientX;
  const y = e.targetTouches[0].clientY;
  if (y < canvas.height - hn * unit) {
    return false;
  }
  const yi = parseInt((canvas.height - y) / unit);
  const xi = parseInt(x / unit);
  if (stars[xi] && stars[xi][yi]) {
    findTarge(xi, yi);
  }
});

// 寻找点击目标
function findTarge(i, j) {
  if (stars[i][j].active) {
    clearAllBox();
  } else {
    disable = false;
    clear();
    if (hasBrother(i, j)) {
      const color = stars[i][j].color;
      stars[i][j].active = true;
      findAll(i, j, color);
      draw();
    }
  }
}

// 寻找所以关联的目标
function findAll(i, j, color) {

  const star = stars[i][j];

  for (let n = 0; n < 4; n++) {
    let next = {}
    // 上方
    if (n === 0) {
      next.star = stars[i] ? stars[i][j + 1] : null;
      next.i = i;
      next.j = j + 1;
      next.d = 'top';
    }

    // 右边
    if (n === 1) {
      next.star = stars[i + 1] ? stars[i + 1][j] : null;
      next.i = i + 1;
      next.j = j;
      next.d = 'right';
    }

    // 下边
    if (n === 2) {
      next.star = stars[i] ? stars[i][j - 1] : null;
      next.i = i;
      next.j = j - 1;
      next.d = 'bottom';
    }

    // 左边
    if (n === 3) {
      next.star = stars[i - 1] ? stars[i - 1][j] : null;
      next.i = i - 1;
      next.j = j;
      next.d = 'left';
    }

    if (next.star) {
      if (!next.star.active) {
        star.active = true;
        if (next.star.color === color) {
          findAll(next.i, next.j, color);
        } else {
          star[next.d] = true;
        }
      }
    } else {
      star[next.d] = true;
      star.active = true;
    }
  }
}

// 消除方块，清空所有标记方块
function clearAllBox() {
  let num = 0;
  // const oldStars = JSON.parse(JSON.stringify(stars));

  // 循环删除被标记的方块
  for (let i = stars.length - 1; i >= 0; i--) {
    const line = stars[i];
    for (let j = line.length - 1; j >= 0; j--) {
      if (line[j].active) {
        num++;
        line.splice(j, 1);
      }
    }
  }

  // 循环更新方块目标的位置
  for (let i = stars.length - 1; i >= 0; i--) {
    const line = stars[i];
    for (let j = line.length - 1; j >= 0; j--) {
      line[j].tx = i * unit;
      line[j].ty = canvas.height - j * unit - unit;
    }
  }

  move(num);
}

// 验证目标方块周围是否有相同的方块
function hasBrother(i, j) {
  const color = stars[i][j].color;
  let num = 0;
  if (stars[i] && stars[i][j + 1] && stars[i][j + 1].color === color) {
    num++;
  }
  if (stars[i] && stars[i][j - 1] && stars[i][j - 1].color === color) {
    num++;
  }
  if (stars[i + 1] && stars[i + 1][j] && stars[i + 1][j].color === color) {
    num++;
  }
  if (stars[i - 1] && stars[i - 1][j] && stars[i - 1][j].color === color) {
    num++;
  }
  if (num === 0) { // 判断目标方块四周是否有相同方块
    return false;
  } else {
    return true;
  }
}

// 消除方块后轨迹运动
function move() {
  let id;

  function moving() {
    let all = 0;
    let done = 0;
    for (let i = 0; i < stars.length; i++) {
      const line = stars[i];
      for (let j = 0; j < line.length; j++) {
        all++;
        if (line[j].ty === 0) {
          done++;
          continue;
        }
        if (line[j].ty > line[j].y) {
          line[j].y += 2;
        }
        if (line[j].ty < line[j].y) {
          line[j].y -= 2;
        }
        if (line[j].ty === line[j].y) {
          line[j].ty = 0;
        }
      }
    }
    draw();
    if (all === done) {
      cancelAnimationFrame(id);
      merge()
    } else {
      id = requestAnimationFrame(moving);
    }
  }
  id = requestAnimationFrame(moving);
}

// 合并纵轴方块
function merge() {
  const stack = []; // 记录空数组的栈
  for (let i = 0; i < stars.length; i++) {
    if (stars[i].length === 0) {
      stack.push(i);
    }
  }
  if (stack.length === 0) {
    disable = false;
    isOver();
    return;
  }

  // 标记目标横线移动坐标
  for (let k = 0; k < stack.length; k++) {
    const last = stack[k + 1] ? stack[k + 1] : stars.length;
    for (let i = stack[k] + 1; i < last; i++) {
      const line = stars[i];
      for (let j = 0; j < line.length; j++) {
        line[j].tx = line[j].x - unit * (k + 1);
      }
    }
  }

  // 清楚空纵向列表
  for (let i = stars.length - 1; i >= 0; i--) {
    if (stars[i].length === 0) {
      stars.splice(i, 1);
    }
  }

  // 横向移动
  let id;
  function moving() {
    let all = 0;
    let done = 0;
    for (let i = 0; i < stars.length; i++) {
      const line = stars[i];
      for (let j = 0; j < line.length; j++) {
        all++;
        if (line[j].tx === null) {
          done++;
          continue;
        }
        if (line[j].tx > line[j].x) {
          line[j].x += 2;
        }
        if (line[j].tx < line[j].x) {
          line[j].x -= 2;
        }
        if (line[j].tx === line[j].x) {
          line[j].tx = null;
        }
      }
    }
    draw();
    if (all === done) {
      disable = false;
      cancelAnimationFrame(id);
      isOver();
    } else {
      id = requestAnimationFrame(moving);
    }
  }
  id = requestAnimationFrame(moving);
}

// 验证是否游戏结束
function isOver() {
  for (let i = 0; i < stars.length; i++) {
    const line = stars[i];
    for (let j = 0; j < line.length; j++) {
      if (hasBrother(i, j)) {
        return true;
      }
    }
  }
  alert('游戏结束');
}

// 清空
function clear() {
  for (let i = 0; i < stars.length; i++) {
    const line = stars[i];
    for (let j = 0; j < line.length; j++) {
      line[j].left = false;
      line[j].right = false;
      line[j].top = false;
      line[j].bottom = false;
      line[j].active = false;
    }
  }
}