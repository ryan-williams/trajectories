
var express = require('express');
var path = require('path');

var app = express();
app.use(require('less-middleware')(path.join(__dirname), {
  force: true,
  debug: true
}));
app.use('/static', express.static(path.join(__dirname, 'static')));

app.set('views', __dirname + '/html');

app.get('/', function(req, res) {
  if (req.query.type == 'json') {
    res.json({});
  } else {
    res.render("index.jade", { obj: "foo" });
  }
});

var server = app.listen(8000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

