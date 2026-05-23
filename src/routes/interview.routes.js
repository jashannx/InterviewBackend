import express from 'express';
import upload from '../middlewares/file.middleware.js';
const interviewRouter = express.Router();
import authUser from '../middlewares/auth.middleware.js';
import {InterviewReportgenerator,getInterviewReport,getAllInterviewReports,generateResumePdf} from '../controllers/interview.controller.js';

interviewRouter.post('/generate-report', authUser, upload.single('resume'), InterviewReportgenerator);

interviewRouter.get('/report/:interviewId', authUser, getInterviewReport);

interviewRouter.get('/reports', authUser, getAllInterviewReports);

interviewRouter.post('/resume/pdf/:interviewId', authUser, generateResumePdf);

export default interviewRouter;