class Cell {
    constructor (value, ...functionCells) {
        this.value = Number.isFinite(value)? value : value().result; //take a value or run a function to return value
        this.dependants = [];
        this.function = Number.isFinite(value)? function(){}: value();
        this.functionCells = functionCells;
        functionCells.forEach(cell => {cell.dependants.push(this)});
    }
    changeValue (value, ...functionCells) {
        Number.isFinite(value)? this.value += value: this.value = value().result
        if (Number.isFinite(!value)) {
            this.function = value;
            functionCells.forEach(cell => {cell.dependants.push(this)});
            // TODO: need to remove cell instance from cell dependants when new formula dictates. Check this function cells with passed in function cells - remove cells as needed
         }
         this.dependants.forEach(dependant => {dependant.updateValueFunction()})
    }
    updateValueFunction () {
        this.value = this.function.updateResult()
    }
}
class SumFormula {
    constructor(...cells){
        this.cells = cells
        this.result = 0
        this.formula = () => this.cells.forEach((cell) => {
            this.result += cell.value
        });
        this.formula()
        return () => this
    }
    updateResult () {
        this.result = 0
        this.formula() //update the instance result by recalculating formula - which updates the result
        return this.result
    }
}
//run - $node spreadsheet
const a1 = new Cell(7);
const a2 = new Cell(3);
const a3 = new Cell(5);
const a4 = new Cell(new SumFormula(a1, a2, a3), a1, a2, a3);

console.log('a1', a1.value);
console.log('a2', a2.value);
console.log('a3', a3.value);
console.log('a4', a4.value);
a1.changeValue(-2);
console.log('changed a1', a1.value);
console.log('changed a4', a4.value);
//extra check of functionality
a1.changeValue(-2);
console.log('x2 changed a1', a1.value);
a4.changeValue(new SumFormula(a2, a3), a2, a3); // TODO: when changing function arguments, need to update dependants prop.
console.log('x2 changed a4', a4.value);
