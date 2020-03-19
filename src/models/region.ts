import { IndexedBaseModel } from './base-model';
export interface Region extends IndexedBaseModel {
    index: number;
    name: string;
    cases: number;
    incidence: number;
    percent: number;
}

export const RegionConverter = {
    toFirestore(modelObject: Region): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Region {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            index: data.index || null,
            name: data.name || null,
            cases: data.cases || 0,
            incidence: data.incidence || 0,
            percent: data.percent || 0
        };
    }
}