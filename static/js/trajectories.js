/** @jsx React.DOM */

var Circle = React.createClass({
  getInitialState: function() {
    return {};
  },
  handleStart: function (event, ui) {
    if (!this.state.startPx) {
      this.state.startPx = this.props.coordsToSvg(this.props.p);
    }
  },
  handleDrag: function (event, ui) {
    var newPos = [ this.state.startPx[0] + ui.position.left, this.state.startPx[1] + ui.position.top ];
    var coords = this.props.svgToCoords(newPos);
    this.props.onMove(coords);
  },
  render: function() {
    var center = this.props.coordsToSvg(this.props.p);
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
    }
  },
  handleDrag: function (event, ui) {
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
      this.state.dragStartY = this.props.coordsToSvg([0,this.props.base[1]])[1];
    }
  },
  handleDrag: function (event, ui) {
    this.props.updateY(this.props.svgToCoords([0, this.state.dragStartY + ui.position.top])[1]);
  },
  render: function() {
    var to = [ this.props.base[0] + this.props.length, this.props.base[1] ];
    var svgBase = this.props.coordsToSvg(this.props.base);
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
      this.state.dragStart = this.props.coordsToSvg([this.props.x, this.props.y]);
    }
  },
  handleDrag: function (event, ui) {
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

var GridLines = React.createClass({
  render: function () {
    var paths = [];
    var maxX = window.innerWidth / this.props.sx;
    var maxY = window.innerHeight / this.props.sy;
    for (var x = 0; x <= maxX; x++) {
      paths.push(<path d={this.props.path([x, -1], [x, maxY])} />);
    }

    for (var y = 0; y <= maxY; y++) {
      paths.push(<path d={this.props.path([-1, y], [maxX, y])} />);
    }

    return <g className="grid-lines">{paths}</g>
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
      <GridLines {...this.props} />
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
        return ret;
      }
    }
  },
  coordsToSvg: function(p) {
    var ret = [ p[0]*this.state.sx + this.state.origin[0], this.state.h - this.state.sy*p[1] - this.state.origin[1] ]
    return ret;
  },
  updatePoint: function(idx) {
    var state = this.state;
    return function(p) {
      this.state.points[idx] = p;
      this.setState(state);
    }.bind(this);
  },
  render: function() {
    var methods = {
      path: function() {
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
