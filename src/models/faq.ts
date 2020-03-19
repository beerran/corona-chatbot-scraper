import { BaseModel } from './base-model';
export interface Faq extends BaseModel {
    status: string;
    categoryId: string;
    risk: 'Low' | 'Medium' | 'High';
    suggestionId: string;
    answer: string;
    question: string;
}

export const Converter = {
    toFirestore(modelObject: Faq): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): Faq {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            status: data.status || null,
            categoryId: data.categoryId || null,
            risk: data.risk || null,
            suggestionId: data.suggestionId || null,
            answer: data.answer || null,
            question: data.question || null
        };
    }
}