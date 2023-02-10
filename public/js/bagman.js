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

let roadmap = $('<div>')
.addClass('roadmap')
.appendTo('body')


let TaskRow = function(parentTask) {

    this.appendSubTask = (subTask) => {

        children.append(subTask.$);
    };


    let row = $('<div>')
    .addClass('row')
    .addClass(parentTask ? 'task' : 'epic')

    this.$ = row;

    if(parentTask)
        parentTask.appendSubTask(this)
    else
        row.appendTo(roadmap);

    let header = $('<div>')
    .addClass('header')
    .appendTo(row)

    let children = $('<div>')
    .addClass('children')
    .appendTo(row)

    let descr = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(header)

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
    .appendTo(header)
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
                ? (currentPos < roadmap.width() - minTimelineWidth
                    ? currentPos
                    : roadmap.width() - minTimelineWidth
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