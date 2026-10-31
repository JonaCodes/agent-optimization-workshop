import {
  checkDependencies,
  checkLoginPrerequisites,
  checkRuntime,
  reportFailure,
} from "./runtime.mjs";
import { checkBrowser } from "./browser-check.mjs";

await reportFailure(async () => {
  await checkRuntime();
  await checkDependencies();
  await checkLoginPrerequisites();
  await checkBrowser();
  console.log(
    "Node, dependencies, login prerequisites, and automation browser are ready.",
  );
  console.log(
    "In Eve, run /login and choose ChatGPT Subscription if you have not signed in.",
  );
});
