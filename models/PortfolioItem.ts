import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPortfolioItem extends Document {
    category: string;
    src: string;
    location?: string;
    createdAt: Date;
}

const PortfolioItemSchema: Schema = new Schema({
    category: {
        type: String,
        required: [true, 'Please provide a category for this item.'],
        enum: ['Solos', 'Couple', 'Pet', 'Family', 'Lifestyle', 'Yoga', 'Creative', 'All'],
    },
    src: {
        type: String,
        required: [true, 'Please provide an image source (URL).'],
    },
    location: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PortfolioItem: Model<IPortfolioItem> = mongoose.models.PortfolioItem || mongoose.model<IPortfolioItem>('PortfolioItem', PortfolioItemSchema);

export default PortfolioItem;
