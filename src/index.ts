const addButton = <HTMLButtonElement>document.getElementById("add_routine")!;
const nextButton = document.getElementById("add_complete")!;
const routineInput = <HTMLInputElement>document.getElementById("input_routine")!;
const routineField = document.getElementById("routine_field")!;
const ctx = document.createElement('canvas').getContext('2d')!;

const size = 16;
const routines = new Array<string>();
const leftEdges = new Array<[number, number]>();
const rightEdges = new Array<[number, number]>();
const leftIndice = new Array<number>();
const rightIndice = new Array<number>();
let n = 0;
let leftCount = 0;
let rightCount = 0;
let offsetLeft = 30;
let offsetRight = 0;

function createrRoutineView(str: string, id: number, len: number): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', `${offsetLeft}`);
    bg.setAttribute('y', `${(id * 2 + 0.5) * size}`);
    bg.setAttribute('height', '1.6em');
    bg.setAttribute('width', `${len + 20}`);
    bg.setAttribute('fill', 'none');
    bg.setAttribute('stroke', 'black');
    bg.setAttribute('stroke-width', '1.5');
    const fg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    fg.setAttribute('font-size', '100%');
    fg.textContent = str;
    fg.setAttribute('x', `${offsetLeft + 10}`);
    fg.setAttribute('y', `${(id * 2 + 1.4) * size}`);
    fg.setAttribute('dominant-baseline', 'middle');
    svg.appendChild(bg);
    svg.appendChild(fg);
    return svg;
}
function clearField() {
    while (routineField.firstChild) routineField.removeChild(routineField.firstChild);
}
function showRoutines() {
    routineField.setAttribute('height', `${routines.length * 2 + 1}em`)
    for (let i = 0; i < routines.length; i++) {
        const routine = routines[i];
        const routineView = createrRoutineView(routine, i, getWidth(routine));
        routineField.appendChild(routineView);
    }
}
function createArrowLeft(s: number, t: number): SVGElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'black');
    const sx = offsetLeft;
    const sy = (s * 2 + 1.6) * size;
    const tx = offsetLeft;
    const ty = (t * 2 + 1.0) * size;
    const x = offsetLeft - leftIndice[s] * 10 - 5;
    arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty} 
    H ${tx} 
    M ${tx - 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx - 6} ${ty + 3}
    `);
    return arrow;
}
function createArrowRight(s: number, t: number): SVGElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'black');
    const sx = offsetLeft + getWidth(routines[s] + 20);
    const sy = (s * 2 + 1.6) * size;
    const tx = offsetLeft + getWidth(routines[t] + 20);
    const ty = (t * 2 + 1.0) * size;
    const x = offsetRight + rightIndice[s] * 10 + 5;
    arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty} 
    H ${tx} 
    M ${tx + 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx + 6} ${ty + 3}
    `);
    return arrow;
}
function addArrow(s: number, t: number) {
    if (s < t) {
        leftEdges.push([s, t]);
        if (leftIndice[s] == 0) leftCount++, leftIndice[s] = leftCount;
        if (leftCount > 2) offsetLeft += 10;
    } else {
        rightEdges.push([s, t]);
        if (rightIndice[s] == 0) rightCount++, rightIndice[s] = rightCount;
    }
    for (const [s, t] of leftEdges) routineField.appendChild(createArrowLeft(s, t));
    for (const [s, t] of rightEdges) routineField.appendChild(createArrowRight(s, t));
}


addButton.onclick = () => {
    const routine = routineInput.value;
    routineInput.value = "";
    if (routine.length === 0) return;
    routines.push(routine);
    offsetRight = Math.max(offsetRight, getWidth(routine) + offsetLeft + 20);
    showRoutines();
};
nextButton.onclick = () => {
    addButton.disabled = true;
    routineInput.disabled = true;
    n = routines.length;
    while (leftIndice.length < n) leftIndice.push(0);
    while (rightIndice.length < n) rightIndice.push(0);
    clearField();
    addArrow(0, 5);
    addArrow(5, 0);
    showRoutines();
}



function getWidth(str: string): number {
    return ctx.measureText(str).width * 1.6;
}