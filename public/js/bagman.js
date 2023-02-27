// 'use strict'

import $ from 'jquery';

const hasBackend = window.location.port == 13048;
console.log('Bakend mode:', hasBackend);

const minTimelineWidth = 200;
const minDescrColWidth = 340;
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
        shiftWidth: 50,
        shiftPos: -50,
    };

    this.d = s;

    this.update = () => {

        let style = `
.roadmap .row .cell.descr {

    width: ${s.descriptionColumnWidth}px;
}

.roadmap .row .cell.time-box .shift-box {

    left: ${s.shiftPos}px;
    width: ${s.shiftWidth}px;
}
        `;
        $style.text(style);
    };

    this.descriptionColumnWidth = (width) => {

        s.descriptionColumnWidth = width;
        this.update();
    };

    this.durationColumnWidth = (width) => {

        s.durationColumnWidth = width;
        this.update();
    };

    this.shiftWidth = (width) => {

        s.shiftWidth = width;
        this.update();
    };

    this.shiftPos = (pos) => {

        s.shiftPos = pos;
        this.update();
    };
}();

interStyle.update();

let roadmapBox = $('<div>')
.addClass('roadmap')
.appendTo('body')

let RowPrototype = function() {

    this.pingMsg = 'RowPrototype';
    this.ping = function() {
        
        console.log(this.pingMsg);
    };

    this.setDuration = function(duration) {

        console.warn('setDuration() is not defined in', this);
    };
    
    this.setStart = function(start) {

        console.warn('setStart() is not defined in', this);
    };

    this.formatDuration = function(duration) {

        let {days, hours, minutes} = duration;

        minutes = Math.round(minutes / 10) * 10;
        let val = (days * this.shiftSize + hours) * 60 + minutes;
        
        if(val < 0) {
         
            days = 0;
            hours = 0;
            minutes = 0;
        }
        else if(minutes >= 60 || minutes < 0 || hours >= this.shiftSize || hours < 0) {


            let x = this.minutes2duration(val);
            days = x.days;
            hours = x.hours;
            minutes = x.minutes;

            // this.setDuration({days, hours, minutes});
        }
        else if(minutes != Math.round(minutes / 10) * 10) {

            minutes = Math.round(minutes / 10) * 10;
        }

        return {days, hours, minutes};
    };

    this.getDuration = function() {

        return this.model.duration;
    };

    this.shiftSize = 8; // hours
    this.duration2minutes = (duration) => {

        return (duration.days * this.shiftSize + duration.hours) * 60 + duration.minutes;
    };

    this.minutes2duration = (val) => {

        let minutes = val % 60;
        val -= minutes;
        val /= 60;
        let hours = val % this.shiftSize;
        val -= hours;
        let days = val / this.shiftSize;
        return {days, hours, minutes};
    };

    this.pullDuration = function() {

        const subtasks = this.model.subtasks;
        
        if(!subtasks.length) {

            return;
        }
        
        let minutes = 0;
        for(let i=0; i<subtasks.length; ++i) {

            let subtask = subtasks[i];
            // subtask.ctrl.setStart(this.model.start + minutes);
            subtask.ctrl.pullDuration();
            minutes += this.duration2minutes(subtask.ctrl.getDuration());
            // subtask.ctrl.setDuration(subtask.ctrl.getDuration());
        }

        this.setDuration(this.minutes2duration(minutes));
    };

    this.forwardStart = function(start) {

        this.setStart(start);

        const subtasks = this.model.subtasks;
        
        if(!subtasks.length) {

            return;
        }
        
        let minutes = start;
        for(let i=0; i<subtasks.length; ++i) {

            let subtask = subtasks[i];
            subtask.ctrl.forwardStart(minutes);
            minutes += this.duration2minutes(subtask.ctrl.getDuration());
        }
    };

    this.pushDuration = function(duration) {

        let minutes = this.duration2minutes(duration);
        minutes -= this.duration2minutes(this.model.duration);

        for(let task=this.model.parent; task; task=task.parent) {

            minutes += this.duration2minutes(task.duration);
            task.ctrl.setDuration(this.minutes2duration(minutes));
        }

        this.setDuration(duration);
    };

    this.initColumns = function() {

    };
};


