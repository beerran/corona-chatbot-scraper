import { BaseModel } from "./base-model";
export interface Source extends BaseModel {
    name: string;
}

export const Converter = {
    toFirestore(modelObject: Source): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Source {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            name: data.name || null
        };
    }
}