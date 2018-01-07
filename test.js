const Sudoku = require('.');

const a = new Sudoku();
a.readFile('example2.txt');
console.log(a.solve());