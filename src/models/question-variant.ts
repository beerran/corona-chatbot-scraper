import { BaseModel } from './base-model';
export interface QuestionVariant extends BaseModel {
    question: string;
    faqId: string;
}

export const Converter = {
    toFirestore(modelObject: QuestionVariant): firebase.firestore.DocumentData {
        return modelObject;
    },
    fromFirestore(data: firebase.firestore.DocumentData): QuestionVariant {
        return {
            id: data.id || null,
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null,
            
            question: data.question || null,
            faqId: data.faqId || null
        };
    }
}