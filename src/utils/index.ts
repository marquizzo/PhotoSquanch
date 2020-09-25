/*
 * Tween to target using Zeno's Paradox
 * If distance between _val & _target is very small, return _target
 */
export function zTween(val: number, target: number, ratio: number): number {
    return Math.abs(target - val) < 1e-5 ? target : val + (target - val) * Math.min(ratio, 1.0);
}

// Random integer from <low, high> interval
export function randInt(low: number, high: number): number {
    return low + Math.floor(Math.random() * (high - low + 1));
}

// Normalizes val range from [max, min] to [0, 1]
export function normalize(val: number, max: number, min: number): number {
    return (val - min) / (max - min);
}

// Maps range from [oldMin, oldMax] to [newMin, newMax]
export function map( val: number, oldMin: number, oldMax: number, newMin: number, newMax: number ) {
    return newMin + ( val - oldMin ) * ( newMax - newMin ) / ( oldMax - oldMin );
}

// Javascript mod fix
export function mod(n: number, m: number): number {
    return (n % m + m) % m;
}

// Fisher-Yates Shuffle
export function shuffle(array: Array<any>): Array<any> {
    let m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

// Calculates elapsed time since last frame and other time utils
export class Clock {
    public delta: number = 0;
    public nowTime: number = 0;
    public totalTime: number = 0;
    public frameCount: number = 0;
    public timeMultip: number;

    private seconds: number = 0;
    private prevTime: number = 0;

    constructor(timeMultiplier: number = 1) {
        this.timeMultip = timeMultiplier;
    }

    update(timeStampMS: number = 0): void {
        this.seconds = timeStampMS / 1000;
        this.delta = this.seconds - this.prevTime;

        // Avoids long skips if delta is more than 1 second.
        this.delta = this.delta >= 1.0 ? 0.0 : this.delta;
        this.nowTime += this.delta * this.timeMultip;
        this.totalTime += this.delta;
        this.frameCount++;
        this.prevTime = this.seconds;
    }
}
