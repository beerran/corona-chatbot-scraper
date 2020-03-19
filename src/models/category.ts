import { BaseModel } from './base-model';
export interface Category extends BaseModel {
    name: string;
}

export const Converter = {
    toFirestore(modelObject: Category): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Category {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            name: data.name || null
        };
    }
}