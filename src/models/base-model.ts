export interface BaseModel {
    id?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IndexedBaseModel extends BaseModel {
    index: number;
}