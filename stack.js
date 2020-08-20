class stack {

    constructor(maxSize) {
        this.array = new Array(maxSize)
        this.top = 0
    }

    push(data) {
        this.array[this.top] = data
        this.top++;
    }

    pop() {
        this.top--;
        let res = this.array[this.top]
        return res
    }

    tope() {
        return this.array[this.top - 1]
    }

    size() {
        return this.top
    }
}

module.exports = stack