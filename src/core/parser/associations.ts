
import { VariableDeclarationList } from "ts-morph";
import { TypeAlias, Clazz, Interface, FileDeclaration, MemberAssociation, PropertyDetails, Enum, AssociationType, MethodDetails, Multiplicity } from "../model";

export function parseAssociations(declarations: FileDeclaration[]) {
    const associationMap: Map<string, MemberAssociation> = new Map();
    const typeMap = createTypeMap(declarations);
 
    declarations.forEach(decl => {
        const associations = [
            decl.classes.map(clazz => parseAssociationOfAnyType(clazz, associationMap, typeMap)),
            decl.interfaces.map(inter => parseAssociationOfAnyType(inter, associationMap, typeMap)),
            decl.types.map(t => parseAssociationOfAnyType(t, associationMap, typeMap)),
        ];

        decl.memberAssociations = associations.flat(2);
    })
    processAssociationInheritance(associationMap,typeMap);
    deduplicateAssociations(declarations);

}

function createTypeMap(declarations: FileDeclaration[]) {
    const typeMap: Map<string, Clazz|Enum> = new Map();
 
    declarations.forEach(decl => {
            decl.classes.forEach(clazz => typeMap.set(clazz.id,clazz));
            decl.interfaces.forEach(inter =>  typeMap.set(inter.id,inter));
            decl.types.forEach(t =>  typeMap.set(t.id,t));  
            decl.enums.forEach(e => typeMap.set(e.id, e));
    });
    return typeMap;
}


const seen: Record<string, boolean> = {};
function parseAssociationOfAnyType(t: Clazz | Interface | TypeAlias, associationMap: Map<string, MemberAssociation>, typeMap: Map<string, Clazz|Enum>) {
    const associations: MemberAssociation[] = [];
    const parseAssociation = (id: string, multiplicity: Multiplicity, assType: AssociationType) => {
        const assId = `${t.id}_${id}`;
        const reverseId = `${id}_${t.id}`
        let ass = associationMap.get(reverseId);
        if(!ass) {
            if (!associationMap.has(assId)) {
                seen[reverseId] = true;
                const propType = typeMap.get(id);
                if(!propType) {
                    return;
                }
                
                ass = new MemberAssociation(
                    { typeId: t.id, name: t.name},
                    { typeId: id, name: propType.name, multiplicity: multiplicity},
                    assType
                );
                associationMap.set(assId, ass);
                associations.push(ass);
            }
        } else {
            createReverseAssociation(ass, multiplicity);
        }
    }

    t.methods.filter(m => m.uses.length > 0).forEach(m => {
        m.uses.forEach(id => parseAssociation(id, getMultiplicityOfProp(m.returnType), AssociationType.Dependency));
    });
    t.properties.filter(prop => prop.typeIds.length > 0).forEach(prop => {
        prop.typeIds.forEach(id => parseAssociation(id, getMultiplicityOfProp(prop.type), AssociationType.Association))
    })
    return associations;
}


function createReverseAssociation(association: MemberAssociation, multiplicity: Multiplicity) {
    association.a.multiplicity = multiplicity;
}

function getMultiplicityOfProp(prop: string | undefined): Multiplicity {
    if(prop && prop.includes("[")) {
        return '0..*'
    } 
    return undefined;
}

/**
 * remove associations from sub types / classes / interfaces 
 * if an association to the same member is already present in the base type / class / interface
 */
function processAssociationInheritance(associationMap: Map<string, MemberAssociation>, typeMap: Map<string, Clazz|Enum>) {
    associationMap.forEach( (association, id) => {
        if(checkInheritedAssociation(association.a.typeId, association.b.typeId, associationMap, typeMap)) {
            associationMap.delete(id);
        }
    })
}

function checkInheritedAssociation(srcTypeId: string, associatedTypeId: string, associationMap: Map<string, MemberAssociation>, typeMap: Map<string, Clazz|Enum>): boolean {
    let inherited = false;
    const type = typeMap.get(srcTypeId);
    const heritageClauses = (type as Interface).heritageClauses;
    for(const clause of heritageClauses) {
        const base = typeMap.get(clause.clauseTypeId);
        if(!base) {
            continue;
        }
        inherited = associationMap.has(`${base.id}_${associatedTypeId}`);
        inherited = checkInheritedAssociation(base.id, associatedTypeId, associationMap, typeMap ) || inherited;
        if( inherited)
        {
            associationMap.get(`${srcTypeId}_${associatedTypeId}`)!.inerhited = true;
        }

    }

    return inherited;
}

function deduplicateAssociations(declarations: FileDeclaration[]) {
    declarations.forEach(decl => {
        decl.memberAssociations = decl.memberAssociations?.filter(ass => !ass.inerhited);
    }) 
}