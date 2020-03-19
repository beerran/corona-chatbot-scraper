import { FirebaseApp } from '../firebase/firebase';
import { BaseModel } from '../models/base-model';
import { History, HistoryConverter } from '../models/history';
import { Criteria } from '../common/criteria';

export class DataService<T extends BaseModel> {
    private collection: FirebaseFirestore.CollectionReference<T>;
    private historyCollection: FirebaseFirestore.CollectionReference<History>;

    constructor(private collectionName: string, private converter: FirebaseFirestore.FirestoreDataConverter<T>) {
        this.collection = FirebaseApp.database.collection(collectionName).withConverter(converter);
        this.historyCollection = FirebaseApp.database.collection(`${collectionName}-history`).withConverter(HistoryConverter);
    }

    async getById(id: string) : Promise<T> {
        const ref = this.collection.doc(id);
        if (ref === null) {
            throw new Error(`No entity with id ${id} found in ${this.collectionName}`);
        }
        return ref.get().then(this.mapData, this.errorHandler);
    }
    async getAll(): Promise<T[]> {
        return this.collection.get().then(snapshot => snapshot.docs.map(this.mapData), this.errorHandler);
    }

    async create(entity: T): Promise<T> {
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        return this.collection.add(entity).then(ref => ref.get().then(this.mapData), this.errorHandler);
    }

    async update(entity: T): Promise<T> {
        const item = this.collection.doc(entity.id as string);
        if (item === null) {
            throw new Error(`No entity with id ${entity.id} found in ${this.collectionName}`);
        }

        let itemToUpdate: T;
        return item.get().then(currentItem => {
            itemToUpdate = this.mapData(currentItem);
            return this.historyCollection.add({model: {...itemToUpdate, id: itemToUpdate.id}, createdAt: new Date(), updatedAt: new Date})
        }, this.errorHandler)
        .then(async () => {
            entity.updatedAt = new Date();
            await item.update(entity);
            return await item.get();
        }, this.errorHandler)
        .then(this.mapData, this.errorHandler);
    }

    async remove(id: string): Promise<History> {
        const item = this.collection.doc(id)
        if (item === null) {
            throw new Error(`No entity with id ${id} found in ${this.collectionName}`);
        }
        let itemToDelete: T;
        return item.get().then(oldItem => {
            itemToDelete = this.mapData(oldItem);
            return this.historyCollection.add({model: {...itemToDelete, id: itemToDelete.id}, createdAt: new Date(), updatedAt: new Date()});
        }, this.errorHandler)
        .then(async ref => {
            await item.delete();
            return await ref.get();
        }, this.errorHandler)
        .then(this.mapHistoryData, this.errorHandler);
    }

    private mapData  = (doc: FirebaseFirestore.DocumentSnapshot<T> | FirebaseFirestore.QueryDocumentSnapshot<T>): T => ({...doc.data() as T, id: doc.id});
    private mapHistoryData  = (doc: FirebaseFirestore.DocumentSnapshot<History> | FirebaseFirestore.QueryDocumentSnapshot<History>): History => ({...doc.data() as History, id: doc.id});
    private errorHandler = (err: any) => {throw new Error(err.details);}
}