// 'use strict'

import $ from 'jquery';

const minTimelineWidth = 200;
const minDescrColWidth = 100;
let descrWidth = 2 * minDescrColWidth;

let style = $('<style>')
.appendTo('head');

let setDescrColWidth = (width) => {

    style.text(`.cell.descr { width: ${width}px; }`)
};

setDescrColWidth(descrWidth)

let roadmapBox = $('<div>')
.addClass('roadmap')
.appendTo('body')


let HeaderRow = function() {

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
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

    let epicAppendor = $('<div>')
    .addClass('epic-appendor')
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
};


let TaskRow = function(parentTask) {

    this.appendSubTask = (subTask) => {

        childBox.append(subTask.$);
    };

    let row = $('<div>')
    .addClass('row')
    .addClass(parentTask ? 'task' : 'epic')

    this.$ = row;

    (parentTask || roadmap).appendSubTask(this);

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

    $('<input>')
    .attr('type', 'checkbox')
    .appendTo(content);

    let text = $('<div>')
    .addClass('text')
    .text('Hello, I\'m an awful text. Try resize me!')
    .attr('contenteditable', true)
    .appendTo(content)
    .on('keydown', function(e) {

        const codeEnter = 13;

        if(e.keyCode == codeEnter) {

            console.log($(this).text());
            e.preventDefault();

            $(this).blur();

            window.getSelection().removeAllRanges();
        }
    });


    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(parentBox)
    .on('selectstart', (e) => {

        e.preventDefault();
        e.stopPropagation();

        return false;
    })
    .mousedown((e) => {

        console.log(e);

        let mousePressPos = {
            x: e.originalEvent.screenX,
            y: e.originalEvent.screenY,
        };

        let initWidth = descrWidth;
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
            descrWidth = currentWidth;
            $(window).off('mousemove', mouseMove);
            $(window).off('mouseup', mouseUp);
        };

        $(window).mousemove(mouseMove);
        $(window).mouseup(mouseUp);
    })
};

let roadmap = new HeaderRow();

for(let i=0; i<10; ++i) {

    let epic = new TaskRow();
    let task, subtask;

    task = new TaskRow(epic);
    subtask = new TaskRow(task);
    new TaskRow(subtask);
    new TaskRow(subtask);
    new TaskRow(subtask);

    task = new TaskRow(epic);
    subtask = new TaskRow(task);
    new TaskRow(subtask);
    new TaskRow(subtask);
    new TaskRow(subtask);

    task = new TaskRow(epic);
    subtask = new TaskRow(task);
    new TaskRow(subtask);
    new TaskRow(subtask);
    new TaskRow(subtask);
}