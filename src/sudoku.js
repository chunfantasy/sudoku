 const Record = require('immutable').Record;
 const Set = require('immutable').Set;
 const List = require('immutable').List;

class Sudoku {
    constructor() {
        this.N = 9;
        this.input = [
            [0, 7, 4, 0, 1, 6, 0, 9, 0],
            [0, 5, 3, 2, 0, 9, 7, 0, 0],
            [0, 0, 9, 0, 7, 0, 4, 2, 8],
            [3, 0, 0, 6, 0, 1, 0, 8, 2],
            [9, 0, 0, 3, 5, 0, 1, 7, 0],
            [5, 8, 1, 0, 0, 4, 0, 3, 0],
            [1, 0, 0, 4, 3, 0, 2, 0, 9],
            [7, 3, 2, 9, 0, 0, 8, 0, 0],
            [0, 9, 0, 0, 8, 2, 0, 7, 3]];
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
                    node = node.set('domain', new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
                    csp = csp.set('unsolvedNodes', csp.unsolvedNodes.push(node));
                }
            });
        });
        console.log(this.backtrackingSearch(csp));
    }

    backtrackingSearch(csp) {
        let assignment = new Assignment();
        assignment = assignment.set('solution', this.input);
        return this.backtrack(assignment, csp);
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
        console.log('aaa', values);
        if(!values || values.size === 0) {
            return undefined;
        }
        for(let i = 0; i < values.size; i =+ 1) {
            const row = variable.get('row');
            const col = variable.get('col');
            const value = values.toArray()[i];
            let solution = assignment.get('solution');
            
            solution[row][col] = value;
            assignment = assignment.set('solution', solution);
            console.log(row, col);
            console.log(solution);

            let result = this.backtrack(assignment, newCsp);
            console.log(result);
            if(result && this.isComplete(result)) {
                return result;
            }

            // csp = csp.set('solvedNodes', csp.get('solvedNodes').pop());
            // csp = csp.set('unsolvedNodes', csp.get('unsolvedNodes').push(variable));
            console.log(csp.get('unsolvedNodes').size);
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
        // for(let i = 0; i < 9; i += 1) {
        //     for(let i = 0; i < 9; i += 1) {

        //     }
        // }
        csp.get('solvedNodes').forEach(node => {
            const i = node.get('row');
            const j = node.get('col');
            if(row === i || col === j || 
                (Math.floor(row / 3) === Math.floor(i / 3) && 
                Math.floor(col / 3) === Math.floor(j / 3))) {
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
        assignment.solution.forEach(elements => {
            elements.forEach(element => {
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