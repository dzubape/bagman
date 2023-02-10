// 'use strict'

import $ from 'jquery';

const minTimelineWidth = 200;
const minDescrColWidth = 200;
let descriptionColumnWidth = 2 * minDescrColWidth;

let style = $('<style>')
.appendTo('head');

let setDescrColWidth = (width) => {

    style.text(`.cell.descr { width: ${width}px; }`);
    descriptionColumnWidth = width;
};

setDescrColWidth(descriptionColumnWidth)

let roadmapBox = $('<div>')
.addClass('roadmap')
.appendTo('body')


let HeaderRow = function() {

    this.model = {
        subtasks: [],
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;
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
        saveModel();
    })

    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)  
    .mousedown(onSplitterMove)
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

    let initWidth = descriptionColumnWidth;
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
        setDescrColWidth(currentPos);
        currentWidth = currentPos;
    };

    let mouseUp = (e) => {

        mouseMove(e);
        descriptionColumnWidth = currentWidth;
        $(window).off('mousemove', mouseMove);
        $(window).off('mouseup', mouseUp);
    };

    $(window).mousemove(mouseMove);
    $(window).mouseup(mouseUp);
};

let TaskRow = function(parentTask) {

    // debugger
    // let initialDescr = 'Hello, I\'m an awful text. Try resize me!';
    let initialDescr = "Task description";

    this.model = {
        descr: initialDescr,
        start: null,
        duration: null,
        unrolled: false,
        subtasks: [],
        parent: null,
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
        //! view update
    };

    this.remove = () => {

        let s = this.model.parent.subtasks;
        let idx = s.indexOf(this.model);
        s.splice(idx, 1);
        this.$.remove();

        saveModel();
    };

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
        this.model.subtasks.push(subTask.model);
        subTask.model.parent = this.model;

        let root = this.model;
        while(root.parent)
            root = root.parent;
        console.log(root);
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
    .attr('type', 'checkbox')
    .appendTo(content)
    .click((e) => {

        this.model.unrolled = !this.model.unrolled;
    });

    let text = $('<div>')
    .addClass('text')
    .text(initialDescr)
    .attr('contenteditable', true)
    .appendTo(content)
    .on('keydown', (e) => {

        const codeEnter = 13;
        const codeEsc = 27;
        console.log(e.keyCode)

        if(e.keyCode == codeEnter) {

            this.model.descr = text.text();
            saveModel();

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
        saveModel();

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
        .html('&#8600;')
        .html('&#65291;')
        .html('&#11175;')
        .html('	&#43;')
        .click(() => {
    
            let task = new TaskRow(this);
            this.unRoll();
            saveModel();
        })
    )
    .append(
        $('<div>')
        .addClass('button')
        .addClass('task-remover')
        .html('&#10005;')
        .html('	&#8855;')
        .html('	&#9746;')
        .click(() => {
    
            if(confirm(`Remove task ${this.model.descr}`))
                this.remove();
        })
    )


    $('<div>')
    .addClass('appendor-box-med')
    .appendTo(parentBox)
    .append(
        $('<div>')
        .addClass('append-button')
    )


    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)
    .on('selectstart', (e) => {

        e.preventDefault();
        e.stopPropagation();

        return false;
    })
    .mousedown(onSplitterMove)
};

let roadmapCtrl = new HeaderRow();
let footer = new FooterRow();

let saveModel = () => {

    let roadmapModel = modelWithoutParent(roadmapCtrl.model);
    console.log('saveModel:', roadmapModel);

    let settings = {
        descriptionColumnWidth,
    };

    console.log(settings);

    localStorage.setItem('roadmap', JSON.stringify(roadmapModel));
    localStorage.setItem('roadmapSettings', JSON.stringify(settings));
};

let buildBranch = (taskCtrl, taskModel) => {

    console.log('buildBranch:', taskModel);

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

    console.log('loadModel:', roadmapModel);
    roadmapModel = JSON.parse(roadmapModel);
    buildBranch(roadmapCtrl, roadmapModel);

    let settings = localStorage.getItem('roadmapSettings');
    if(settings) {

        settings = JSON.parse(settings);
        setDescrColWidth(settings.descriptionColumnWidth)
    }
};

loadModel();

// $(window).on('unload', (e) => {

//     saveModel();
// })

addEventListener('unload', saveModel);