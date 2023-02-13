// 'use strict'

import $ from 'jquery';

const minTimelineWidth = 200;
const minDescrColWidth = 100;
let descriptionColumnWidth = minDescrColWidth;

let viewSettings = {
    descriptionColumnWidth: minDescrColWidth,

}

let interStyle = new function() {

    let $style = $('<style>')
    .appendTo('head');

    let s = {
        descriptionColumnWidth: minDescrColWidth,
        durationColumnWidth: 100,
    };

    this.d = s;

    this.update = () => {

        style = `
.cell.descr {

    width: ${s.descriptionColumnWidth}px;
}
        `;
        $style.text(style);
        
        // (function(){/**
        // **/}).toString().slice(15,-5);
    };

    this.descriptionColumnWidth = (width) => {

        s.descriptionColumnWidth = width;
        this.update();
    };

    this.durationColumnWidth = (width) => {

        s.durationColumnWidth = width;
        this.update();
    };
}();

interStyle.update();

let roadmapBox = $('<div>')
.addClass('roadmap')
.appendTo('body')

let rowPrototype = new function() {

    this.pingMsg = 'RowPrototype';
    this.ping = function() {
        
        console.log(this.pingMsg);
    };

    this.setDuration = function(duration) {

        console.warn('setDuration() is not defined in', this.constructor);
    };

    this.parseDuration = function(duration) {

        let {days, hours, minutes} = duration;

        minutes = Math.round(minutes / 10) * 10;
        let val = (days * shiftSize + hours) * 60 + minutes;
        
        if(val < 0) {
         
            days = 0;
            hours = 0;
            minutes = 0;
        }
        else if(minutes >= 60 || minutes < 0 || hours >= shiftSize || hours < 0) {


            console.log('val:', val);
            minutes = val % 60;
            val -= minutes;
            hours = val / 60;
            val = hours;
            hours = hours % shiftSize;
            val -= hours;
            days = val / shiftSize;

            this.setDuration({days, hours, minutes});
        }
        else if(minutes != Math.round(minutes / 10) * 10) {

            $duration.minutes.val(Math.round(minutes / 10) * 10);
        }

        this.setDuration({days, hours, minutes});
        // this.pushDuration();
        //roadmapCtrl.pullDuration();
        this.ping();

        return {days, hours, minutes};
    };

    this.getDuration = () => {

        return this.model.duration;
    };

    const shiftSize = 8; // hours
    const duration2minutes = (duration) => {

        return (duration.days * shiftSize + duration.hours) * 60 + duration.minutes;
    };

    const minutes2duration = (minutes) => {

        let val = minutes;
        minutes = val % 60;
        val -= minutes;
        let hours = val / 60;
        val -= hours;
        days = val / 60;
        return {days, hours, minutes};
    };

    this.pullDuration = () => {

        const subtasks = this.model.subtasks;
        
        if(!subtasks.length)
            return;
        
        let minutes = 0;
        for(let i=0; i<subtasks.length; ++i) {

            subtasks[i].ctrl.pullDuration();
            minutes += duration2minutes(subtasks[i].getDuration());
        }

        this.setDuration(minutes2duration(minutes));
    };

    this.pushDuration = () => {

        let minutes = duration2minutes(this.model.duration);

        for(let task=this.model.parent; task; task=task.parent) {

            minutes += duration2minutes(task.duration);
            task.ctrl.setDuration(minutes2duration(minutes));
        }
    };
}();


let HeaderRow = function() {

    this.pingMsg = 'HeaderRow';

    this.model = {
        duration: {days: 0, hours: 0, minutes: 0},
        subtasks: [],
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;
    };

    this.pullDuration = () => {

        const subtasks = this.model.subtasks;
        
        if(!subtasks.length)
            return;
        
        let minutes = 0;
        for(let i=0; i<subtasks.length; ++i) {

            subtasks[i].ctrl.pullDuration();
            minutes += duration2minutes(subtasks[i].getDuration());
        }

        this.setDuration(minutes2duration(minutes));
    };

    let row = $('<div>')
    .addClass('row')
    .addClass('header')

    this.$ = row;
    row.appendTo(roadmapBox);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo(row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo(row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(parentBox)

    let content = $('<div>')
    .addClass('content')
    .appendTo(descr)

    let text = $('<div>')
    .addClass('text')
    .text('Task description')
    .appendTo(content)

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)  
    .mousedown(onSplitterMove)

    $('<div>')
    .addClass('cell')
    .addClass('duration')
    .appendTo(parentBox)
    .append(
        $days = $('<div>')
        .addClass('title')
        .append(
            $('<div>')
            .text('Days')
        )
    )
    .append(
        $days = $('<div>')
        .addClass('title')
        .append(
            $('<div>')
            .text('Hours')
        )
    )
    .append(
        $days = $('<div>')
        .addClass('title')
        .append(
            $('<div>')
            .text('Minutes')
        )
    )

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)
};

