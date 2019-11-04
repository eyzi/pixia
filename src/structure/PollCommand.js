"use strict";

class LwrpCommand{
    constructor(data){
        this.poller = data.poller;
        this.command = data.command;
        this.count = data.count || null;
    }

    async checkValid(){
        if (this.count && this.count<=0) {
            this.remove();
        }
    }

    call(){
        if (this.count && this.count>0) {
            this.count-=1;
            this.checkValid();
        }
        return this.command;
    }

    remove(){
        this.poller.removeCommand(this.command);
    }

    toString(){
        return this.command;
    }
}
