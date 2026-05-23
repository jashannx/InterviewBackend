import mongoose from "mongoose";
const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    intention: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
}, { _id: false });
const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    intention: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    }
}, { _id: false });

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
    },
}, { _id: false });
const preperationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
    },
    focus: { 
        type: String,
        required: true,
    },
    tasks: {
        type: [String],
        required: true,
    },
}, { _id: false });


const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: true,
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preperationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    }
}, { timestamps: true });
const InterviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);
export default InterviewReportModel;