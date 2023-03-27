import { imports } from "./mpython-common/imports";
import { render } from "./mpython-common/render";
import { borders } from "./mpython-common/borders";
import { touch } from "./mpython-common/touch";

let cmdRunner;

const importDeps = () => {
  cmdRunner(imports());
};

const showControls = () => {
  cmdRunner(borders(true));
  cmdRunner(touch());
  cmdRunner(render());
};

export const app = {
  run: (execMonocle) => {
    cmdRunner = execMonocle;
    importDeps();
    setTimeout(() => {
      showControls();
    }, 3000);
  },
  leftBtnCallback: () => {
    // navigate
    console.log("left");
  },
  rightBtnCallback: () => {
    // select
    console.log("right");
  },
};
