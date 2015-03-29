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
    var newPos = [ this.state.startPx[0] + ui.position.left, this.state.startPx[1] + ((this.props.axis) ? 0 : ui.position.top) ];
    var coords = this.props.svgToCoords(newPos);
    if (this.props.onMove) {
      this.props.onMove(coords);
    }
  },
  render: function() {
    var center = this.props.coordsToSvg(this.props.p);
    //console.log("axis: %s", this.props.axis);
    return <ReactDraggable
          axis={this.props.axis || 'both'}
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
  doublePointFromLineMidpoint: function(p, p1, p2) {
    var midPoint = [(p1[0] + p2[0]) / 2, (p1[1] + p1[1]) / 2];
    return [2 * p[0] - midPoint[0], 2 * p[1] - midPoint[1]];
  },
  quadraticPath: function(p1, controlPoint, p2) {
    return [
      "M" + this.props.coordsToSvg(p1).join(','),
      "Q" + this.props.coordsToSvg(controlPoint).join(','),
      this.props.coordsToSvg(p2).join(',')
    ].join(' ');
  },
  render: function() {
    var controlPoint = this.doublePointFromLineMidpoint(this.props.vertex, [0,0], this.props.root);
    return <g>
      <path className={this.props.reflected ? "reflected" : ""} d={this.quadraticPath([0,0], controlPoint, this.props.root)} />
    </g>;
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
    this.props.setX(this.props.svgToCoords([this.state.originalSvgX + ui.position.left, 0])[0]);
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
    this.props.setY(this.props.svgToCoords([0, this.state.dragStartY + ui.position.top])[1]);
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
    this.props.setXY(xy[0], xy[1]);
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
    var circles = [
      <Circle p={[0,0]} {...this.props} />,
      <Circle p={this.props.vertex} onMove={this.props.setVertex} {...this.props} />,
      <Circle p={this.props.root} axis={"x"} onMove={this.props.setRoot} {...this.props} />
    ];

    var firstPoint = [ 0,0 ];
    var yBasePoint = [ firstPoint[0] + this.props.x, firstPoint[1] ];
    var yTopPoint = [ yBasePoint[0], yBasePoint[1] + this.props.y ];

    return <svg className="plot" height={this.props.h}>
      <GridLines {...this.props} />
      <Parabola {...this.props} />
      <Parabola
            reflected={true}
            vertex={[ this.props.vertex[0], this.props.vertex[0] * Math.tan(Math.PI/2 - this.props.t) / 2 ]}
            root={this.props.root}
            coordsToSvg={this.props.coordsToSvg}
      />
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
      <div className="control"><span className="label">sx:</span><span className="value">{this.props.sx}</span></div>
      <div className="control"><span className="label">sy:</span><span className="value">{this.props.sy}</span></div>
      <div className="control"><span className="label">v:</span><span className="value">{this.props.v}</span></div>
      <div className="control"><span className="label">g:</span><span className="value">{this.props.g}</span></div>
      <div className="control"><span className="label">t:</span><span className="value">{this.props.t} ({this.props.t*180/Math.PI})</span></div>
    </div>;
  }
});

var Page = React.createClass({
  getInitialState: function() {
    var state = {
      origin: [10,10],
      sx: 10,
      sy: 10,
      x: 10,
      y: 7,
      v: 20,
      g: 9.8,
      t: Math.PI/6,
      h: 250
    };
    this.computeVertex(state);
    this.computeRoot(state);
    console.log("computed: %O", state);
    return state;
  },
  coordsToSvg: function(p) {
    var ret = [
      p[0]*this.state.sx + this.state.origin[0],
      this.state.h - this.state.sy*p[1] - this.state.origin[1]
    ];
    return ret;
  },
  svgToCoords: function(p) {
    var ret = [
      (p[0] - this.state.origin[0]) / this.state.sx,
      (this.state.h - this.state.origin[1] - p[1])/this.state.sy
    ];
    return ret;
  },
  computeVertex: function(state) {
    state = state || this.state;
    var vx = state.v * state.v * Math.sin(2 * state.t) / (2 * state.g);
    var vy = vx * Math.tan(state.t) / 2;
    state.vertex = [ vx, vy ];
  },
  setVertex: function(p) {
    var t = Math.atan(2 * p[1] / p[0]);
    var v = Math.sqrt(this.state.g*(p[0]*p[0] + 4*p[1]*p[1])/(2*p[1]));
    var root = [ 2*p[0], 0 ];
    this.setState({ vertex: p, root: root, t: t, v: v });
  },
  computeRoot: function(state) {
    state = state || this.state;
    state.root = [ state.v * state.v * Math.sin(2 * state.t) / state.g /*2 * state.vertex[0]*/, 0 ];
  },
  setRoot: function(p) {
    var vx = p[0] / 2;
    var t = Math.PI/2 - Math.asin(2 * this.state.g * vx / (this.state.v * this.state.v))/2;
    if (isNaN(t)) return;
    var vy = vx * Math.tan(t) / 2;
    console.log("setRoot: %f,%f, %f, %s", vx, vy, t, p.join(','));
    this.setState({
      root: p,
      vertex: [ vx, vy ],
      t: t
    });
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
      svgToCoords: this.svgToCoords,
      updatePoint: this.updatePoint,
      setVertex: this.setVertex,
      setRoot: this.setRoot,
      setX: function(x) {
        this.setState({ x: x });
      }.bind(this),
      setY: function(y) { this.setState({ y: y }); }.bind(this),
      setXY: function(x, y) { this.setState({ x:x, y:y })}.bind(this)
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
