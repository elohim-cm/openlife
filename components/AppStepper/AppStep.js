import React from "react";

class AppStep {
    title;
    isActive;
    completed;
    child;

    constructor(title, isActive, completed, child) {
        this.title = title;
        this.isActive = isActive;
        this.completed = completed;
        this.child = child;
    }

    setActive(_val) {
        this.isActive = _val;
    }

    setComplete(_val) {
        this.completed = _val;
    }
}

export default AppStep;