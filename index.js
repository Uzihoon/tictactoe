class Layout {
  constructor(id) {
    const app = document.getElementById(id);

    if (!app) {
      throw new Error('Please provide valuable app id.');
    }

    this.app = app;
    this.elementList = this.createElementList();

    this.count = 3;
    this.playerList = ['O', 'X'];

    this.gameStart = false;

    this.tictactoe = new TicTacToe(
      this.elementList.get('container').className,
      this.elementList.get('status').className
    );
  }

  onClick(event) {
    event.preventDefault();

    this.gameStart = !this.gameStart;

    if (this.gameStart) {
      this.tictactoe.render(this.count, this.playerList);
    } else {
      this.tictactoe.reset();
    }
    event.target.textContent = 'Reset';
  }

  createElementList() {
    const prefix = 'game--';
    const elementList = [
      { role: 'head', properties: [['textContent', 'Tic Tac Toe Game']] },
      {
        role: 'count',
        type: 'input',
        attributes: [['placeholder', 'Set counter']]
      },
      {
        role: 'start',
        type: 'button',
        event: [['click', this.onClick.bind(this)]],
        properties: [['textContent', 'Start']]
      },
      { role: 'status' },
      { role: 'container' }
    ];

    return new Map(
      elementList.map(element => [
        element.role,
        { ...element, className: `${prefix}${element.role}` }
      ])
    );
  }

  createElement({ className, type, attributes, properties, event }) {
    const element = document.createElement(type || 'div');
    element.classList.add(className);

    if (properties) {
      properties.map(([name, value]) => (element[name] = value));
    }

    if (attributes) {
      attributes.map(([name, value]) => element.setAttribute(name, value));
    }

    if (event) {
      event.map(([name, callback]) => element.addEventListener(name, callback));
    }

    return element;
  }

  render() {
    const elements = [...this.elementList.values()].map(this.createElement);
    const fragement = document.createDocumentFragment();

    fragement.append(...elements);

    this.app.appendChild(fragement);
  }

  start() {
    this.tictactoe.render(this.count, this.playerList);
  }
}

class TicTacToe {
  constructor(containerClass, statusClass) {
    this.containerClass = containerClass;
    this.statusClass = statusClass;

    this.winning = player => `Player ${player} has won!!`;
    this.draw = () => `Game ended in a draw.`;
    this.turn = player => `It's ${player}'s turn.`;

    this.initial();
  }

  initial(count, playerList) {
    this.count = count || this.count;
    this.playerList = playerList || this.playerList;

    this.board = [...Array(this.count)].map(() => [...Array(this.count)]);
    this.gameStatus = true;
    this.currentPlayer = 0;
  }

  reset() {
    this.render();
  }

  showMessage(msg) {
    const status = document.querySelector(`.${this.statusClass}`);
    if (!status) throw new Error('Please set status element!');
    status.textContent = msg ? msg(this.playerList[this.currentPlayer]) : '';
  }

  render(count, playerList) {
    this.initial(count, playerList);

    const container = document.querySelector(`.${this.containerClass}`);
    if (!container) throw new Error('Please set container element!');

    container.innerHTML = '';

    this.board.map((colList, row) => {
      const box = document.createElement('div');
      box.classList.add('game--box');

      colList.forEach((_, col) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        [
          ['row', row],
          ['col', col]
        ].map(([name, value]) => cell.setAttribute(`data-${name}`, value));

        cell.addEventListener('click', this.onClickCell.bind(this));

        box.appendChild(cell);
      });

      container.appendChild(box);
    });

    this.showMessage(this.turn);
  }

  onClickCell(event) {
    event.preventDefault();

    const row = event.target.getAttribute('data-row');
    const col = event.target.getAttribute('data-col');
    const player = this.move(+row, +col, this.currentPlayer);

    if (player !== undefined) {
      event.target.textContent = this.playerList[player];
    }
  }

  move(row, col, player) {
    if (typeof this.board[row][col] === 'number' || !this.gameStatus) {
      return;
    }

    this.board[row][col] = player;

    if (
      this.checkRow(row, player) ||
      this.checkColumn(col, player) ||
      (row && col && this.checkDiagnoal(player)) ||
      (col === this.count - row - 1 && this.checkAntiDiagnoal(player))
    ) {
      this.gameStatus = false;
      this.showMessage(this.winning);
      return player;
    } else if (
      !this.board.filter(row => row.filter(col => col === undefined).length)
        .length
    ) {
      this.showMessage(this.draw);
      return player;
    } else {
      const next = this.currentPlayer + 1;
      this.currentPlayer = next >= this.playerList.length ? 0 : next;
      this.showMessage(this.turn);
      return player;
    }
  }

  checkRow(row, player) {
    for (let col = 0; col < this.count; col++) {
      if (this.board[row][col] !== player) {
        return false;
      }
    }
    return true;
  }

  checkColumn(col, player) {
    for (let row = 0; row < this.count; row++) {
      if (this.board[row][col] !== player) {
        return false;
      }
    }

    return true;
  }

  checkDiagnoal(player) {
    for (let row = 0; row < this.count; row++) {
      if (this.board[row][row] !== player) {
        return false;
      }
    }

    return true;
  }

  checkAntiDiagnoal(player) {
    for (let row = 0; row < this.count; row++) {
      if (this.board[row][this.count - row - 1] !== player) {
        return false;
      }
    }

    return true;
  }
}

function main() {
  const layout = new Layout('app');
  layout.render();
}

window.addEventListener('load', main);
