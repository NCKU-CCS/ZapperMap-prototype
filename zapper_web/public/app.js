  var map = L.map('map').setView([22.969919, 120.210703], 13);
  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

  var EVENT_COLOR_HEX = ['#BD3F32', 'rgba(203, 87, 75, 0.85)', 'rgba(203, 87, 75, 0.7)',
    'rgba(203, 87, 75, 0.55)', 'rgba(203, 87, 75, 0.4)', 'rgba(203, 87, 75, 0.25)'
  ];
  var currentEventNum = 0;
  var MAX_EVENT_NUM = 50;
  var eventItems = [];

  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'your.mapbox.project.id',
    accessToken: 'pk.eyJ1IjoiY2hpbmc1NiIsImEiOiJjaXNiZmYydGMwMTN1MnpwbnNqNWVqM2plIn0.k7h-PUGX7Tl5xLwDH3Qpsg'
  }).addTo(map);

  /* Initialize the SVG layer */
  map._initPathRoot();
  //L.svg().addTo(map);
  /* We simply pick up the SVG from the map object */
  var svg = d3.select("#map").select("svg");
  g = svg.append("g");

  d3.json("zapper_data.json", function(collection) {
    collection.forEach(function(d) {
      d.LatLng = new L.LatLng(d.lng, d.lat)

      switch (d.status) {
        case 1:
          d.color = "65FF29";
          break;
        case 2:
          d.color = "E8DF2E";
          break;
        case 3:
          d.color = "FFC440";
          break;
        case 4:
          d.color = "E8732E";
          break;
        case 5:
          d.color = "FF3333";
          break;
        default:
          d.color = "FFC440";
          break;
      }

    });
    var radius = 5;

    var feature = g.selectAll("circle")
      .data(collection)
      .enter().append("circle")
      .style("stroke", function(d) {
        return d.color
      })
      .style("opacity", .6)
      .style("fill", function(d) {
        return d.color
      })
      .attr("stroke-width", 20)
      .attr("r", radius)
      .attr('id', function(d) {
        return "z" + d.zapper_id
      })
      .each(pulse);

    map.on("viewreset", update);
    update();



    function update() {
      feature.attr("transform",
        function(d) {
          return "translate(" +
            map.latLngToLayerPoint(d.LatLng).x + "," +
            map.latLngToLayerPoint(d.LatLng).y + ")";

        }
      )
    }

    function pulse() {
      var circle = d3.select(this);
      circle = circle.transition()
        .duration(1000)
        .attr("stroke-width", 20)
        .attr("r", function(d) {
          if (d.u_or_d == "up")
            return 10;
          else if (d.u_or_d == "down")
            return 1;
          else
            return 7;
        })
        .ease('sine');
    }

    repeat();

    function repeat() {
      setInterval(function() {
        var circle = d3.selectAll("circle");
        circle = circle.transition()
          .duration(1000)
          .attr("stroke-width", 20)
          .attr("r", function(d) {
            return Math.floor((Math.random() * 20) + 1)
          })
          .ease('sine');
      }, 3000);
    }
  });

  var svg2 = d3.select(map.getPanes().overlayPane).append("svg"),
    g2 = svg2.append("g").attr("class", "leaflet-zoom-hide");
  var svg3 = d3.select(map.getPanes().overlayPane).append("svg"),
    g3 = svg3.append("g").attr("class", "leaflet-zoom-hide");
  var svg4 = d3.select(map.getPanes().overlayPane).append("svg"),
    g4 = svg4.append("g").attr("class", "leaflet-zoom-hide");
  
  var trend_data = ['trend_data_0.json', 'trend_data_1.json', 'trend_data_2.json'];

  repeat_trend();
  setInterval(function() {
    svg2 = d3.select(map.getPanes().overlayPane).append("svg");
    g2 = svg2.append("g").attr("class", "leaflet-zoom-hide");
    svg3 = d3.select(map.getPanes().overlayPane).append("svg");
    g3 = svg3.append("g").attr("class", "leaflet-zoom-hide");
    svg4 = d3.select(map.getPanes().overlayPane).append("svg");
    g4 = svg4.append("g").attr("class", "leaflet-zoom-hide");
    repeat_trend();
  }, 16000);

  function repeat_trend() {
    var eventIndex = 0;
    setTimeout(function() {
      d3.json(trend_data[0], function(collection) {
        var idCounter = 1;

        currentEventNum += collection.features.length;
        if (currentEventNum > MAX_EVENT_NUM) {
          $('#list ol').empty();
          currentEventNum = 0;
        }

        var events = collection.features.slice();
        events.forEach(function(event) {
          var id = event.properties.id
          addEventListItem(id, '', EVENT_COLOR_HEX[eventIndex > 5 ? 5 : eventIndex]);
          eventIndex++;
        });
        //  create a d3.geo.path to convert GeoJSON to SVG
        var transform = d3.geo.transform({ point: projectPoint }),
          path = d3.geo.path().projection(transform);

        // create path elements for each of the features
        d3_features = g3.selectAll("path")
          .data(collection.features)
          .enter().append("path");

        map.on("viewreset", reset);

        reset();

        // fit the SVG element to leaflet's map layer
        function reset() {

          bounds = path.bounds(collection);

          var topLeft = bounds[0],
            bottomRight = bounds[1];

          svg3.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

          g3.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          // initialize the path data 
          d3_features.attr("d", path)
            .style("stroke", "red")
            .attr("stroke-width", 3)
            .attr('fill', 'none');
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }
      });
    }, 3000);
    setTimeout(function() {
      d3.json(trend_data[1], function(collection) {
        var idCounter = 1;


        currentEventNum += collection.features.length;
        if (currentEventNum > MAX_EVENT_NUM) {
          $('#list ol').empty();
          currentEventNum = 0;
        }

        var events = collection.features.slice();
        events.forEach(function(event) {
          var id = event.properties.id

          addEventListItem(id, '', EVENT_COLOR_HEX[eventIndex > 5 ? 5 : eventIndex]);
          eventIndex++;
        });
        //  create a d3.geo.path to convert GeoJSON to SVG
        var transform = d3.geo.transform({ point: projectPoint }),
          path = d3.geo.path().projection(transform);

        // create path elements for each of the features
        d3_features = g2.selectAll("path")
          .data(collection.features)
          .enter().append("path");

        map.on("viewreset", reset);

        reset();

        // fit the SVG element to leaflet's map layer
        function reset() {

          bounds = path.bounds(collection);

          var topLeft = bounds[0],
            bottomRight = bounds[1];

          svg2.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

          g2.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          // initialize the path data 
          d3_features.attr("d", path)
            .style("stroke", "red")
            .attr("stroke-width", 3)
            .attr('fill', 'none');
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }
      });
    }, 6000);
    setTimeout(function() {
      d3.json(trend_data[2], function(collection) {
        var idCounter = 1;


        currentEventNum += collection.features.length;
        if (currentEventNum > MAX_EVENT_NUM) {
          $('#list ol').empty();
          currentEventNum = 0;
        }

        var events = collection.features.slice();
        events.forEach(function(event) {
          var id = event.properties.id;
          addEventListItem(id);
          eventIndex++;
        });

        //  create a d3.geo.path to convert GeoJSON to SVG
        var transform = d3.geo.transform({ point: projectPoint }),
          path = d3.geo.path().projection(transform);

        // create path elements for each of the features
        d3_features = g4.selectAll("path")
          .data(collection.features)
          .enter().append("path");

        map.on("viewreset", reset);

        reset();

        // fit the SVG element to leaflet's map layer
        function reset() {

          bounds = path.bounds(collection);

          var topLeft = bounds[0],
            bottomRight = bounds[1];

          svg4.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

          g4.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          // initialize the path data 
          d3_features.attr("d", path)
            .style("stroke", "red")
            .attr("stroke-width", 3)
            .attr('fill', 'none');
        }

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
          var point = map.latLngToLayerPoint(new L.LatLng(y, x));
          this.stream.point(point.x, point.y);
        }
      });
    }, 9000);
    setTimeout(function() {
      svg3.selectAll("*").remove();
    }, 9000);
    setTimeout(function() {
      svg2.selectAll("*").remove();
    }, 12000);
    setTimeout(function() {
      svg4.selectAll("*").remove();
    }, 15000);
  }

  function addEventListItem(zapperId) {
    var colorHex;
    if ((zapperId+1) > eventItems.length || eventItems.length===0) {
      // console.log('push',zapperId, eventItems)
      colorHex = EVENT_COLOR_HEX[5];
      var html = '<li style="background-color:' + colorHex + '"> no.' + zapperId + ' event, 1 times</li>';
      var item = $(html);
      // item.data('id',zapperId).data('time', 1);
      $('#list ol').prepend(item);
      eventItems.push({ tag: item, time: 1 });
    } else {
      // console.log('repalce',zapperId, eventItems)
      colorHex = EVENT_COLOR_HEX[(5-Math.floor((eventItems[zapperId].time/1)))<0?0:(5-Math.floor((eventItems[zapperId].time/1)))];
      var html = '<li style="background-color:' + colorHex + '">no.' + zapperId + ' event, ' + (eventItems[zapperId].time+1) + ' times</li>';
      var item = $(html).css('top',eventItems[zapperId].tag.css('top'));
      // item.data('id',zapperId).data('time', eventItems[zapperId].time+1);
      eventItems[zapperId].tag.after(item);
      eventItems[zapperId].tag.fadeOut().remove();
      eventItems[zapperId] = { tag: item, time: eventItems[zapperId].time + 1 };
    }
    sortlist();
  }

  function sortlist(){
    var seq = [];
    eventItems.forEach(function(d, i){
      var dom = d.tag;
      var time = d.time;
      var id = i;
      seq.push([i, time]);
    });

    seq.sort(function(a,b){
      if( a[1] === b[1] )
        return b[0]- a[0]
      else
        return b[1] - a[1];
    });

    seq.forEach(function(d, i){
      console.log(eventItems[d[0]].tag)
      eventItems[d[0]].tag.css('top',(i*50+12)+'px');
    })
  }
