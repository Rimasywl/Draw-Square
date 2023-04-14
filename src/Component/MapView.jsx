import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { fromLonLat } from "ol/proj";
import MapContext from "../../context/MapContext";
import ScalingMenu from "../ScalingMenu/ScalingMenu";
import MapViewMenu from "../MapViewMenu/MapViewMenu";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useWindowSize } from "../../hooks/UseWindowSize";
import ScaleLineBar from "../ScalingMenu/ScaleLineBar";
import CoordinateLonLat from "../CoordinateMap/CoordinateLonLat";

import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Feature } from "ol";
import { MultiLineString, Polygon, Circle } from "ol/geom";
import { Style, Stroke } from "ol/style";
import PopUpDraw from "../PopUpDraw/PopUpDraw";
import PopUpDrawMenuSelf from "../PopUpDraw/PopUpDrawMenuSelf";
import Motion from "../MotionMap/Motion";

const MapView = () => {
  const [isMaps, setIsMaps] = useState(null);
  const mapRef = useRef();
  const size = useWindowSize();
  const [source, setSource] = useState(null);

  const [options, setOptions] = useState(null);
  const [popUp, setPopUp] = useState(false);

  const [lineColor, setLineColor] = useState("#000000");
  const [opacity, setOpacity] = useState(100);

  const handlePopUp = () => {
    setPopUp(!popUp);
  };

  const handleOptions = (e) => {
    setOptions(e.target.innerText);
    setPopUp(false);
  };

  const handleLineColor = (color) => {
    setLineColor(color);
  };

  const handleOpacity = (value) => {
    setOpacity(value);
  };

  useEffect(() => {
    // Map options
    const options = {
      view: new View({
        center: fromLonLat([118.8186111, -1.15]),
        zoom: 5.34,
      }),
      layers: [],
      controls: [],
      overlays: [],
    };

    const mapObject = new Map(options);
    mapObject.setTarget(mapRef.current);

    setIsMaps(mapObject);

    window.addEventListener("resize", () => {
      mapObject.updateSize(); // change map to map.current
    });

    return () => {
      mapObject.setTarget(null);
      window.removeEventListener("resize", () => {
        mapObjectupdateSize(); // change map to map.current
      });
      mapObject.dispose(); // change map to map.current
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.style.height = "100%";
      mapRef.current.style.width = "100%";
    }
  }, [size]);

  useEffect(() => {
    if (!isMaps) return;
    isMaps.getView().setZoom(zoom);
  }, []);

  useEffect(() => {
    if (!isMaps) return;
    isMaps.getView().setCenter(fromLonLat([118.8186111, -1.15]));
  }, []);

  // Load saved features from local storage
  const loadLine = () => {
    let savedFeaturesJson = localStorage.getItem("drawnSingleLine");
    if (savedFeaturesJson) {
      const savedFeaturesCoords = JSON.parse(savedFeaturesJson);
      const savedFeatures = savedFeaturesCoords.map((coords) => {
        const geometry = new MultiLineString(coords);
        return new Feature(geometry);
      });

      source?.addFeatures(savedFeatures);
    }
  };

  const loadPolyLine = () => {
    let savedFeaturesJson = localStorage.getItem("drawnPolyLine");
    if (savedFeaturesJson) {
      const savedFeaturesCoords = JSON.parse(savedFeaturesJson);
      const savedFeatures = savedFeaturesCoords.map((coords) => {
        const geometry = new MultiLineString(coords);
        return new Feature(geometry);
      });
      source?.addFeatures(savedFeatures);
    }
  };

  const loadSquare = () => {
    let savedFeaturesJson = localStorage.getItem("drawnSquare");
    if (savedFeaturesJson) {
      const savedFeaturesCoords = JSON.parse(savedFeaturesJson);
      const savedFeatures = savedFeaturesCoords.map((coords) => {
        const geometry = new MultiLineString(coords);
        return new Feature(geometry);
      });
      source?.addFeatures(savedFeatures);
    }
  };

  const loadLingkaran = () => {
    let savedFeaturesJson = localStorage.getItem("drawnCircle");
    console.log(savedFeaturesJson);
    if (savedFeaturesJson) {
      const savedFeaturesData = JSON.parse(savedFeaturesJson);
      const savedFeatures = savedFeaturesData.map((data) => {
        const geometry = new Circle(data.center, data.radius);
        return new Feature(geometry);
      });
      source?.addFeatures(savedFeatures);
    }
  };


  const loadPolygon = () => {
    let savedFeaturesJson = localStorage.getItem("drawnPolygon");
    if (savedFeaturesJson !== null) {
      const savedFeaturesCoords = JSON.parse(savedFeaturesJson);
      const savedFeatures = savedFeaturesCoords.map((coords) => {
        const geometry = new Polygon(coords);
        return new Feature(geometry);
      });

      source?.addFeatures(savedFeatures);
    }
  };

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><line x1="0" y1="0" x2="10" y2="10" stroke="red" stroke-width="2" /><line x1="0" y1="10" x2="10" y2="0" stroke="red" stroke-width="2" /></svg>';
  const domUrl = window.URL || window.webkitURL || window;
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = domUrl.createObjectURL(svgBlob);
  const image = new Image();
  image.src = url;

  useEffect(() => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      // make x line
      style: new Style({
        stroke: new Stroke({
          color: "#245953",
          width: 2,
        }),
      }),
    });

    isMaps?.addLayer(vectorLayer);
    setSource(vectorSource);
  }, [isMaps]);

  useEffect(() => {
    loadLine();
    loadPolyLine();
    loadPolygon();
    loadLingkaran();
  }, [source]);

  return (
    <MapContext.Provider
      value={{
        isMaps,
        source,
        lineColor,
        handleLineColor,
        opacity,
        handleOpacity,
      }}
    >
      <div className="w-full h-full">
        <div ref={mapRef} className="w-full h-screen" />
        <MapViewMenu />
        <ScalingMenu />
        <NavigationBar />
        <Motion />

        <PopUpDraw
          id={"SingleLinePopUp"}
          option={options}
          popUp={popUp}
          handlePopUp={handlePopUp}
          idDone={"SingleLineDone"}
          idBackDrop={"SingleLineBackDrop"}
          element={
            <React.Fragment>
              <PopUpDrawMenuSelf
                text={"Forward Edge of The Battle Area"}
                onClick={handleOptions}
              />
              <PopUpDrawMenuSelf text={"Waypoint"} onClick={handleOptions} />
              <PopUpDrawMenuSelf
                text={"Follow and Support"}
                onClick={handleOptions}
              />
              <PopUpDrawMenuSelf text={"Main Attack"} onClick={handleOptions} />
              <PopUpDrawMenuSelf
                text={"Supporting Area Attack"}
                onClick={handleOptions}
              />
              <PopUpDrawMenuSelf
                text={"Follow and Support"}
                onClick={handleOptions}
              />
              <PopUpDrawMenuSelf
                text={"Forward Line of Own Troops (FLOT)"}
                onClick={handleOptions}
              />
              <PopUpDrawMenuSelf
                text={"NO_STATEMENT (default)"}
                onClick={handleOptions}
              />
            </React.Fragment>
          }
        />
        <div className="absolute bottom-0 w-full h-10 bg-black py-2 px-6 flex justify-end items-center gap-4">
          <CoordinateLonLat />
          <ScaleLineBar />
        </div>
      </div>
    </MapContext.Provider>
  );
};

export default MapView;
