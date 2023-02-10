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


let Row = function() {


    let row = $('<div>')
    .addClass('row')
    .addClass('epic')
    .appendTo(roadmap)

    let cell = $('<div>')
    .addClass('cell')
    .addClass('descr')
    .appendTo(row)

    let content = $('<div>')
    .addClass('content')
    .append()
    .appendTo(cell)

    $('<input>')
    .addClass('arrow')
    .attr('type', 'checkbox')
    .appendTo(content);

    let text = $('<div>')
    .addClass('text')
    .text('Hello, white man! I love you!')
    .append()
    .appendTo(content)


    $('<div>')
    .addClass('cell')
    .addClass('v-splitter')
    .appendTo(row)
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
        };

        let mouseUp = (e) => {

            mouseMove(e);
            $(window).off('mousemove', mouseMove);
            $(window).off('mouseup', mouseUp);
        };

        $(window).mousemove(mouseMove);
        $(window).mouseup(mouseUp);
    })
};

for(let i=0; i<10; ++i)
    new Row();