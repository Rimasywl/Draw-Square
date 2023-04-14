import React, { useContext, useEffect, useState } from "react";
import NavigationMenu from "../NavigationMenu";
import { BsCircle, BsSquare } from "react-icons/bs";
import SingleLine from "./SingleLine/SingleLine";
import Polygon from "./Polygon/Polygon";
import MapContext from "../../../context/MapContext";
import { Draw } from "ol/interaction";
import PolyLine from "./Polyline/Polyline";
import { createRegularPolygon } from 'ol/interaction/Draw';
import Square from "./Square/Square";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Circle from "./Circle/Circle";

const NavSideMenu = () => {
  const { isMaps, source, lineColor, opacity } = useContext(MapContext) || {};
  const [draw, setDraw] = useState(null);
  const [globalFeature, setGlobalFeature] = useState(null);

  // Draw single line
  const handleDrawSingleLine = () => {
    const drawSingleLine = new Draw({
      source: source,
      type: "MultiLineString",
      maxPoints: 2,
    });
    setDraw(drawSingleLine);
    isMaps.addInteraction(drawSingleLine);
  };

  // Draw polygon
  const handleDrawPolygon = () => {
    const drawPolygon = new Draw({
      source: source,
      type: "Polygon",
    });
    setDraw(drawPolygon);
    isMaps.addInteraction(drawPolygon);
  };

  // Draw PolyLine
  const handleDrawPolyLine = () => {
    const drawPolyLine = new Draw({
      source: source,
      type: "MultiLineString",
    });
    setDraw(drawPolyLine);
    isMaps.addInteraction(drawPolyLine);
  };

  //Draw Square
  const handleDrawSquare = () => {
    const drawSquare = new Draw({
      source: source,
      type: 'Circle',
      geometryFunction: createRegularPolygon(4),
    });
    setDraw(drawSquare);
    isMaps.addInteraction(draw);
  };

  // Draw Circle
  const handleDrawCircle = () => {
    const drawCircle = new Draw({
      source: source,
      type: "Circle",
    });
    setDraw(drawCircle);
    isMaps.addInteraction(drawCircle);
  };

  // Convert hexa to rgba
  function hexToRgba(hex, alpha) {
    const alphas = alpha / 100;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alphas})`;
  }

  useEffect(() => {
    // console.log when draw is end and when draw watype is multilinestring
    if (draw ) {
      if (draw.type_ === 'MultiLineString' && draw.maxPoints_ == 2){
        draw.on("drawend", (e) => {
          const maxPoints = draw.maxPoints_;
          const feature = e.feature;
          setGlobalFeature(feature);
          const geometry = feature.getGeometry();
          const type = geometry.getType();
          const button = document.getElementById("SingleLinePopUp");
          const buttonDone = document.getElementById("SingleLineDone");
          const buttonCancel = document.getElementById("SingleLineBackDrop");
  
          if (type === "MultiLineString" && maxPoints === 2) {
            button.classList.remove("hidden");
            button.classList.add("flex");
  
            buttonDone.onclick = () => {
              const features = source.getFeatures();
              const featuresJson = features.map((feature) => {
                const geometry = feature.getGeometry();
                const type = geometry.getType();
                if (type === "MultiLineString" && maxPoints === 2) {
                  return feature.getGeometry().getCoordinates();
                }
              });
              const savedFeatures = featuresJson.filter(
                (features) => features != undefined
              );
  
              // Save to local storage
              localStorage.setItem(
                "drawnSingleLine",
                JSON.stringify(savedFeatures)
              );
  
              button.classList.add("hidden");
              button.classList.remove("flex");
            };
          }
  
          buttonCancel.addEventListener("click", () => {
            // delete last feature from draw not from source
            source.removeFeature(feature);
  
            button.classList.add("hidden");
            button.classList.remove("flex");
          });
        });
  
        if (globalFeature) {
          globalFeature.setStyle(
            new Style({
              stroke: new Stroke({
                color: hexToRgba(lineColor, opacity),
                width: 2,
              }),
            })
          );
        }
      }
    }
  }, [draw, lineColor]);

  useEffect(() => {
    if (draw) {
      if (draw.type_ === 'MultiLineString' && draw.maxPoints_ > 2){
        draw.on("drawend", (e) => {
          const maxPoints = draw.maxPoints_;
          const feature = e.feature;
          const geometry = feature.getGeometry();
          const type = geometry.getType();
          source.on("addfeature", (event) => {
            const features = source.getFeatures();
            if (type === "MultiLineString" && maxPoints > 2) {
              const featuresJson = features.map((feature) => {
                const geometry = feature.getGeometry();
                const type = geometry.getType();
                if (type === "MultiLineString" && maxPoints > 2) {
                  return feature.getGeometry().getCoordinates();
                }
              });
  
              const savedFeatures = featuresJson.filter(
                (features) => features != undefined
              );
  
              localStorage.setItem(
                "drawnPolyLine",
                JSON.stringify(savedFeatures)
              );
            }
          });
        });
      }
    }
  }, [draw]);

  useEffect(() => {
    if (draw) {
        draw.on("drawend", (e) => {
          const feature = e.feature;
          const geometry = feature.getGeometry();
          const type = geometry.getType();
          const maxPoints = geometry.getCoordinates()[0].length;
          source.on("addfeature", (event) => {
            const features = source.getFeatures();
  
            if (type === "Polygon" && maxPoints == 4) {
              const featuresJson = features.map((feature) => {
                const geometry = feature.getGeometry();
                const type = geometry.getType();
                if (type === "Polygon" && maxPoints == 4) {
                  return feature.getGeometry().getCoordinates();
                }
              });
  
              const savedFeatures = featuresJson.filter(
                (features) => features != undefined
              );
  
              localStorage.setItem("drawnCircle", JSON.stringify(savedFeatures));
            }
          });
        });
      }
  }, [draw]);

  useEffect(() => {
    if (draw) {
      if (draw.type_ === 'Polygon' ){
        draw.on("drawend", (e) => {
          const feature = e.feature;
          const geometry = feature.getGeometry();
          const type = geometry.getType();
          source.on("addfeature", (event) => {
            const features = source.getFeatures();
  
            if (type === "Polygon") {
              const featuresJson = features.map((feature) => {
                const geometry = feature.getGeometry();
                const type = geometry.getType();
                if (type === "Polygon") {
                  return feature.getGeometry().getCoordinates();
                }
              });
  
              const savedFeatures = featuresJson.filter(
                (features) => features != undefined
              );
  
              localStorage.setItem("drawnPolygon", JSON.stringify(savedFeatures));
            }
          });
        });
      }
    }
  }, [draw]);

  useEffect(() => {
    if (draw) {
      if (draw.type_ === 'Circle' ){
        draw.on("drawend", (e) => {
          const feature = e.feature;
          const geometry = feature.getGeometry();
          const type = geometry.getType();
          source.on("addfeature", (event) => {
            const features = source.getFeatures();
  
            if (type === "Circle") {
              const featuresJson = features.map((feature) => {
                const geometry = feature.getGeometry();
                const type = geometry.getType();
                if (type === "Circle") {
                  const center = geometry.getCenter();
              const radius = geometry.getRadius();
              return {center: center, radius:radius}
                }
              });
  
              const savedFeatures = featuresJson.filter(
                (features) => features != undefined
              );
  
              localStorage.setItem("drawnCircle", JSON.stringify(savedFeatures));
            }
          });
        });
      }
    }
  }, [draw]);

  


  return (
    <React.Fragment>
      <div className="nav-side-menu absolute bg-white w-fit p-1 flex justify-center items-center gap-2 rounded-large right-14 top-[15.2rem]">
        <SingleLine drawing={handleDrawSingleLine} />
        <PolyLine drawing={handleDrawPolyLine} />
        <Square drawing={handleDrawSquare} />
        <Circle 
        drawing={handleDrawCircle} 
        />
        <NavigationMenu icon={<BsSquare size={20} />} />
        <Polygon drawing={handleDrawPolygon} />
      </div>
    </React.Fragment>
  );
};

export default NavSideMenu;
