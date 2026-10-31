import { defineDynamic } from "eve/tools";
import * as browserTools from "@agent-browser/eve/tools";
import {
  browserActionModelOutput,
  browserScreenshotModelOutput,
  browserSnapshotModelOutput,
} from "../../../lib/browser-model-output.js";
import { isSkillLoaded } from "../../../lib/skill-activation.js";

const tools = {
  back: browserTools.back,
  check: browserTools.check,
  click: browserTools.click,
  close: browserTools.close,
  console: browserTools.console,
  dblclick: browserTools.dblclick,
  drag: browserTools.drag,
  errors: browserTools.errors,
  eval: browserTools["eval"],
  fill: browserTools.fill,
  find: browserTools.find,
  forward: browserTools.forward,
  get_attr: browserTools.get_attr,
  get_box: browserTools.get_box,
  get_count: browserTools.get_count,
  get_html: browserTools.get_html,
  get_styles: browserTools.get_styles,
  get_text: browserTools.get_text,
  get_title: browserTools.get_title,
  get_url: browserTools.get_url,
  get_value: browserTools.get_value,
  hover: browserTools.hover,
  network_requests: browserTools.network_requests,
  open: browserTools.open,
  press: browserTools.press,
  read: browserTools.read,
  reload: browserTools.reload,
  screenshot: browserTools.screenshot,
  scroll: browserTools.scroll,
  select: browserTools.select,
  snapshot: browserTools.snapshot,
  tab_close: browserTools.tab_close,
  tab_list: browserTools.tab_list,
  tab_new: browserTools.tab_new,
  tab_switch: browserTools.tab_switch,
  type: browserTools.type,
  uncheck: browserTools.uncheck,
  upload: browserTools.upload,
  wait_for_load: browserTools.wait_for_load,
  wait_for_selector: browserTools.wait_for_selector,
  wait_for_text: browserTools.wait_for_text,
  wait_ms: browserTools.wait_ms,
};

const compactBrowserTools = Object.fromEntries(
  Object.entries(tools).map(([name, tool]) => [name, {
    ...tool,
    toModelOutput: name === "snapshot"
      ? browserSnapshotModelOutput
      : name === "screenshot"
        ? browserScreenshotModelOutput
        : browserActionModelOutput,
  }]),
);

export default defineDynamic(() =>
  isSkillLoaded("browser") || isSkillLoaded("grocery-shopping")
    ? compactBrowserTools
    : null,
);
