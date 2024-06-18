const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    title: { type: String, required: true },
    category: { 
        type: String, 
        enum: [
            "Digital Marketing Strategies in Pharma", 
            "Patient Education and Engagement",
            "Healthcare Professional (HCP) Outreach", 
            "Market Access and Reimbursement",
            "Brand Management and Positioning", 
            "Regulatory Compliance in Pharma Marketing",
            "Pharma Analytics and Market Research", 
            "Collaborations and Partnerships",
            "Content Marketing and Storytelling",
            "Crisis Communication and Reputation Management"
        ],
        message: "{VALUE} is not supported"
    },
    description: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User"},
    thumbnail: { type: String, required: true },
}, { timestamps: true });

module.exports = model("Post", postSchema);
