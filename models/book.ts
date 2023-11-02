import mongoose, { Document, Model } from 'mongoose';
import { Overwrite, PopulatedUserType } from './user';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `User`,
            required: true,
        },
        comment: { type: String },
        rating: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const bookSchema = new mongoose.Schema(
    {
        isbn: {type: String, required: true}, //google
        googleId: {type: String, required: true}, //google
        googleLink: {type: String}, //google
        openlibraryKey: {type: String}, //openlib
        openlibraryUrl: {type: String}, //openlib
        openlibraryId: {type: String}, //openlib
        goodreadsId: {type: String}, //openlib
        amazonId: {type: String}, //openlib
        authors: [{ type: String }], //google
        title: {type: String, required: true}, //google
        subjects: [{ type: String }], //openlib 
        description: {type: String}, //google
        textSnippet: {type: String},
        pageCount: {type: Number}, //google
        publishedDate: {type: String}, //google
        googleImageUrl: {type: String}, //google
        openlibImageUrl: {type: String}, //openlib
        averageRating: {type: Number}, //google
        ratingsCount: {type: Number}, //google
        rating: { type: Number },
        numReviews: { type: Number, default: 0 },
        reviews: [reviewSchema]
    },
    { timestamps: true }
)


export interface ReviewType<T = PopulatedUserType> {
    _id: string;
    user: T extends string ? T : T | null;
    comment?: string;
    rating: number;
}


export interface CategoryType {
    alias: string,
    title: string
}

export interface BookType<T = ReviewType[]> extends Document {
    isbn?: string,
    googleId?: string,
    googleLink?: string,
    openlibraryKey?: string,
    openlibraryUrl?: string,
    openlibraryId?: string,
    goodreadsId?: string,
    amazonId?: string,
    authors?: string[],
    title?: string,
    subjects?: string[],
    description?: string,
    textSnippet?: string,
    pageCount?: number,
    publishedDate?: string,
    googleImageUrl?: string,
    openlibImageUrl?: string,
    averageRating?: number,
    ratingsCount?: number,
    numReviews?: number,
    rating: number,
    reviews?: T;
    createdAt?: Date;
    updatedAt?: Date;
}

export default mongoose?.models?.Book ||
    mongoose.model<BookType>(`Book`, bookSchema);

export type SerializedBookType<T = ReviewType[]> = Overwrite<
    BookType<T>,
    { createdAt: string; updatedAt: string; _id: string }
>;

export type BookModel = Model<BookType>;
