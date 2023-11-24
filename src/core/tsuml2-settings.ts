import { Argv } from "yargs";
import * as fs  from "fs";

export class TsUML2Settings {
    /**
     * required
     */
    glob: string = ""; 

    /**
     * the path to the tsconfig.json file
     */
    tsconfig: string = "./tsconfig.json";


    /**
     * the svg output file (with relative or absolute path)
     */
    outFile: string = "out.svg";

    /**
     * show property types
     */
    propertyTypes= true;

    /**
     * show private, protected, public, static modifiers
     */
    modifiers = true;

    /**
     * add type links
     */
    typeLinks = true;

    /**
     * nomnoml layouting and styling options
     */
    nomnoml: string[] = [];


    /**
     * output file contain the DSL (nomnoml)
     */
    outDsl: string = "";

    /**
     * output file containing mermaid DSL
     */
    outMermaidDsl: string = "";

    /**
     * show associations between classes, interfaces, types and their member types
     */
    memberAssociations = false


    /**
     * parses a json file and merges in the provided options
     * @param json 
     */
    fromJSON(json: string) {
        Object.assign(this,JSON.parse(json));
    }

    fromArgs(yargs: Argv) {

        const argv = yargs.option('glob', {
            describe: "pattern to match the source files (i.e.: ./src/**/*.ts)",
            alias: "g",
            string: true,
            required: true
        }).option('tsconfig',{
            default: this.tsconfig,
            describe: "the path to tsconfig.json file"
        }).option('outFile', {
            describe: "the path to the output file",
            alias: "o",
            default: this.outFile,
        }).option('propertyTypes', {
            default: this.propertyTypes,
            describe: "show property types and method return types",
            boolean: true
        }).option('modifiers', {
            default: this.modifiers,
            describe: "show modifiers like public,protected,private,static",
            boolean: true
        }).option('typeLinks', {
            default: this.typeLinks,
            describe: "add links for classes, interface, enums that point to the source files",
            boolean: true
        }).option('nomnoml', {
            describe: "nomnoml layouting and styling options (an array of strings, each representing a nomnoml line), i.e.: --nomnoml \"#arrowSize: 1\" \"#.interface: fill=#8f8 dashed\" ",
            array: true,
            string: true
        }).option('outDsl', {
            describe: "the path to the output DSL file (nomnoml)",
            string: true,
            required: false,
        }).option('outMermaidDsl', {
            describe: "the path to the output mermaid DSL file",
            string: true,
            required: false,
        }).option('memberAssociations', {
            describe: "show associations between classes, interfaces, types and their member types",
            alias: 'm',
            boolean: true,
            required: false,
            default: this.memberAssociations
        }).option('config', {
            describe: "path to a json config file (command line options can be provided as keys in it)",
            string: true
        }).argv as Partial<TsUML2Settings & { config: string}>;

        if (argv.config) {
            //parse and apply the config file
            const config = fs.readFileSync(argv.config).toString();
            this.fromJSON(config);
        }

        if(argv.glob) {
            this.glob = argv.glob;
        }

        if(argv.tsconfig && !(yargs.parsed as any).defaulted.tsconfig) {
            this.tsconfig = argv.tsconfig;
        }

        if(argv.outFile && !(yargs.parsed as any).defaulted.outFile) {
            this.outFile = argv.outFile;
        }
       
        if(argv.nomnoml) {
            this.nomnoml = argv.nomnoml;
        }

        if(argv.modifiers != null && !(yargs.parsed as any).defaulted.modifiers) {
            this.modifiers = argv.modifiers;
        }

        if(argv.propertyTypes != null && !(yargs.parsed as any).defaulted.propertyTypes) {
            this.propertyTypes = argv.propertyTypes;
        }

        if(argv.typeLinks != null && !(yargs.parsed as any).defaulted.typeLinks) {
            this.typeLinks = argv.typeLinks;
        }

        if(argv.outDsl != null && !(yargs.parsed as any).defaulted.outDsl) {
            this.outDsl = argv.outDsl;
        }

        if(argv.outMermaidDsl != null && !(yargs.parsed as any).defaulted.outMermaidDsl) {
            this.outMermaidDsl = argv.outMermaidDsl;
        }

        if(argv.memberAssociations != null && !(yargs.parsed as any).defaulted.memberAssociations) {
            this.memberAssociations = argv.memberAssociations;
        }
    }
}

/*
    function isUserSetOption(option: string,yargs: Argv<{}>) {
        function searchForOption(option:string) {
          return (process.argv.indexOf(option) > -1);
        }
    
        if (searchForOption(`-${option}`) || searchForOption(`--${option}`))
          return true;
    
        // Handle aliases for same option
        for (let aliasIndex in yargs.choices().parsed.aliases[option]) {
          let alias = yargs.choices().parsed.aliases[option][aliasIndex];
          if (searchForOption(`-${alias}`) || searchForOption(`--${alias}`))
            return true;
        }
    
        return false;
    }
*/
export const SETTINGS = new TsUML2Settings();

