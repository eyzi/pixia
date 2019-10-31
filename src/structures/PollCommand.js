"use strict";

/**
 * Axia Device Poll Command Object
 */
class PollCommand{
	constructor(data){
        this.id = data.id;
        this.command = data.command;
        this.counter = data.counter || null; // null for infinite
	}

    updateCount(count=1){
        if (this.counter && this.counter>0) {
            this.counter--;
        }
    }

    isValid(){
        return (!this.counter || this.counter>0);
    }

	toString(){
		return this.id;
	}
}

module.exports = PollCommand;
