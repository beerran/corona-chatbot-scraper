import { BaseModel } from './base-model';

export interface Risk extends BaseModel {
    status: 'new' | 'updated';
    importCases: RiskItem;
    nationalSpread: RiskItem;
}

export interface RiskItem {
    description: string;
    risk: string;
}

export const RiskConverter = {
    toFirestore(modelObject: Risk): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Risk {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            status: data.status || null,
            importCases: data.importCases || null,
            nationalSpread: data.nationalSpread || null,
        };
    }
}