/** @jsx React.DOM */

var Circle = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    console.log("dragStart: %O %O [%d,%d] [%d,%d] [%d,%d]",
          event, ui,
          event.clientX, event.clientY,
          event.pageX, event.pageY,
          ui.position.left, ui.position.top
    );
    if (!this.state.startPx) {
      this.state.startPx = this.props.coordsToSvg(this.props.p);
    }
  },
  handleDrag: function (event, ui) {
    //console.log("drag: %O %O [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d]", event, ui, event.x, event.y, event.clientX, event.clientY, event.offsetX, event.offsetY, event.pageX, event.pageY, event.layerX, event.layerY, ui.position.left, ui.position.top);
    //var svgPoint = this.props.svgToCoords(this.state.dragStart);
    var newPos = [ this.state.startPx[0] + ui.position.left, this.state.startPx[1] + ui.position.top ];
    var coords = this.props.svgToCoords(newPos);
    //console.log("\tdrag: original: %s, new: %s, coords: %s", this.state.startPx.join(','), newPos.join(','), coords.join(','));
    this.props.onMove(coords);
  },
  handleStop: function (event, ui) {
    console.log("dragStop: %O %O [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d] [%d,%d]", event, ui, event.x, event.y, event.clientX, event.clientY, event.offsetX, event.offsetY, event.pageX, event.pageY, event.layerX, event.layerY, ui.position.left, ui.position.top);
  },
  render: function() {
    //console.log("circle props: %O", this.props);
    var center = this.props.coordsToSvg(this.props.p);
    //console.log("drawing circle at: %O", center);
    return <ReactDraggable
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
    >
      <circle
            r={this.props.r || 5}
            cx={center[0]}
            cy={center[1]}
      />
    </ReactDraggable>;
  }
});

var Parabola = React.createClass({
  render: function() {
    if (this.props.points) {
      var ps = this.props.points;
      var midPoint = [(ps[0][0] + ps[2][0]) / 2, (ps[0][1] + ps[2][1]) / 2];
      var controlPoint = [2 * ps[1][0] - midPoint[0], 2 * ps[1][1] - midPoint[1]]
      var pathStr = [
        "M" + this.props.coordsToSvg(this.props.points[0]).join(','),
        "Q" + this.props.coordsToSvg(controlPoint).join(','),
        this.props.coordsToSvg(this.props.points[2]).join(',')
      ].join(' ');
      return <g>
        <path d={pathStr}/>
        <path d={this.props.path(this.props.points[0], this.props.points[2])}/>
      </g>;
    } else if (this.props.v && this.props.g && this.props.origin && this.props.t) {
      function y(x) {
        return x*Math.tan(t) - g*x*x/(2*v*v*Math.cos(t)*Math.cos(t));
      }
      var firstRoot = [0,0];
      var vertexX = v*v*Math.sin(2*t)/2;
      var vertex = [ vertexX, vertexX/2 * Math.tan(t) ];
      var secondRoot = [ 2*vertexX, 0 ];
    }
  }
});

var YLine = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.originalSvgX) {
      this.state.originalSvgX = this.props.coordsToSvg([ this.props.x, 0 ])[0];
      console.log("storing drag start x: %d as %d", this.props.x, this.state.originalSvgX);
    }
  },
  handleDrag: function (event, ui) {
    //console.log("updating x, original: %d, new: %d", this.state.originalSvgX, this.state.originalSvgX + ui.position.left);
    this.props.updateX(this.props.svgToCoords([this.state.originalSvgX + ui.position.left, 0])[0]);
  },
  render: function() {
    var to = [ this.props.base[0], this.props.base[1] + this.props.length ];
    var svgTo = this.props.coordsToSvg(to);
    return (
      <ReactDraggable
            axis="x"
            onStart={this.handleStart}
            onDrag={this.handleDrag}
      >
        <g className="yline">
          <path d={this.props.path(this.props.base, to)} ></path>
          <rect width={20} height={this.props.length * this.props.sy} x={svgTo[0]-10} y={svgTo[1]} />
        </g>
      </ReactDraggable>
    );
  }
});

var PlateauLine = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.dragStartY) {
      console.log("storing drag start y: %d", this.props.base[1]);
      this.state.dragStartY = this.props.coordsToSvg([0,this.props.base[1]])[1];
    }
  },
  handleDrag: function (event, ui) {
    this.props.updateY(this.props.svgToCoords([0, this.state.dragStartY + ui.position.top])[1]);
  },
  render: function() {
    var to = [ this.props.base[0] + this.props.length, this.props.base[1] ];
    var svgBase = this.props.coordsToSvg(this.props.base);
    //console.log("rect x,y %d,%d", svgBase[0],svgBase[1]);
    return (
          <ReactDraggable
                axis="y"
                onStart={this.handleStart}
                onDrag={this.handleDrag}
          >
            <g className="plateau-line">
              <path d={this.props.path(this.props.base, to)} />
              <rect height={20} width={this.props.length * this.props.sx} x={svgBase[0]} y={svgBase[1] - 10} />
            </g>
          </ReactDraggable>
    );
  }
});

