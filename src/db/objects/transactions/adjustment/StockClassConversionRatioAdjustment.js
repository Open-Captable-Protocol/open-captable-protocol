import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const StockClassConversionRatioAdjustmentSchema = new mongoose.Schema({
    id: { type: String, default: () => uuid() },
    object_type: { type: String, default: "TX_STOCK_CLASS_CONVERSION_RATIO_ADJUSTMENT" },
    comments: [String],
    date: String,
    stock_class_id: String,
    new_ratio_conversion_mechanism: { type: mongoose.Schema.Types.Mixed },
});

const StockClassConversionRatioAdjustment = mongoose.model("StockClassConversionRatioAdjustment", StockClassConversionRatioAdjustmentSchema);

export default StockClassConversionRatioAdjustment;
