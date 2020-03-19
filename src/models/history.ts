import { BaseModel } from './base-model';

export interface History extends BaseModel {
    model: BaseModel;
}

export const HistoryConverter = {
    toFirestore(modelObject: History): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): History {
        return {
            id: data.id,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            model: data.model
        };
    }
}