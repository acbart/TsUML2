import { PropertyDetails, MethodDetails, MemberAssociation, AssociationType} from "../model";
import { ModifierFlags } from "typescript";
import { TsUML2Settings } from "../tsuml2-settings";
import { Template } from "./template";

export class NomnomlTemplate implements Template {
    public readonly composition = "+->";
    public readonly dependency = "-->";

    constructor(private settings: TsUML2Settings) {}

    public implements (interf: string, implementation: string) {
        return `${this.plainClassOrInterface(interf)}<:--${this.plainClassOrInterface(implementation)}`;
    }
    
    public extends (base: string, derived: string) {
      return `${this.plainClassOrInterface(base)}<:-${this.plainClassOrInterface(derived)}`;
    }

    public plainClassOrInterface(name: string) {return `[${name}]`}
    
    public class(name: string, props: PropertyDetails[], methods: MethodDetails[]) {
        return `[${name}|${props.map(p => this.propertyTemplate(p)).join(";")}|${methods.map(m => this.methodTemplate(m)).join(";")}]`;
    }

    public interface(
        name: string,
        props: PropertyDetails[],
        methods: MethodDetails[]
    ) {
        return `[<interface>${name}|${props.map(p => this.propertyTemplate(p)).join(";")}|${methods.map(m => this.methodTemplate(m)).join(";")}]`;
    }

    public type(
        name: string,
        props: PropertyDetails[],
        methods: MethodDetails[]
    ) {
        return `[<type>${name}|${props.map(p => this.propertyTemplate(p)).join(";")}|${methods.map(m => this.methodTemplate(m)).join(";")}]`;
    }

    public enum(
        name: string,
        enumItems: string[]
    ) {
      return `[<enumeration>${name}|${enumItems.join(";")}]`;
    }

    public memberAssociation(association: MemberAssociation) {
        const parts = [
            this.plainClassOrInterface(association.a.name),
            association.a.multiplicity ?? '',
            association.associationType === AssociationType.Association ? "-" : "--",
            association.b.multiplicity ?? '',
            this.plainClassOrInterface(association.b.name)
        ];
        return parts.join(" ");
    }

    private methodTemplate(method: MethodDetails): string {
        let retVal = method.name + "()";
        if (method.returnType && this.settings.propertyTypes) {
            retVal += ": " + escapeNomnoml(method.returnType);
        }
    
        retVal = this.modifierTemplate(method.modifierFlags) + retVal;
    
        return retVal;
    } 
    
    private propertyTemplate(property: PropertyDetails): string {
    
        let retVal = escapeNomnoml(property.name);
        if (property.type && this.settings.propertyTypes) {
            if(property?.optional) {
                retVal += "?";
            }
            retVal += ": " + escapeNomnoml(property.type);
            
        }
    
        retVal = this.modifierTemplate(property.modifierFlags) + retVal
    
        return retVal;
    }

    private modifierTemplate(modifierFlags: ModifierFlags): string {

        if (!this.settings.modifiers) {
            return "";
        }
    
        let retVal = "";
    
           // UML2: static member should be underlined --> Not supported by nomnoml 
        if(modifierFlags & ModifierFlags.Static) {
            retVal = "static " ;
        }
    
        if(modifierFlags & ModifierFlags.Abstract) {
            retVal = "abstract " ;
        }
    
        if(modifierFlags & ModifierFlags.Private) {
            retVal = "-" + retVal;
        } else if(modifierFlags & ModifierFlags.Protected) {
            retVal = "\\#" + retVal;
        } else {
            retVal = "+" + retVal;
        }
    
     
    
        return retVal;
    }
};


// utility functions
function escapeNomnoml(str: string) {
    return str.replace(/[|\][\#]/g, '\\$&');
}