var DraggableCorner = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.dragStart) {
      console.log("storing drag start x,y: %d,%d", this.props.x, this.props.y);
      this.state.dragStart = this.props.coordsToSvg([this.props.x, this.props.y]);
    }
  },
  handleDrag: function (event, ui) {
    //console.log("updating x, original: %d, new: %d", this.state.dragStartX, this.state.dragStartX + ui.position.left);
    var xy = this.props.svgToCoords([ this.state.dragStart[0] + ui.position.left, this.state.dragStart[1] + ui.position.top ]);
    this.props.updateXY(xy[0], xy[1]);
  },
  render: function() {
    var svg = this.props.coordsToSvg([ this.props.x, this.props.y ]);
    return (
          <ReactDraggable
                zIndex={100}
                onStart={this.handleStart}
                onDrag={this.handleDrag}
          >
            <rect
                  className="draggable-corner"
                  height={20}
                  width={20}
                  x={svg[0] - 10}
                  y={svg[1] - 10}
            />
          </ReactDraggable>
    );
  }
});

var Plot = React.createClass({
  render: function() {
    var updatePoint = this.props.updatePoint;
    var circles = this.props.points.map(function(point, idx) {
      return <Circle p={point} onMove={updatePoint(idx)} {...this.props} />
    }.bind(this));

    var firstPoint = this.props.points[0];
    var yBasePoint = [ firstPoint[0] + this.props.x, firstPoint[1] ];
    var yTopPoint = [ yBasePoint[0], yBasePoint[1] + this.props.y ];

    return <svg className="plot" height={this.props.h}>
      <Parabola {...this.props} />
      {circles}
      <path d={this.props.path(firstPoint, yBasePoint)} />
      <YLine base={yBasePoint} length={this.props.y} {...this.props} />
      <PlateauLine base={yTopPoint} length={500} {...this.props} />
      <DraggableCorner {...this.props} />
    </svg>;
  }
});

var ControlPanel = React.createClass({
  render: function() {
    return <div className="control-panel">
      <div className="control"><span className="label">x:</span><span className="value">{this.props.x}</span></div>
      <div className="control"><span className="label">y:</span><span className="value">{this.props.y}</span></div>
    </div>;
  }
});

var Page = React.createClass({
  getInitialState: function() {
    return {
      origin: [10,10],
      sx: 10,
      sy: 10,
      points: [[0,0], [5,20], [8,5]],
      x: 10,
      y: 7,
      v: 100,
      g: 9.8,
      t: Math.PI/4,
      h: 250,
      svgToCoords: function(p) {
        var ret = [ (p[0] - this.origin[0]) / this.sx, (this.h - this.origin[1] - p[1])/this.sy ];
        //console.log("\tsvgToCoords: %s -> %s", p.join(','), ret.join(','));
        return ret;
      }
    }
  },
  coordsToSvg: function(p) {
    var ret = [ p[0]*this.state.sx + this.state.origin[0], this.state.h - this.state.sy*p[1] - this.state.origin[1] ]
    //console.log("coordsToSvg %O: this: %O, this.state: %O, ret: %O", p, this, this.state, ret);
    return ret;
  },
  updatePoint: function(idx) {
    //console.log("updatePoint: this: %O, state: %O", this, this.state);
    var state = this.state;
    return function(p) {
      //console.log("updating point %d from [%d,%d] to [%d,%d]", idx, state.points[idx][0], state.points[idx][1], p[0], p[1]);
      //console.log("\tupdating point, this: %O, state: %O", this, this.state);
      this.state.points[idx] = p;
      this.setState(state);
    }.bind(this);
  },
  render: function() {
    var methods = {
      path: function() {
        //console.log("state: %O, this: %O", this.state, this);
        var coordsToSvg = this.state.coordsToSvg;
        return "M" + Array.prototype.slice.call(arguments).map(
                    function(p) {
                      return this.coordsToSvg(p).join(',');
                    }.bind(this)
              ).join(' L');
      }.bind(this),
      coordsToSvg: this.coordsToSvg,
      updatePoint: this.updatePoint,
      updateX: function(x) {
        this.setState({ x: x });
      }.bind(this),
      updateY: function(y) { this.setState({ y: y }); }.bind(this),
      updateXY: function(x, y) { this.setState({ x:x, y:y })}.bind(this)
    }
    return <div>
      <Plot {...this.state} {...methods} />
      <ControlPanel {...this.state} {...methods} />
    </div>
  }
});

React.render(
      <Page />,
      document.getElementById('container')
);
