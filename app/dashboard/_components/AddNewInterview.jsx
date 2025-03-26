"use client";
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAI';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { Interview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddNewInterview = () => {
    const { user } = useUser();
    const [openDailog, setOpenDailog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [jobPos, setJobPos] = useState('');
    const [jobDesc, setJobDesc] = useState('');
    const [jobExp, setJobExp] = useState('');
    const router = useRouter();

    const OnSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('You must be logged in to create an interview.');
            return;
        }

        setLoading(true);
        try {
            // Generate interview questions using Gemini API
            const Prompt = `
                Job Position: ${jobPos}, Job Description: ${jobDesc}, Years of Experience: ${jobExp},
                Depends on job position & job Description & Years of Experience give us ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview question along with answer in json format,
                Give us question and answer field on json, return as a JSON array like [{"question": "Tell me about yourself", "answer": "I have 5 years of experience..."}]
            `;
            const result = await chatSession.sendMessage(Prompt);
            const rawResponse = (result.response.text()).replace('```json', '').replace('```', '');
            
            // Parse and validate the Gemini API response
            let interviewQuestions = [];
            try {
                const parsedResponse = JSON.parse(rawResponse);
                if (Array.isArray(parsedResponse)) {
                    interviewQuestions = parsedResponse.map((q, index) => ({
                        question: q.question || `Question ${index + 1}`,
                        answer: q.answer || '',
                    }));
                } else if (parsedResponse.interviewQuestions && Array.isArray(parsedResponse.interviewQuestions)) {
                    interviewQuestions = parsedResponse.interviewQuestions.map((q, index) => ({
                        question: q.question || `Question ${index + 1}`,
                        answer: q.answer || '',
                    }));
                } else {
                    throw new Error('Invalid response format from Gemini API');
                }
            } catch (parseError) {
                console.error('Error parsing Gemini API response:', parseError);
                toast.error('Failed to generate interview questions. Please try again.');
                setLoading(false);
                return;
            }

            // Insert into the Interview table
            const resp = await db.insert(Interview).values({
                MockId: uuidv4(),
                jsonResp: JSON.stringify(interviewQuestions),
                jobPosition: jobPos,
                jobDesc: jobDesc,
                jobExperience: jobExp,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: new Date() // Fix: Use Date object for timestamp
            }).returning({ MockId: Interview.MockId });

            if (resp && resp.length > 0) {
                toast.success('Interview created successfully!');
                setOpenDailog(false);
                router.push('/dashboard/interview/' + resp[0]?.MockId);
            } else {
                throw new Error('Failed to save interview');
            }
        } catch (error) {
            console.error('Error creating interview:', error);
            toast.error('An error occurred while creating the interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={() => setOpenDailog(true)}
            >
                <h2 className='font-bold text-lg text-center'>+ Add New</h2>
            </div>
            <Dialog open={openDailog} onOpenChange={setOpenDailog}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle className='text-2xl'>Tell us more about your job interviewing</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={OnSubmit}>
                                <div>
                                    <h2>Add Details about your job position/role</h2>
                                    <div className='mt-7 my-3'>
                                        <label>Job Role/Job Position</label>
                                        <Input
                                            placeholder="FullStack Developer For Example"
                                            value={jobPos}
                                            onChange={(e) => setJobPos(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Job Description/Tech Stack</label>
                                        <Textarea
                                            placeholder="React/Next For example"
                                            value={jobDesc}
                                            onChange={(e) => setJobDesc(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Years of Experience</label>
                                        <Input
                                            type="number"
                                            placeholder="10 For Example"
                                            max="60"
                                            value={jobExp}
                                            onChange={(e) => setJobExp(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end'>
                                    <Button type="button" variant="ghost" onClick={() => setOpenDailog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <LoaderCircle className='animate-spin' /> Generating from AI
                                            </>
                                        ) : (
                                            'Start Interview'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddNewInterview;