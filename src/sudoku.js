const Record = require('immutable').Record;
const Set = require('immutable').Set;
const List = require('immutable').List;
const Fs = require('fs');

class Sudoku {
    constructor() {
    }

    readArray(input) {
        this.input = input;
        this.N = this.input.length;
        this.n = Math.sqrt(this.N);
    }

    readFile(file) {
        let input = [];
        let inputString = Fs.readFileSync(file, 'utf8');
        inputString.split('\n').forEach((line) => {
            if (line) {
                let tmp = [];
                for (let i = 0; i < line.length; i++) {
                    !isNaN(parseInt(line[i], 16)) && tmp.push(parseInt(line[i], 16));
                }
                input.push(tmp);
            }
        });
        this.readArray(input);
    }

    solve() {
        let csp = new Csp();
        let node = new Node();
        this.input.forEach((rowNodes, i) => {
            rowNodes.forEach((colNode, j) => {
                node = node.set('row', i);
                node = node.set('col', j);
                if(colNode) {
                    node = node.set('domain', new Set([colNode]));
                    csp = csp.set('solvedNodes', csp.get('solvedNodes').push(node));
                } else {
                    let domain = new Set();
                    for (let i = 0; i < this.N; i++) {
                        domain = domain.add(i + 1);
                    }
                    node = node.set('domain', domain);
                    csp = csp.set('unsolvedNodes', csp.unsolvedNodes.push(node));
                }
            });
        });
        return this.backtrackingSearch(csp);
    }

    backtrackingSearch(csp) {
        let assignment = new Assignment();
        assignment = assignment.set('solution', this.input);
        return this.backtrack(assignment, csp).solution;
    }

    backtrack(assignment, csp) {
        if (this.isComplete(assignment)){
            return assignment;
        }
        const variable = this.selectVariable(csp);
        let newCsp = csp;
        newCsp = newCsp.set('unsolvedNodes', csp.get('unsolvedNodes').pop());
        newCsp = newCsp.set('solvedNodes', csp.get('solvedNodes').push(variable));
        const values = this.sortValues(variable, assignment, newCsp);
        if(!values || values.size === 0) {
            return undefined;
        }
        for(let i = 0; i < values.size; i += 1) {
            const row = variable.get('row');
            const col = variable.get('col');
            const value = values.toArray()[i];
            let solution = assignment.get('solution');
            
            solution[row][col] = value;
            assignment = assignment.set('solution', solution);

            let result = this.backtrack(assignment, newCsp);
            if(result && this.isComplete(result)) {
                return result;
            }

            solution[row][col] = 0;
            assignment = assignment.set('solution', solution);
        }
        return undefined;
    }

    selectVariable(csp) {
        return csp.get('unsolvedNodes').get(-1);
    }

    sortValues(variable, assignment, csp) {
        const solution = assignment.get('solution');
        const row = variable.get('row');
        const col = variable.get('col');
        const n = this.n;
        csp.get('solvedNodes').forEach((node) => {
            const i = node.get('row');
            const j = node.get('col');
            if(row === i || col === j || 
                (Math.floor(row / n) === Math.floor(i / n) && 
                Math.floor(col / n) === Math.floor(j / n))) {
                const domain = variable.get('domain');
                const value = solution[i][j];
                if(domain.has(value)) {
                    variable = variable.set('domain', domain.delete(value));
                }
            }
        });
        return variable.get('domain');
    }

    isComplete(assignment) {
        let isComplete = true;
        assignment.solution.forEach((elements) => {
            elements.forEach((element) => {
                if(!element) {
                    isComplete = false;
                    return;
                } 
            });
        });
        return isComplete;
    }
}

const Node = Record({
    row: null,
    col: null,
    domain: null,
});

const Csp = Record({
    solvedNodes: new List(),
    unsolvedNodes: new List(),
});

const Assignment = Record({
    solution: null,
    inferences: null,
});

module.exports = Sudoku;