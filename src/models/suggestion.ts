import { IndexedBaseModel } from './base-model';
import firebase from 'firebase';

export interface Suggestion extends IndexedBaseModel {
    index: number;
    sourceId: string;
    question: string;
    answer: string;
    status: 'New' | 'Updated' | 'Approved';
    faqId: string;
}

export const Converter = {
    toFirestore(modelObject: Suggestion): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Suggestion {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            index: data.index || null,
            sourceId: data.sourceId || null,
            question: data.question || null,
            answer: data.answer || null,
            status: data.status || null,
            faqId: data.faqId || null
        };
    }
}