let HeaderRow = function() {

    this.pingMsg = 'HeaderRow';

    this.model = {
        duration: {days: 0, hours: 0, minutes: 0},
        subtasks: [],
        ctrl: this,
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$view);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;
    };

    let $duration = {
        counter: null,
        timeline: null,
    };
    this.setDuration = function(duration) {

        console.warn('HeaderRow.setDuration:');

        this.model.duration = duration;

        const minutes = this.duration2minutes(duration);
        const days = Math.ceil(minutes / 60 / this.shiftSize);

        $duration.counter.text(days);

        // $duration.timeline.clear();
        $duration.shiftBox.html(null);

        for(let i=0; i<days; ++i) {

            $('<div>')
            .addClass('shift')
            .css('left', i*100 + '%')
            .text(i+1)
            .appendTo($duration.shiftBox)
        }
    };

    // this.pullDuration = () => {

    //     const subtasks = this.model.subtasks;
        
    //     if(!subtasks.length)
    //         return;
        
    //     let minutes = 0;
    //     for(let i=0; i<subtasks.length; ++i) {

    //         subtasks[i].ctrl.pullDuration();
    //         minutes += this.duration2minutes(subtasks[i].getDuration());
    //     }

    //     this.setDuration(this.minutes2duration(minutes));
    // };

    let $row = $('<div>')
    .addClass('row')
    .addClass('header')

    this.$view = $row;
    $row.appendTo(roadmapBox);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo($row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo($row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(parentBox)

    let content = $('<div>')
    .addClass('content')
    .appendTo(descr)

    let $resetButton;
    let $saveButton;
    let text = $('<div>')
    .addClass('text')
    .text('Task description')
    .text('Totaly days: ')
    .appendTo(content)
    .append(
        $duration.counter = $('<span>')
    )
    if(0) _
    .append(
        $resetButton = $('<input>')
        .addClass('reset')
        .prop('type', 'button')
        .prop('value', 'reset')
        .on('click', () => {

            //fetchRemoteModel('/src/data.bak.json');
        })
    )
    .append(
        $saveButton = $('<input>')
        .addClass('reset')
        .prop('type', 'button')
        .prop('value', 'save')
        .on('click', () => {

            saveRemoteModel();
        })
    )

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)  
    .on('mousedown', onSplitterMove)

    $('<div>')
    .addClass('cell')
    .addClass('duration')
    .appendTo(parentBox)
    .append(
        $('<div>')
        .addClass('days')
        .addClass('title')
        .append(
            $('<div>')
            .text('Days')
        )
    )
    .append(
        $('<div>')
        .addClass('hours')
        .addClass('title')
        .append(
            $('<div>')
            .text('Hours')
        )
    )
    .append(
        $('<div>')
        .addClass('minutes')
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

    $duration.timeBox = $('<div>')
    .addClass('cell')
    .addClass('time-box')
    .appendTo(parentBox)
    .append(
        $duration.shiftBox = $('<div>')
        .addClass('shift-box')
    )
};

let FooterRow = function() {

    return

    let $row = $('<div>')
    .addClass('row')
    .addClass('footer')

    this.$view = $row;
    $row.appendTo(roadmapBox);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo($row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo($row)

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

const formatModel = (task) => {

    let m = {
        descr: task.descr,
        // start: task.start,
        duration: task.duration,
        unrolled: task.unrolled,
        subtasks: [],
    };

    for(let i=0; i<task.subtasks.length; ++i) {

        let subtask = task.subtasks[i];

        m.subtasks.push(formatModel(subtask));
    }

    return m;
};

const onSplitterMove = (e) => {

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
        
        // debugger
        $duration.chunk.css('left', start / 60 / this.shiftSize * 100 + '%')
    };

    this.setDuration = (duration) => {

        this.model.duration = duration;

        $duration.days.val(duration.days);
        $duration.hours.val(duration.hours);
        $duration.minutes.val(duration.minutes);

        const minutes = this.duration2minutes(duration);
        const days = minutes / 60 / this.shiftSize * 100; 

        $duration.chunk.css('width', days + '%');
    };

    this.remove = () => {

        let s = this.model.parent.subtasks;
        let idx = s.indexOf(this.model);
        s.splice(idx, 1);
        this.$view.remove();
        roadmapCtrl.pullDuration();

        saveCurrentModel();
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$view);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;

        let root = this.model;
        while(root.parent)
            root = root.parent;
    };

    this.unRoll = () => {

        openchecker.prop('checked', true);
        this.model.unrolled = true;
    };

    this.collapse = () => {

        openchecker.prop('checked', false);
        this.model.unrolled = false;
    };

    let mousePressPos;
    const getDistSq = (x, y) => {

        return x*x + y*y;
    };

    const thisTask = this.model;
    const dropTask = function(e) {

        e.stopPropagation();

        // $(this).css('background', 'red')

        $('.roadmap .row').off('mouseup', dropTask);

        const nextTaskCtrl = $(this).prop('task-ctrl');
        const nextTask = nextTaskCtrl.model;

        $(window).off('mousemove', onDragTask);
        $row.removeClass('dragging');
        roadmapBox.removeClass('drag-mode');

        // aware of inserting within subtask
        for(let task=nextTask; task; task=task.parent) {

            if(task == thisTask) {

                console.warn("Can't drag Task into it's subtask!")
                return false;
            }
        }

        if(
            thisTask.ctrl.$view.hasClass('epic') &&
            nextTask.ctrl.$view.hasClass('task')
        )
            thisTask.ctrl.$view
            .removeClass('epic')
            .addClass('task')
        else if(
            thisTask.ctrl.$view.hasClass('task') &&
            nextTask.ctrl.$view.hasClass('epic')
        )
            thisTask.ctrl.$view
            .removeClass('task')
            .addClass('epic')

        // remove task.model from current position
        thisTask.parent.subtasks.splice(
            thisTask.parent.subtasks.indexOf(thisTask),
            1,
        );

        const nextTaskIdx = nextTask.parent.subtasks.indexOf(nextTask);

        // insert task.model in new position
        nextTask.parent.subtasks.splice(
            nextTaskIdx,
            0,
            thisTask,
        );

        thisTask.parent = nextTask.parent;

        nextTask.ctrl.$view.before(thisTask.ctrl.$view);

        console.log('roadmapCtrl.model:', roadmapCtrl.model);
        

        roadmapCtrl.pullDuration();
        roadmapCtrl.forwardStart(0);

        return false;
    }
    
    const onDragTask = (e) => {

        console.log('onDragTask:', this.model.descr);

        const minShift = 20;
        const minShiftSq = minShift * minShift;
        const mousePos = {x: e.screenX, y: e.screenY};
        if(getDistSq(mousePressPos.x - mousePos.x, mousePressPos.y - mousePos.y) > minShiftSq) {

            roadmapBox.addClass('drag-mode');
            $row.addClass('dragging')
            $('.roadmap .row').on('mouseup', dropTask);
            $(window).off('mousemove', onDragTask);
        }

        return false;
    };

    const onDragEnd = () => {

        $row.removeClass('dragging');
        roadmapBox.removeClass('drag-mode');
        $(window).off('mousemove', onDragTask);
    };

    const $row = $('<div>')
    .addClass('row')
    .addClass(parentTask == roadmapCtrl ? 'epic' : 'task')
    .prop('task-ctrl', this)


    this.$view = $row;

    (parentTask || roadmapCtrl).appendSubTask(this);

    let parentBox = $('<div>')
    .addClass('parent-box')
    .appendTo($row)

    let childBox = $('<div>')
    .addClass('child-box')
    .appendTo($row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(parentBox)
    .on('selectstart', (e) => {

        return false;
    })
    .on('mousedown', (e) => {


        mousePressPos = {x: e.screenX, y: e.screenY};
        $(window).on('mousemove', onDragTask);
        $(window).on('mouseup', onDragEnd);

        // e.stopPropagation();
    })

    let content = $('<div>')
    .addClass('content')
    .appendTo(descr)
    .on('selectstart', (e) => {

        e.stopPropagation();
    })

    let openarrow = $('<label>')
    .addClass('openarrow')
    .appendTo(content)
    .on('click', (e) => {

        this.model.unrolled = !this.model.unrolled;
    });

    let openchecker = $('<input>')
    .addClass('openchecker')
    .attr('type', 'checkbox')
    .appendTo(openarrow)
    .on('click', (e) => {

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
        // console.log(e.keyCode)

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
    .on('blur', (e) => {

        this.model.descr = text.text();
        saveCurrentModel();

        console.log(text.text());
        e.preventDefault();

        window.getSelection().removeAllRanges();

    })

    $('<div>')
    .addClass('task-tool-box')
    .appendTo(descr)
    .append(
        $('<div>')
        .addClass('button')
        .addClass('task-appendor')
        .prop('title', 'Add subtask')
        .html('	&#43;')
        .on('click', () => {
    
            const initialTaskSplit = !this.model.subtasks.length;
            const task = new TaskRow(this);
            if(initialTaskSplit) {

                task.setDuration(this.getDuration());
            }
            else {

                task.setDuration(this.minutes2duration(0));
            }
            
            this.unRoll();
            saveCurrentModel();

            roadmapCtrl.pullDuration();
            roadmapCtrl.forwardStart(0);
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
        .on('click', () => {
    
            if(confirm(`Remove task "${this.model.descr}"?`))
                this.remove();
        })
    )

    $('<div>')
    .addClass('paste-box')
    .appendTo(descr)

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

    let formatDuration = () => {

        let duration = {
            minutes: parseInt($duration.minutes.val()),
            hours: parseInt($duration.hours.val()),
            days: parseInt($duration.days.val()),
        };

        duration = this.formatDuration(duration);
        
        // this.pushDuration(duration);

        this.setDuration(duration);
        roadmapCtrl.pullDuration();
        roadmapCtrl.forwardStart(0);
    };

    const $duration = {};
    const durationPadding = 50;
    const maxPxPerHour = 30;
    const minPxPerShift = this.shiftSize * 2;

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
        .on('change', formatDuration)
    )
    .append(
        $duration.hours = $('<input>')
        .addClass('hours')
        .prop('type', 'number')
        .prop('min', -1)
        .prop('max', 8)
        .prop('step', 1)
        .val('0')
        .on('change', formatDuration)
    )
    .append(
        $duration.minutes = $('<input>')
        .addClass('minutes')
        .prop('type', 'number')
        .prop('min', -10)
        .prop('max', 60)
        .prop('step', 10)
        .val('0')
        .on('change', formatDuration)
    )
    .append(
        $duration.daysFix = $('<div>')
        .addClass('days')
        .addClass('label')
        .text('0')
    )
    .append(
        $duration.hoursFix = $('<div>')
        .addClass('hours')
        .addClass('label')
        .text('0')
    )
    .append(
        $duration.minutesFix = $('<div>')
        .addClass('minutes')
        .addClass('label')
        .text('0')
    )

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)

    $duration.timeBox = $('<div>')
    .addClass('cell')
    .addClass('time-box')
    .appendTo(parentBox)
    .append(
        $duration.shiftBox = $('<div>')
        .addClass('shift-box')
        .append(
            $duration.chunk = $('<div>')
            .addClass('chunk')
            .on('dblclick', (e) => {
        
                // debugger;
                const durationInMinutes = this.duration2minutes(this.model.duration);
                const durationInHours = durationInMinutes / 60;
                const timeBoxWidth = $duration.timeBox.width();
                let targetChunkWidth = timeBoxWidth - 2 * durationPadding;
                const targetChunkPxPerHour = targetChunkWidth / durationInHours;
                if(targetChunkPxPerHour > maxPxPerHour) {

                    console.warn(`${targetChunkPxPerHour.toFixed(0)}px/hour is too large. Reduced to max ${maxPxPerHour}px/hour`);
                    targetChunkWidth = durationInHours * maxPxPerHour;
                }
                const shiftWidth = targetChunkWidth / durationInHours * this.shiftSize;
                interStyle.shiftWidth(shiftWidth);

                let shiftPos = $duration.chunk.position().left;
                shiftPos -= durationPadding;
                shiftPos = shiftPos > 0 ? shiftPos : 0;
                interStyle.shiftPos(-shiftPos);
        
                return false;
            })
        )
    )
    .on('wheel', (e) => {

        // console.log(e);
        if(e.ctrlKey) {

            const mousePos = e.screenX - $duration.timeBox.offset().left;
            const mouseTime = (mousePos - interStyle.d.shiftPos) / $duration.shiftBox.width(); // days

            const k = 1.1;
            const scale = e.originalEvent.deltaY > 0 ? k : 1 / k;

            let shiftWidth = $duration.shiftBox.width() * scale;
            if(shiftWidth < minPxPerShift) {

                shiftWidth = minPxPerShift;
            }
            interStyle.shiftWidth(shiftWidth);

            let shiftPos = -(mouseTime * shiftWidth - mousePos);
            shiftPos = shiftPos < 0 ? shiftPos : 0;
            interStyle.shiftPos(shiftPos);

        }
        else if(e.shiftKey) {

            let delta = 50;
            delta = e.originalEvent.deltaY > 0 ? delta : -delta;
            let pos = interStyle.d.shiftPos + delta;
            pos = pos < 0 ? pos : 0;
            interStyle.shiftPos(pos);
        }
        else
            return;
            
        e.stopPropagation();
        return false;
    })
    .on('dblclick', (e) => {

        let pos = $duration.chunk.position().left;
        pos -= durationPadding;
        pos = pos > 0 ? pos : 0;
        interStyle.shiftPos(-pos);

        return false;
    })
};

let rowPrototype = new RowPrototype();
HeaderRow.prototype = rowPrototype;
TaskRow.prototype = rowPrototype;


let roadmapCtrl = new HeaderRow();
let footer = new FooterRow();

roadmapCtrl.ping();

let saveModelOnUnload = () => {
    
    saveLocalModel();
    if(hasBackend && location.hash == '#editor')
        saveRemoteModel();
};
let saveCurrentModel = () => {};

let saveLocalModel = () => {

    let roadmapModel = formatModel(roadmapCtrl.model);
    console.log('saveModel:', roadmapModel);

    let settings = {
        descriptionColumnWidth: interStyle.d.descriptionColumnWidth,
        shiftPos: interStyle.d.shiftPos,
        shiftWidth: interStyle.d.shiftWidth,
    };

    console.log(settings);

    localStorage.setItem('roadmap', JSON.stringify(roadmapModel));
    localStorage.setItem('roadmapSettings', JSON.stringify(settings));
};

let saveRemoteModel = () => {

    let roadmapModel = formatModel(roadmapCtrl.model);
    console.log('saveModel:', roadmapModel);

    let settings = {
        descriptionColumnWidth: interStyle.d.descriptionColumnWidth,
        shiftPos: interStyle.d.shiftPos,
        shiftWidth: interStyle.d.shiftWidth,
    };

    console.log(settings);

    fetch('/db/data', {
        method: 'PUT',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        // body: '["hello"]'
        body: JSON.stringify(roadmapModel),
    })
    // localStorage.setItem('roadmap', JSON.stringify(roadmapModel));
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

const fetchSettings = () => {

    let settings = localStorage.getItem('roadmapSettings');
    if(settings) {

        settings = JSON.parse(settings);
        console.log(settings);
        interStyle.descriptionColumnWidth(settings.descriptionColumnWidth)
        interStyle.shiftPos(settings.shiftPos)
        interStyle.shiftWidth(settings.shiftWidth)
    }
}

const fetchLocalModel = () => {

    let roadmapModel = localStorage.getItem('roadmap');
    console.log('Model on load:', roadmapModel);

    if(!roadmapModel)
        return;

    roadmapModel = JSON.parse(roadmapModel);
    console.log('loadModel:', roadmapModel);
    buildBranch(roadmapCtrl, roadmapModel);
    roadmapCtrl.pullDuration();
    roadmapCtrl.forwardStart(0);

    fetchSettings();
};

const fetchRemoteModel = (url) => {


    fetch(url || '/db/data', {
        method: 'GET',
    })
    .then((resp) => resp.json())
    .then((resp) => {

        let roadmapModel = resp;
        // console.log('Model fetch:', roadmapModel);

        buildBranch(roadmapCtrl, roadmapModel);
        roadmapCtrl.pullDuration();
        roadmapCtrl.forwardStart(0);

        fetchSettings();
        
        // saveRemoteModel();
    });
};

if(hasBackend) {

    fetchRemoteModel();
}
else {

    fetchLocalModel();
}

addEventListener('unload', saveModelOnUnload);