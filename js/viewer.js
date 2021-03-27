var navMap;

/*-- Initialization function --*/
function init() {


  //define map object & link to placeholder div:
  navMap = new ol.Map({ target: "map_container", attribution: false });
  // define layer as tiled map:
  osmLayer = new ol.layer.Tile({
    title: 'OpenStreetMap',
    baseLayer: 'true',
    visible: true,
    // load OSM (a connector predefined in the API) as source:
    source: new ol.source.OSM()
  });
  bingAerial = new ol.layer.Tile({
    title: 'Bing Aerial',
    baseLayer: 'true',
    visible: false,
    preload: Infinity,
    source: new ol.source.BingMaps({
      // We need a key to get the layer from the provider. 
      // Sign in with Bing Maps and you will get your key (for free)
      key: 'Ap5mgiXRshxB7Fnt76VHYWdUn_lNWr5nZ_4Bu49YiyYbo5EfjfnFpT9CXNe_X96w',
      imagerySet: 'AerialWithLabels', // or'Aerial' 'Road', 'AerialWithLabels', etc.
      // use maxZoom 19 to see stretched tiles instead of the Bing Maps
      // "no photos at this zoom level" tiles
      maxZoom: 19
    })
  });

  dtm = new ol.layer.Tile({
    title: 'DTM (5m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "dtm", "TILED": true }
    })
  });

  contour = new ol.layer.Tile({
    title: 'Contour (20m)',
    visible: true,
    source: new ol.source.TileWMS({
      url: "https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map=d:/iishome/student/s2451573/Photogrammetry-Website/configWMS.map&",
      params: { "LAYERS": "contour", "TILED": true }
    })
  });



  var baseLayers = new ol.layer.Group({
    title: 'Base Layers',
    openInLayerSwitcher: true,
    layers: [
      osmLayer,
      bingAerial
    ]
  });

  navMap.addLayer(baseLayers);
  // create a map view:
  navMap.addLayer(dtm);
  navMap.addLayer(contour);



  navMap.setView(
    new ol.View({
      center: ol.proj.transform([37.86, 6.96], 'EPSG:4326', 'EPSG:3857'),
      zoom: 13
    })    //center coords and zoom level:
  );
  navMap.addControl(new ol.control.Zoom());
  navMap.addControl(new ol.control.ScaleLine());
  navMap.addControl(new ol.control.MousePosition({
    projection: 'EPSG:4326',
    coordinateFormat: ol.coordinate.createStringXY(4)
  })
  );

  navMap.on('singleclick', function(evt) {
    // first clear the contents of the results div:
    document.getElementById("queryresultsDiv").innerHTML = "";
    // retrieve map resolution details from the map object
    var viewResolution = navMap.getView().getResolution();
    // now create a url with an OGC GetFeatureInfo request:
    var url = contour.getSource().getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, 'EPSG:4326',
      {'INFO_FORMAT': 'text/plain',  //format to ask info in
        'QUERY_LAYERS': 'dtm,contour'} //layers to ask info for
    );
    // an iframe in the div fires the request and retrieves the results:
    document.getElementById("queryresultsDiv").innerHTML =
      '<iframe height="100%" seamless src="' + url + '"></iframe>';
  });


  var updateLegend = function (resolution) {
    var graphicUrl = dtm.getLegendUrl(resolution);
    var img = document.getElementById('legend');
    img.src = graphicUrl;
  };

  
  var switcher = new ol.control.LayerSwitcher({
    tipLabel: 'Layers',
    useLegendGraphics: true,
    collapsed: false
  });
  navMap.addControl(switcher);

  switcher.on('drawlist', function (e) {
    console.log('Switcher drawlist');

  })
  navMap.getView().on('change:resolution', function (event) {
    var resolution = event.target.getResolution();
    updateLegend(resolution);
  });

}