#! /usr/bin/env node

import chalk from "chalk";
import yargs from "yargs";
import { createDiagram } from "../core";
import { SETTINGS } from "../core/tsuml2-settings";

(async () => {
    try {

        SETTINGS.fromArgs(yargs);

        if (SETTINGS.glob.length === 0) {
            console.log(chalk.redBright("Missing --glob"));
        } else {
            createDiagram(SETTINGS);
        }

    } catch(e) {
        console.log(chalk.redBright(e),e);
    }
})();
