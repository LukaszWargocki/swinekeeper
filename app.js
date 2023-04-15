// wait for html
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const flagsLeft = document.querySelector('#flags-left');
  const result = document.querySelector('#result');
  let size = 10;
  let mineAmount = 20;
  let flags = 0;
  let cells = [];
  let isGameOver = false;

  // create minefield
  function generateField() {
    flagsLeft.innerHTML = mineAmount;

    const minesArray = Array(mineAmount).fill('mine');
    // valid class represents legal, unclicked cells
    const emptyArray = Array(size**2 - mineAmount).fill('valid');
    const gameArray = emptyArray.concat(minesArray);
    // shuffle array of combines mines and valid cells
    const shuffledArray = gameArray.sort(() => Math.random() -0.5);

    // create gid cells
    for (let i = 0; i < size**2; i++) {
      const cell = document.createElement('div');
      cell.setAttribute('id', i);
      cell.classList.add(shuffledArray[i]);
      grid.appendChild(cell);
      cells.push(cell);

      // left click
      cell.addEventListener('click', function(e) {
        handleClick(cell);
        testForWin();
      })

      // right click handler
      cell.oncontextmenu = event => {
        event.preventDefault();
        addFlag(cell);
        testForWin();
      }
    }

    // populate the mine counts
    for (let i = 0; i < cells.length; i++) {
      let total = 0;
      // test if cell on either edge
      const isLeftEdge = (i % size === 0);
      const isRightEdge = (i % size === size - 1);

      if (cells[i].classList.contains('valid')) {
        // look: left, right-above, above, left-above, right, left-below, right-below, below
        // TODOS - unmagicnumber the i <> conditions to accomodate difficulties (or store magic numbers for different difficulties)
        if (i > 0 && !isLeftEdge && cells[i - 1].classList.contains('mine')) total++;
        if (i > 9 && !isRightEdge && cells[i + 1 - size].classList.contains('mine')) total++;
        if (i > 9 && cells[i - size].classList.contains('mine')) total++;
        if (i > 10 && !isLeftEdge && cells[i - 1 - size].classList.contains('mine')) total++;
        if (i < 99 && !isRightEdge && cells[i + 1].classList.contains('mine')) total++;
        if (i < 90 && !isLeftEdge && cells[i - 1 + size].classList.contains('mine')) total++;
        if (i < 89 && !isRightEdge && cells[i + 1 + size].classList.contains('mine')) total++;
        if (i < 90 && cells[i + size].classList.contains('mine')) total++;
        // set the amount of neighboring mines as data attribute
        cells[i].setAttribute('data', total);
      }
    }
  }
  // generate the minefield
  generateField();

  //add Flag with right click
  function addFlag(cell) {
    if (isGameOver) return;
    if (!cell.classList.contains('checked') && (flags < mineAmount)) {
      // flag unflagged
      if (!cell.classList.contains('flag')) {
        cell.classList.add('flag');
        cell.innerHTML = ' 🚩';
        flags++;
        flagsLeft.innerHTML = mineAmount - flags;
      // unflag flagged
      } else {
        cell.classList.remove('flag');
        cell.innerHTML = '';
        flags--;
        flagsLeft.innerHTML = mineAmount - flags;
      }
    }
  }

  // handle left click
  function handleClick(cell) {
    let currentId = cell.id;
    if (isGameOver) return;
    if (cell.classList.contains('checked') || cell.classList.contains('flag')) return;
    if (cell.classList.contains('mine')) {
      gameOver(cell);
      return;
    } else {
      let total = cell.getAttribute('data');
      // if there are adjacent mines add class (for color) and number content
      if (total != 0) {
        cell.classList.add('checked');
        if (total == 1) cell.classList.add('one');
        if (total == 2) cell.classList.add('two');
        if (total == 3) cell.classList.add('three');
        if (total == 4) cell.classList.add('four');
        if (total == 5) cell.classList.add('five');
        if (total == 6) cell.classList.add('six');
        if (total == 7) cell.classList.add('seven');
        if (total == 8) cell.classList.add('eight');
        cell.innerHTML = total;
        return;
      }
      // if cell has no adjacent mines, fan out with recursive test until cells with adjacent mines found
      checkCell(cell, currentId);
    }
    cell.classList.add('checked');
  }


  // fan out clicking adjacent cells
  function checkCell(cell, currentId) {
    const isLeftEdge = (currentId % size === 0);
    const isRightEdge = (currentId % size === size - 1);

    setTimeout(() => {
      // test left, right-above, above, left-above, right, left-below, right-below, below
      if (currentId > 0 && !isLeftEdge) {
        const nextId = +currentId - 1;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId > 9 && !isRightEdge) {
        const nextId = +currentId + 1 - size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId > 9) {
        const nextId = +currentId - size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId > 10 && !isLeftEdge) {
        const nextId = +currentId - 1 - size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId < 99 && !isRightEdge) {
        const nextId = +currentId + 1;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId < 90 && !isLeftEdge) {
        const nextId = +currentId - 1 + size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId < 89 && !isRightEdge) {
        const nextId = +currentId + 1 + size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      if (currentId < 90) {
        const nextId = +currentId + size;
        const nextCell = document.getElementById(nextId);
        handleClick(nextCell);
      }
      testForWin();
    }, 15);
  }

  // game over
  function gameOver(cell) {
    result.innerHTML = '🤯 Game Over! 🤯';
    isGameOver = true;
    cell.classList.add('exploded');

    // reveal mines
    cells.forEach(cell => {
      if (cell.classList.contains('mine')) {
        cell.innerHTML = '💣';
        cell.classList.remove('mine');
        cell.classList.add('checked');
      }
    })
  }

  // test for win
  function testForWin() {
    // count flagged mines and reveald non-mine cells
    let foundMines = 0;
    let revealedSafeCells = 0;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].classList.contains('flag') && cells[i].classList.contains('mine')) foundMines++;
      if (cells[i].classList.contains('checked')) revealedSafeCells++;;
      }
    // win condition for all mines flagged
    if (foundMines === mineAmount) {
      result.innerHTML = '😎 YOU WIN! 😎';
      isGameOver = true;
    }
    // win condition for all non-mine cells revealed
    if (revealedSafeCells + mineAmount === cells.length) {
      result.innerHTML = '😎 YOU WIN! 😎';
      isGameOver = true;
    }
  }
})