let FooterRow = function() {

    let row = $('<div>')
    .addClass('row')
    .addClass('footer')

    this.$ = row;
    row.appendTo(roadmapBox);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo(row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo(row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(parentBox)

    let content = $('<div>')
    .addClass('content')
    .appendTo(descr)

    let text = $('<div>')
    // .addClass('text')
    .addClass('epic-appendor')
    .text('+ Add epic')
    .appendTo(content)
    .click(() => {

        console.log('add epic');

        new TaskRow(roadmapCtrl);
        saveCurrentModel();
    })

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)  
    .on('mousedown', onSplitterMove)
};

let modelWithoutParent = (task) => {

    let m = {
        descr: task.descr,
        start: task.start,
        duration: task.duration,
        unrolled: task.unrolled,
        subtasks: [],
    };

    for(let i=0; i<task.subtasks.length; ++i) {

        let subtask = task.subtasks[i];

        m.subtasks.push(modelWithoutParent(subtask));
    }

    return m;
}

let onSplitterMove = (e) => {

    let mousePressPos = {
        x: e.originalEvent.screenX,
        y: e.originalEvent.screenY,
    };

    let initWidth = interStyle.d.descriptionColumnWidth;
    let currentWidth;

    let mouseMove = (e) => {

        let mouseMovePos = {
            x: e.originalEvent.screenX,
            y: e.originalEvent.screenY,
        };

        let currentPos = initWidth + mouseMovePos.x - mousePressPos.x;

        currentPos = currentPos > 100
            ? (currentPos < roadmapBox.width() - minTimelineWidth
                ? currentPos
                : roadmapBox.width() - minTimelineWidth
            )
            : 100;
        interStyle.descriptionColumnWidth(currentPos);
        currentWidth = currentPos;
    };

    let mouseUp = (e) => {

        mouseMove(e);
        // descriptionColumnWidth = currentWidth;
        $(window).off('mousemove', mouseMove);
        $(window).off('mouseup', mouseUp);
    };

    $(window).on('mousemove', mouseMove);
    $(window).on('mouseup', mouseUp);
};

let TaskRow = function(parentTask) {

    this.pingMsg = 'TaskRow';

    this.model = {
        descr: "Task description",
        start: null,
        duration: {days: 0, hours: 0, minutes: 0},
        unrolled: false,
        subtasks: [],
        parent: null,
        ctrl: this,
    };

    this.setDescription = (descr) => {

        this.model.descr = descr;
        text.text(descr);
    };

    this.setStart = (start) => {

        this.model.start = start;
        //! view update
    };

    this.setDuration = (duration) => {

        this.model.duration = duration;

        $duration.days.val(duration.days);
        $duration.hours.val(duration.hours);
        $duration.minutes.val(duration.minutes);
    };

    this.remove = () => {

        let s = this.model.parent.subtasks;
        let idx = s.indexOf(this.model);
        s.splice(idx, 1);
        this.$.remove();

        saveCurrentModel();
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;

        let root = this.model;
        while(root.parent)
            root = root.parent;
    };

    this.unRoll = () => {

        openarrow.prop('checked', true);
        this.model.unrolled = true;
    };

    this.collapse = () => {

        openarrow.prop('checked', false);
        this.model.unrolled = false;
    };

    let row = $('<div>')
    .addClass('row')
    .addClass(parentTask == roadmapCtrl ? 'epic' : 'task')

    this.$ = row;

    (parentTask || roadmapCtrl).appendSubTask(this);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo(row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo(row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(parentBox)

    let content = $('<div>')
    .addClass('content')
    .appendTo(descr)

    let openarrow = $('<input>')
    .addClass('openarrow')
    .attr('type', 'checkbox')
    .appendTo(content)
    .click((e) => {

        this.model.unrolled = !this.model.unrolled;
    });

    let text = $('<div>')
    .addClass('text')
    .text(this.model.descr)
    .attr('contenteditable', true)
    .appendTo(content)
    .on('keydown', (e) => {

        const codeEnter = 13;
        const codeEsc = 27;
        console.log(e.keyCode)

        if(e.keyCode == codeEnter) {

            this.model.descr = text.text();
            saveCurrentModel();

            console.log(text.text());
            e.preventDefault();

            text.blur();

            window.getSelection().removeAllRanges();
        }
        else if(e.keyCode == codeEsc) {

            e.preventDefault();

            text.text(this.model.descr);

            text.blur();

            window.getSelection().removeAllRanges();
        }
    })
    .blur((e) => {

        this.model.descr = text.text();
        saveCurrentModel();

        console.log(text.text());
        e.preventDefault();

        window.getSelection().removeAllRanges();

    })

    $('<div>')
    .addClass('cell')
    .addClass('task-tool-box')
    .appendTo(descr)
    .append(
        $('<div>')
        .addClass('button')
        .addClass('task-appendor')
        .prop('title', 'Add subtask')
        .html('&#8600;')
        .html('&#65291;')
        .html('&#11175;')
        .html('	&#43;')
        .click(() => {
    
            let task = new TaskRow(this);
            this.unRoll();
            saveCurrentModel();
        })
    )
    .append(
        $('<div>')
        .addClass('button')
        .addClass('task-remover')
        .prop('title', 'Remove task tree')
        .html('&#10005;')
        .html('	&#8855;')
        .html('	&#9746;')
        .click(() => {
    
            if(confirm(`Remove task "${this.model.descr}"?`))
                this.remove();
        })
    )

    /*
    $('<div>')
    .addClass('appendor-box-med')
    .appendTo(parentBox)
    .append(
        $('<div>')
        .addClass('append-button')
    )
    */

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)
    .on('selectstart', (e) => {

        e.preventDefault();
        e.stopPropagation();

        return false;
    })
    .on('mousedown', onSplitterMove)

    const parseDuration = () => {

        let duration = {
            minutes: parseInt($duration.minutes.val()),
            hours: parseInt($duration.hours.val()),
            days: parseInt($duration.days.val()),
        };

        duration = this.parseDuration(duration);
    };

    const $duration = {};

    $('<div>')
    .addClass('cell')
    .addClass('duration')
    .appendTo(parentBox)
    .append(
        $duration.days = $('<input>')
        .addClass('days')
        .prop('type', 'number')
        .prop('min', -1)
        .prop('step', 1)
        .val('0')
        .on('change', parseDuration)
    )
    .append(
        $duration.hours = $('<input>')
        .addClass('hours')
        .prop('type', 'number')
        .prop('min', -1)
        .prop('max', 8)
        .prop('step', 1)
        .val('0')
        .on('change', parseDuration)
    )
    .append(
        $duration.minutes = $('<input>')
        .addClass('minutes')
        .prop('type', 'number')
        .prop('min', -10)
        .prop('max', 60)
        .prop('step', 10)
        .val('0')
        .on('change', parseDuration)
    )

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)
};

HeaderRow.prototype = rowPrototype;
TaskRow.prototype = rowPrototype;

let roadmapCtrl = new HeaderRow();
let footer = new FooterRow();

let saveModelOnUnload = () => {saveModel()};
let saveCurrentModel = () => {};

let saveModel = () => {

    let roadmapModel = modelWithoutParent(roadmapCtrl.model);
    console.log('saveModel:', roadmapModel);

    let settings = {
        descriptionColumnWidth: interStyle.d.descriptionColumnWidth,
    };

    console.log(settings);

    localStorage.setItem('roadmap', JSON.stringify(roadmapModel));
    localStorage.setItem('roadmapSettings', JSON.stringify(settings));
};

let buildBranch = (taskCtrl, taskModel) => {

    for(let i=0; i<taskModel.subtasks.length; ++i) {

        let subTaskModel = taskModel.subtasks[i];

        let subTaskCtrl = new TaskRow(taskCtrl);
        subTaskCtrl.setDescription(subTaskModel.descr);
        subTaskCtrl.setStart(subTaskModel.start);
        subTaskCtrl.setDuration(subTaskModel.duration);
        subTaskCtrl[
            subTaskModel.unrolled
            ? 'unRoll'
            : 'collapse'
        ]();

        buildBranch(subTaskCtrl, subTaskModel);
    }
}

let loadModel = () => {

    let roadmapModel = localStorage.getItem('roadmap');
    console.log('Model on load:', roadmapModel);

    if(!roadmapModel)
        return;

    roadmapModel = JSON.parse(roadmapModel);
    console.log('loadModel:', roadmapModel);
    buildBranch(roadmapCtrl, roadmapModel);

    let settings = localStorage.getItem('roadmapSettings');
    console.log("settings:", settings);
    if(settings) {

        settings = JSON.parse(settings);
        interStyle.descriptionColumnWidth(settings.descriptionColumnWidth)
    }
};

loadModel();

addEventListener('unload', saveModelOnUnload);