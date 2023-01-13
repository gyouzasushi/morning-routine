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
const g = new Array<Array<number>>();
let n = 0;
let leftCount = 0;
let rightCount = 0;
let offsetLeft = 30;
let offsetRight = 0;
let queryCount = 0;
let queryMax = 0;
let inv = new Array<number>();
let p = new Array<number>();


function createrRoutineView(str: string, id: number, len: number, classname: string = 'none'): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', `${offsetLeft}`);
    bg.setAttribute('y', `${(id * 2 + 0.5) * size}`);
    bg.setAttribute('height', '1.6em');
    bg.setAttribute('width', `${len + 20}`);
    bg.setAttribute('fill', 'none');
    bg.setAttribute('stroke', 'black');
    bg.setAttribute('stroke-width', '1.5');
    bg.setAttribute('class', classname);
    const fg = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    fg.setAttribute('font-size', '100%');
    fg.textContent = str;
    fg.setAttribute('x', `${offsetLeft + 10}`);
    fg.setAttribute('y', `${(id * 2 + 1.4) * size}`);
    fg.setAttribute('dominant-baseline', 'middle');
    fg.setAttribute('class', classname);
    svg.appendChild(bg);
    svg.appendChild(fg);
    return svg;
}
function clearField() {
    while (routineField.firstChild) routineField.removeChild(routineField.firstChild);
}
function showRoutines() {
    while (p.length < routines.length) {
        const i = p.length;
        p.push(i);
    }
    routineField.setAttribute('height', `${routines.length * 2 + 1}em`)
    for (let i = 0; i < routines.length; i++) {
        const routine = routines[p[i]];
        const routineView = createrRoutineView(routine, p[i], getWidth(routine));
        routineField.appendChild(routineView);
    }
}
function createArrowLeft(s: number, t: number, classname: string = 'none'): SVGElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'black');
    const sx = offsetLeft;
    const sy = (s * 2 + 1.6) * size;
    const tx = offsetLeft;
    const ty = (t * 2 + 1.0) * size;
    const x = offsetLeft - leftIndice[s] * 10 - 5;
    if (s < t) {
        arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty - 5} 
    l ${5} ${5}
    H ${tx} 
    M ${tx - 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx - 6} ${ty + 3}
    `);
    } else {
        arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty + 5} 
    l ${5} ${-5}
    H ${tx} 
    M ${tx - 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx - 6} ${ty + 3}
    `);
    }
    arrow.setAttribute('class', classname);
    return arrow;
}
function createArrowRight(s: number, t: number, classname: string = 'none'): SVGElement {
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('stroke', 'black');
    while (p.length < s || p.length < t) {
        const i = p.length;
        p.push(i);
    }
    console.log('p:', p);
    const sx = offsetLeft + getWidth(routines[p[s]] + 20);
    const sy = (s * 2 + 1.6) * size;
    const tx = offsetLeft + getWidth(routines[p[t]] + 20);
    const ty = (t * 2 + 1.0) * size;
    const x = offsetRight + rightIndice[s] * 10 + 5;
    if (s < t) {
        arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty - 5} 
    l ${-5} ${5}
    H ${tx} 
    M ${tx + 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx + 6} ${ty + 3}
    `);
    } else {
        arrow.setAttribute('d', `
    M ${sx} ${sy} 
    H ${x} 
    V ${ty + 5} 
    l ${-5} ${-5}
    H ${tx} 
    M ${tx + 6} ${ty - 3}
    L ${tx} ${ty}
    L ${tx + 6} ${ty + 3}
    `);
    }
    arrow.setAttribute('class', classname);
    return arrow;
}
function addArrowLeft(s: number, t: number, classname: string = 'none') {
    leftEdges.push([s, t]);
    if (leftIndice[s] == 0) {
        leftCount++, leftIndice[s] = leftCount;
        if (leftCount > 2) offsetLeft += 10, offsetRight += 10;
    }
    for (const [s, t] of leftEdges) routineField.appendChild(createArrowLeft(s, t, classname));
    for (const [s, t] of rightEdges) routineField.appendChild(createArrowRight(s, t, classname));
}
function addArrowRight(s: number, t: number, classname: string = 'none') {
    rightEdges.push([s, t]);
    if (rightIndice[s] == 0) rightCount++, rightIndice[s] = rightCount;
    for (const [s, t] of leftEdges) routineField.appendChild(createArrowLeft(s, t, classname));
    for (const [s, t] of rightEdges) routineField.appendChild(createArrowRight(s, t, classname));
}
function clearArrowData() {
    while (leftEdges.length > 0) leftEdges.pop();
    while (rightEdges.length > 0) rightEdges.pop();
    leftCount = 0;
    rightCount = 0;
    leftIndice.fill(0);
    rightIndice.fill(0);
    offsetLeft = 30;
    offsetRight = offsetLeft;
    for (const routine of routines) {
        offsetRight = Math.max(offsetRight, getWidth(routine) + offsetLeft + 20);
    }
}


addButton.onclick = () => {
    const routine = routineInput.value;
    routineInput.value = "";
    if (routine.length === 0) return;
    routines.push(routine);
    offsetRight = Math.max(offsetRight, getWidth(routine) + offsetLeft + 20);
    clearField();
    showRoutines();
};
nextButton.onclick = () => {
    n = routines.length;
    if (n < 2) return;
    queryMax = n * (n - 1) >> 1;
    while (leftIndice.length < n) leftIndice.push(0);
    while (rightIndice.length < n) rightIndice.push(0);
    while (g.length < n) g.push(new Array<number>());
    document.getElementById("phase")!.textContent = "手順２";
    document.getElementById("gyouza")!.innerHTML =
        `<p id="query_s"> ${routines[0]} は</p>` +
        `<p id="query_t"> ${routines[1]} より</p>` +
        "<p>" +
        "<input type='button' id='former' value='前' onclick='formerButtonOnclick()'>" +
        "<input type='button' id='same' value='どちらでも' onclick='sameButtonOnclick()'>" +
        "<input type='button' id='later' value='後' onclick='latterButtonOnclick()'>" +
        `<span id = 'answer'>（${1}/${queryMax}） </span>` +
        "<input type='button' id='done' value='手順３へ' onclick='doneButtonOnclick()' style='visibility: hidden'>" +
        "</p>";
}
function formerButtonOnclick() {
    if (queryCount == queryMax) return;
    const [s, t] = getQuery(queryCount);
    g[s].push(t);
    clearField();
    addArrowLeft(s, t);
    showRoutines();
    queryCount++;
    if (queryCount == queryMax) {
        document.getElementById("done")!.style.visibility = 'visible';
        return;
    }
    const [ns, nt] = getQuery(queryCount);
    document.getElementById("query_s")!.textContent = `${routines[ns]} は`;
    document.getElementById("query_t")!.textContent = `${routines[nt]} より`;
    document.getElementById("answer")!.textContent = `（${queryCount + 1}/${queryMax}） `;
}
function latterButtonOnclick() {
    if (queryCount == queryMax) return;
    const [s, t] = getQuery(queryCount);
    g[t].push(s);
    clearField();
    addArrowRight(t, s);
    showRoutines();
    queryCount++;
    if (queryCount == n * (n - 1) >> 1) {
        document.getElementById("done")!.style.visibility = 'visible';
        return;
    }
    const [ns, nt] = getQuery(queryCount);
    document.getElementById("query_s")!.textContent = `${routines[ns]} は`;
    document.getElementById("query_t")!.textContent = `${routines[nt]} より`;
    document.getElementById("answer")!.textContent = `（${queryCount + 1}/${queryMax}） `;
}
function sameButtonOnclick() {
    if (queryCount == queryMax) return;
    queryCount++;
    if (queryCount == n * (n - 1) >> 1) {
        document.getElementById("done")!.style.visibility = 'visible';
        return;
    }
    const [ns, nt] = getQuery(queryCount);
    document.getElementById("query_s")!.textContent = `${routines[ns]} は`;
    document.getElementById("query_t")!.textContent = `${routines[nt]} より`;
    document.getElementById("answer")!.textContent = `（${queryCount + 1}/${queryMax}） `;
}
function doneButtonOnclick() {
    document.getElementById("phase")!.textContent = "手順３";
    document.getElementById("gyouza")!.innerHTML =
        "<p>" +
        "<input type='button' id='sort' value='並び替える' onclick='sorting()'>" +
        "<span id='error' style='color:red; visibility:hidden'> 失敗！（ループがないか確認してください）</span>" +
        "</p>";

}
function sorting() {
    p = getSorted();
    if (p.length < n) {
        document.getElementById("error")!.style.visibility = 'visible';
        return;
    }
    inv = getInv(p);
    clearField();
    clearArrowData();
    for (let s = 0; s < n; s++) {
        for (const t of g[s]) {
            clearField();
            if (inv[s] % 2 == 0) addArrowRight(inv[s], inv[t], 'arrow');
            if (inv[s] % 2 == 1) addArrowLeft(inv[s], inv[t], 'arrow');
        }
    }
    for (let i = 0; i < routines.length; i++) {
        document.getElementById('style')!.appendChild(
            document.createTextNode(getCssrule(i, inv[i] - i))
        );
        const routine = routines[i];
        const routineView = createrRoutineView(routine, i, getWidth(routine), `sorting${i}`);
        routineField.appendChild(routineView);
    }
}

function getWidth(str: string): number {
    return ctx.measureText(str).width * 1.6;
}
function getQuery(id: number): [number, number] {
    id++;
    let s = 0, t = 0;
    let sum = 0;
    while (sum + (n - 1 - s) < id && s < n) {
        sum += n - 1 - s;
        s++;
    }
    t = s + (id - sum);
    return [s, t];
}
function getSorted() {
    const deg = new Array<number>(n).fill(0);
    for (let u = 0; u < n; u++) {
        for (const v of g[u]) deg[v]++;
    }
    const ret = new Array<number>();
    const s = new Array<number>();
    for (let u = 0; u < n; u++) {
        if (deg[u] == 0) s.push(u);
    }

    while (s.length > 0) {
        const i = Math.floor(Math.random() * s.length);
        const u = s[i];
        s.splice(i, 1);
        ret.push(u);
        for (const v of g[u]) {
            if (--deg[v] == 0) {
                s.push(v);
            }
        }
    }
    return ret;
}
function getInv(p: Array<number>) {
    const ret = new Array<number>(n);
    for (let i = 0; i < n; i++) {
        ret[p[i]] = i;
    }
    return ret;
}
function getCssrule(id: number, dy: number) {
    return `.sorting${id} { animation: sortingAnime${id} ease-in-out 2s both; }\n` +
        `@keyframes sortingAnime${id} {
    0% {transform: translate(0%, 0%); }
    100% {transform: translateY(${dy * 2 * size}px);}
}`;
}