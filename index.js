const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const unit = screenWidth / 10;

canvas.width = screenWidth;
canvas.height = screenHeight;

const stars = [];    
for (let i = 0; i < 10; i++) {
  const line = []
  for (let j = 0; j < 10; j++) {
    line.push({
      color: this.randomColor(),
      left: false,
      right: false,
      top: false,
      bottom: false,
      active: false,
      x: i * unit,
      y: canvas.height - j * unit - unit,
      tx: 0,
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
      ctx.fillStyle = line[j].color;
      ctx.fillRect(line[j].x, line[j].y, unit, unit);
      if (line[j].left) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(line[j].x, line[j].y);
        ctx.lineTo(line[j].x, line[j].y + unit);
        ctx.stroke();
      }
      if (line[j].top) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(line[j].x, line[j].y);
        ctx.lineTo(line[j].x + unit, line[j].y);
        ctx.stroke();
      }
      if (line[j].right) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(line[j].x + unit, line[j].y);
        ctx.lineTo(line[j].x + unit, line[j].y + unit);
        ctx.stroke();
      }
      if (line[j].bottom) {
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.moveTo(line[j].x, line[j].y + unit);
        ctx.lineTo(line[j].x + unit, line[j].y + unit);
        ctx.stroke();
      }
    }
  }
}

function randomColor() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const num = parseInt(Math.random() * 4);
  return colors[num];
}

draw();

canvas.addEventListener('touchstart', function(e) {
  const x = e.targetTouches[0].clientX;
  const y = e.targetTouches[0].clientY;
  if (y < canvas.height - 10 * unit) {
    return false;
  }
  const yi = parseInt((canvas.height - y) / unit);
  const xi = parseInt(x / unit);
  // console.log(`横轴第${xi}个 纵轴第${yi}个`);
  if (stars[xi] && stars[xi][yi]) {
    findTarge(xi, yi);
  }
});

// 寻找点击目标
function findTarge(i, j) {
  if (stars[i][j].active) {
    clearAllBox();
  } else {
    clear();
    const color = stars[i][j].color;
    stars[i][j].active = true;
    if (hasBrother(i, j, color)) {
      findAll(i, j, color);
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

  draw();
}

// 消除方块，清空所有标记方块
function clearAllBox() {
  let num = 0;
  const oldStars = JSON.parse(JSON.stringify(stars));

  // 循环删除被标记的方块
  for (let i = stars.length - 1; i >= 0; i--) {
    const line = stars[i];
    for (let j = line.length - 1; j >= 0; j--) {
      if (line[j].active) {
        line.splice(j, 1);
      }
    }
  }

  // 循环更新方块新的位置
  for (let i = stars.length - 1; i >= 0; i--) {
    const line = stars[i];
    for (let j = line.length - 1; j >= 0; j--) {
      line[j].x = i * unit;
      line[j].y = canvas.height - j * unit - unit;
    }
  }
  draw();
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
  return false;
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