import React, { useContext, useState } from "react";
import { FaSlash } from "react-icons/fa";
import NavigationMenu from "../../NavigationMenu";
import { Draw } from "ol/interaction";
import MapContext from "../../../../context/MapContext";
import DrawDropDown from "../DrawDropDown";
import { BsFillPencilFill, BsFillTrash2Fill, BsPencil, BsSquare } from "react-icons/bs";
import { ImUndo } from "react-icons/im";
import { createRegularPolygon } from 'ol/interaction/Draw';

const Square = ({drawing}) => {
  const { isMaps, source } = useContext(MapContext) || {};
  const [click, setClick] = useState(false);

  const drawLine = () => {
    const draw = new Draw({
      source: source,
      type: 'Circle',
      geometryFunction: createRegularPolygon(4),
    });

    isMaps.addInteraction(draw);

    draw.on("drawend", () => {
      source.on("addfeature", (event) => {
        const features = source.getFeatures();
        const featuresJson = JSON.stringify(
            features.map((feature) => feature.getGeometry().getCoordinates())
          );
          localStorage.setItem("drawnPolygon", featuresJson);
        
      });
    });
  };

  // Delete one feature (undo)
  const deleteDraw = () => {
    const feature = source.getFeatures();
    const lastFeature = feature[feature.length - 1];
    source.removeFeature(lastFeature);

    const current = JSON.parse(localStorage.getItem("drawnPolygon")) || [];
    current.pop();
    localStorage.setItem("drawnPolygon", JSON.stringify(current));
  };

  // Remove draw interaction
  const unDraw = () => {
    const interactions = isMaps.getInteractions();
    interactions.forEach((interaction) => {
      if (interaction instanceof Draw) {
        isMaps.removeInteraction(interaction);
      }
    });
  };

  return (
    <div className="flex ">
      <NavigationMenu
        icon={<BsSquare size={20} />}
        clickHandler={() => setClick(!click)}
      />
      {click && (
        <DrawDropDown
          element={
            <React.Fragment>
              <NavigationMenu
                label={"Draw"}
                icon={<BsFillPencilFill />}
                clickHandler={drawing}
              />
              <NavigationMenu
                label={"Undraw"}
                icon={<BsPencil />}
                clickHandler={() => unDraw()}
              />
              <NavigationMenu
                label={"Undo"}
                icon={<ImUndo />}
                clickHandler={() => deleteDraw()}
              />
            </React.Fragment>
          }
          className={`bottom-[-10.5rem]`}
        />
      )}
    </div>
  );
};

export default Square;
