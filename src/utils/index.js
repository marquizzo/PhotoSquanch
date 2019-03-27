/*
 * Tween to target using Zeno's Paradox
 * If distance between _val & _target is very small, return _target
 */
export function zTween(_val, _target, _ratio) {
    return Math.abs(_target - _val) < 1e-5 ? _target : _val + (_target - _val) * Math.min(_ratio, 1.0);
}

// Random integer from <low, high> interval
export function randInt(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
}

// Fisher-Yates Shuffle
export function shuffle(array) {
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
    constructor(_timeMultip) {
        this.delta = 0;
        this.seconds = 0;
        this.nowTime = 0;
        this.prevTime = 0;
        this.totalTime = 0;
        this.timeMultip = typeof _timeMultip === "undefined" ? 1 : _timeMultip;
        this.frameCount = 0;
    }

    update(_timeStamp) {
        this.seconds = _timeStamp / 1000;
        this.delta = this.seconds - this.prevTime;

        // Avoids long skips if delta is more than 1 second.
        this.delta = this.delta >= 1.0 ? 0.0 : this.delta;
        this.nowTime += this.delta * this.timeMultip;
        this.totalTime += this.delta;
        this.frameCount++;
        this.prevTime = this.seconds;
    }
}
