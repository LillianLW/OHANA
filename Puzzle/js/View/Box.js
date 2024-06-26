
;
(function (w, s) {
    var Box = function () {

        this.placeHolder = s.v.getEl("slider");
        this.sourceHolder = s.v.getEl("source_holder");
        var offsetLeft = this.placeHolder.offsetLeft;
        var offsetTop = this.placeHolder.offsetTop;
        this.previewDrag = s.v.getEl("previewDrag");
        this.isDragged = false;
        var self = this;

        this.startEvent = function () {
            if (typeof (ga) !== "function") {
                var _this = this;
                setTimeout(function () {
                    _this.startEvent();
                }, 100);
                return;
            }

            var _url = slider.imageURL;
            if (_url === undefined) {
                _url = "(none)";
            }
            ga('send', 'event', "start_puzzle", "url:" + _url);
        };

        this.paintPuzzle = function () {
            document.addEventListener("keydown", puzzleKeyEvent, false);
            this.startEvent();

            // Paint the puzzle by reading the state from model 

            self.placeHolder.innerHTML = "";
            self.previewDrag.innerHTML = "";

            var puzzleFrag = document.createDocumentFragment();

            for (var i = 0; i < s.c.sliderSize; i++) {


                for (var j = 0; j < s.c.sliderSize; j++) {
                    var ele = s.v.createEl("div", {id: "box" + i + j, className: "tile " + s.m.state[i][j] + " floatleft"});

                    s.v.addHandler(ele, "mouseover", function (ele, x, y) {
                        return function () {
                            var data = s.c.isMovelLegal(x, y);
                            (self.isDragged == false && data["isLegal"] === true && !s.isMobile) && s.v.addClass(ele, "onHover");
                        };
                    }(ele, i, j));

                    s.v.addHandler(ele, "mouseout", function (ele, x, y) {
                        return function () {
                            s.v.removeClass(ele, "onHover");
                        };
                    }(ele, i, j));

                    s.v.addHandler(ele, "click", function (x, y) {
                        return function () {
                            s.log("isDragged=" + self.isDragged, "info");
                            if (self.isDragged && !s.isMobile) {
                                self.isDragged = false;
                                return;
                            }
                            var data = s.c.isMovelLegal(x, y);
                            if (data["isLegal"] === true) {
                                s.v.removeClass(ele, "onHover");
                                s.c.swap({"x": x, "y": y}, data["direction"], data["displacement"]);
                            }

                        };
                    }(i, j));  // Adding the click listener

                    self.makeDraggable(ele, {"x": i, "y": j}); // Making tile as draggable only if the tile can be legally movable
                    puzzleFrag.appendChild(ele);
                }
            }

            self.placeHolder.appendChild(puzzleFrag);

        };

        this.swapTiles = function (targetCords, direction, displacement) {
            self.previewDrag.innerHTML = "";
            var noOfTilesToMove = (displacement < 0) ? (displacement * -1) : displacement;
            for (var i = 0, x = targetCords["x"], y = targetCords["y"]; i <= noOfTilesToMove; i++) {
                //console.log("box"+x+y)
                var ref = s.v.getEl("box" + x + y);
                ref.className = "tile " + s.m.state[x][y] + " floatleft";
                if (direction === "y") {
                    y = (displacement < 0) ? y + 1 : y - 1;
                } else {
                    x = (displacement < 0) ? x + 1 : x - 1;
                }
            }
            this.addStep();
        };

        this.addStep = function () {
            var _step = $("#stepElapsed").text();
            _step = parseInt(_step, 10) + 1;
            $("#stepElapsed").text(_step);
        };

        var _IS_DRAGSTART = false;
        var _dragstart = function () {
            if (_IS_DRAGSTART === true) {
                return;
            }
            
            //$('body').bind('touchmove', function(e){e.preventDefault()});
            //$('body').addClass('stop-scrolling')
            console.log("dragstart");
            _IS_DRAGSTART = true;
            
        };
       
        
        var _dragend = function () {
            //$('body').unbind('touchmove');
            //$('body').removeClass('stop-scrolling')
            console.log("dragend");
            _IS_DRAGSTART = false;
        };

        this.makeDraggable = function (tile, dragData) {

            var clone = null, actualDistance = 0, draggedDistance = 0, swapInfo = {}, lowx = 0, lowy = 0, upperx = 0, uppery = 0;
            new s.v.Drag(tile, function (eventName, coOrdinates, eventData, targetEle) {
                if (eventName === "mousedown") {
                    s.v.removeClass(targetEle, "onHover");
                } 
                else if (eventName === "dragstart") {
                    _dragstart();
                    clone = s.v.createEl("div", {"className": "buddy_drag_clone"});
                    var noOfTilesToMove = swapInfo["displacement"], tempx = dragData["x"], tempy = dragData["y"];
                    noOfTilesToMove = (swapInfo["displacement"] < 0) ? swapInfo["displacement"] * -1 : swapInfo["displacement"];
                    var clickedEle = document.getElementById('box' + dragData['x'] + dragData['y']),
                            emptyEle = document.getElementById('box' + s.m.emptyRef["x"] + s.m.emptyRef["y"]);
                    if (swapInfo["direction"] === "y") {
                        clone.style.width = (noOfTilesToMove * s.m.tileSize) + "px";
                        lowx = clickedEle.offsetTop;
                        upperx = lowx + clickedEle.offsetHeight;
                        if (swapInfo["displacement"] < 0) {
                            tempx = s.m.emptyRef["x"];
                            tempy = s.m.emptyRef["y"] + 1;
                            uppery = clickedEle.offsetLeft + clickedEle.offsetWidth;
                            lowy = emptyEle.offsetLeft;
                        } else {
                            uppery = emptyEle.offsetLeft + emptyEle.offsetWidth;
                            lowy = clickedEle.offsetLeft;
                        }
                    } else {
                        clone.style.width = s.m.tileSize + "px";
                        lowy = clickedEle.offsetLeft;
                        uppery = lowy + clickedEle.offsetWidth;
                        if (swapInfo["displacement"] < 0) {
                            tempx = s.m.emptyRef["x"] + 1;
                            tempy = s.m.emptyRef["y"];
                            upperx = clickedEle.offsetTop + clickedEle.offsetHeight;
                            lowx = emptyEle.offsetTop;
                        } else {
                            upperx = emptyEle.offsetTop + emptyEle.offsetHeight;
                            lowx = clickedEle.offsetTop;
                        }

                    }
                    s.log("lowx =" + lowx + " upperx=" + upperx + " lowy=" + lowy + " uppery=" + uppery);
                    for (var i = 0; i < noOfTilesToMove; i++) {
                        var ele = s.v.createEl("div", {className: "tile " + s.m.state[tempx][tempy] + " floatleft"});
                        clone.appendChild(ele);
                        if (swapInfo["direction"] === "y")
                            tempy++;
                        else
                            tempx++;
                    }
                    self.previewDrag.appendChild(clone);
                    actualDistance = findDistance({"x": getTileMiddleCoordinate(dragData["x"]), "y": getTileMiddleCoordinate(dragData["y"])}, {"x": getTileMiddleCoordinate(s.m.emptyRef["x"]), "y": getTileMiddleCoordinate(s.m.emptyRef["y"])});
                } else if (eventName === "drag") {
                    _dragstart();
                    //s.log("x="+coOrdinates.lastY+" y="+coOrdinates.lastX);
                    if (coOrdinates.lastX >= lowy && coOrdinates.lastX <= uppery && coOrdinates.lastY >= lowx && coOrdinates.lastY <= upperx) {
                        self.isDragged = true;
                        clone.style.left = (coOrdinates.clientX + 5) + "px";
                        clone.style.top = (coOrdinates.clientY + 5) + "px";
                        clone.style.visibility = "visible";
                    } else {
                        clone.style.visibility = "hidden";
                    }

                } else if (eventName === "dragend") {
                    _dragend();
                    if (!eventData["droppedOnMySelf"])
                        self.isDragged = false; // If drop is happened on some other target then onclick of source won't be triggered. So resetting the flag
                    draggedDistance = findDistance({"x": getTileMiddleCoordinate(dragData["x"]), "y": getTileMiddleCoordinate(dragData["y"])}, {"x": coOrdinates.lastY - offsetTop, "y": coOrdinates.lastX - offsetLeft});
                    s.log("actual =" + actualDistance + " draggedDistance=" + draggedDistance);
                    if (draggedDistance > (actualDistance / 2) && clone.style.visibility == "visible") {  // Allowing only if it is dropped in board and more than halfway
                        s.log("Drag criteria is obeyed");
                        self.isDragged = false;
                        var data = s.c.isMovelLegal(dragData["x"], dragData["y"]);
                        (data["isLegal"] === true) && s.c.swap({"x": dragData["x"], "y": dragData["y"]}, data["direction"], data["displacement"]);
                    } else {
                        self.previewDrag.removeChild(clone);
                    }
                } else if (eventName === "dragcancel") {
                    _dragend();
                    self.previewDrag.removeChild(clone);
                }
            }, document, dragData, function () {
                swapInfo = s.c.isMovelLegal(dragData["x"], dragData["y"]);
                return swapInfo["isLegal"];
            });

        };

        this.layoutmanager = function (msg) {
            switch (msg) {
                case "source":
                    s.v.removeClass(self.sourceHolder, "hide");
                    s.v.addClass(self.placeHolder, "hide");
                    break;
                case "game":
                    s.v.removeClass(self.placeHolder, "hide");
                    s.v.addClass(self.sourceHolder, "hide");
                    break;
                case "shuffle":
                    var bool = confirm("你確定要重新挑戰嗎？");
                    if (bool) {
                        //s.generateGame();
                        //s.initGame();
                        location.reload();
                    }
                    break;
            }
        };

        var findDistance = function (from, to) {
            var x1 = to["y"],
                    y1 = to["x"],
                    x2 = from["y"],
                    y2 = from["x"];
            distance = Math.sqrt(((x2 - x1) * (x2 - x1)) + (y2 - y1) * (y2 - y1));

            s.log("empty x=" + x1 + " empty y=" + y1);
            s.log("source x=" + x2 + " source y=" + y2);


            return (distance < 0 ? distance * -1 : distance);
        };

        var getTileMiddleCoordinate = function (coord) {
            return (coord * s.m.tileSize) + (s.m.tileSize / 2);
        };
        s.log("offsetLeft=" + offsetLeft + " offsetTop=" + offsetTop);
    };

    s.v.Box = Box;

    var puzzleKeyEvent = function (e) {
        var keyCode = e.keyCode;
        //console.log(keyCode);
        if (keyCode === 38 || keyCode === 40 || keyCode === 37 || keyCode === 39 || keyCode === 90) {
            var _gray_tile = $("#slider .tile" + (slider.tileSize - 1) + "" + (slider.tileSize - 1));
            var _gray_tile_pos = _gray_tile.attr("id").substr(3, 2).split("");
            _gray_tile_pos = {
                x: parseInt(_gray_tile_pos[1], 10),
                y: parseInt(_gray_tile_pos[0], 10)
            };
            //console.log(_gray_tile_pos);

            if (keyCode === 38 && _gray_tile_pos.y !== slider.tileSize - 1) {
                // 上
                //console.log("move 上");
                $("#box" + (_gray_tile_pos.y + 1) + "" + (_gray_tile_pos.x)).click();
            } else if (keyCode === 40 && _gray_tile_pos.y !== 0) {
                // 下
                //console.log("move 下");
                $("#box" + (_gray_tile_pos.y - 1) + "" + (_gray_tile_pos.x)).click();
            } else if (keyCode === 37 && _gray_tile_pos.x !== slider.tileSize - 1) {
                // 左
                //console.log("move 左");
                $("#box" + (_gray_tile_pos.y) + "" + (_gray_tile_pos.x + 1)).click();
            } else if (keyCode === 39 && _gray_tile_pos.x !== 0) {
                // 右
                //console.log("move 右");
                $("#box" + (_gray_tile_pos.y) + "" + (_gray_tile_pos.x - 1)).click();
            } else if (keyCode === 90) {
                // z
                $(".preview-target:visible").click();
            }

            e.preventDefault();
        }
    };
})(window, slider);