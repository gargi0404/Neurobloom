import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, Typography, Paper, Box, Button } from '@mui/material';

const QUESTIONS = [
  { text: 'I am a sympathetic person.', normative: true },
  { text: 'I often use words and phrases from movies and television in conversations.', normative: false },
  { text: 'I am often surprised when others tell me I have been rude.', normative: false },
  { text: 'Sometimes I talk too loudly or too softly, and I am not aware of it.', normative: false },
  { text: "I often don't know how to act in social situations.", normative: false },
  { text: 'I can "put myself in other people\'s shoes."', normative: true },
  { text: 'I have a hard time figuring out what some phrases mean, like "you are the apple of my eye."', normative: false },
  { text: 'I only like to talk to people who share my special interests.', normative: false },
  { text: 'I focus on details rather than the overall idea.', normative: false },
  { text: 'I always notice how food feels in my mouth. This is more important to me than how it tastes.', normative: false },
  { text: 'I miss my best friends or family when we are apart for a long time.', normative: true },
  { text: 'I cannot tell when someone is flirting with me.', normative: false },
  { text: 'I keep lists of things that interest me, even when they have no practical use (for example sports statistics, train schedules, calendar dates, historical facts and dates).', normative: false },
  { text: 'I cannot tell if someone is interested or bored with what I am saying.', normative: false },
  { text: 'I am considered a compassionate type of person.', normative: true },
];

const OPTIONS = [
  { label: 'True now and when I was young', value: 3 },
  { label: 'True only now', value: 2 },
  { label: 'True only when I was younger than 16', value: 1 },
  { label: 'Never true', value: 0 },
];

function scoreAnswer(selected: number, normative: boolean) {
  // For normative: reverse scoring
  if (normative) return 3 - selected;
  return selected;
}

function getResult(score: number) {
  if (score < 30) return 'Minimal autistic traits.';
  if (score < 45) return 'Mild autistic traits.';
  if (score < 60) return 'Moderate autistic traits.';
  return 'Significant autistic traits. Consider professional assessment.';
}

interface ASDScreenerProps {
  onComplete?: (result: { summary: string; details: string; score: number }) => void;
}

const ASDScreener: React.FC<ASDScreenerProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleChange = (qIdx: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some(a => a === null)) return;
    const total = answers.reduce((sum: number, val, idx) => sum + scoreAnswer(val ?? 0, QUESTIONS[idx].normative), 0);
    setScore(total);
    if (onComplete) {
      const summary = getResult(total);
      onComplete({
        summary,
        details: `Your RAADS-R score is ${total}. ${summary}`,
        score: total,
      });
    } else {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setSubmitted(false);
    setScore(0);
  };

  const result = getResult(score);

  if (onComplete) {
    // Only render the form, not the internal result UI
    return (
      <Box px={{ xs: 1, sm: 4, md: 8 }} py={4} width="100%">
        <Typography variant="h4" fontWeight={700} color="primary" align="left" sx={{ mb: 4 }}>
          Autism Spectrum Screener (RAADS-R Short)
        </Typography>
        <form onSubmit={handleSubmit}>
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {OPTIONS.map(opt => (
                    <TableCell key={opt.value} align="center" sx={{ fontWeight: 600 }}>{opt.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {QUESTIONS.map((q, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 320, whiteSpace: 'pre-line' }}>{idx + 1}. {q.text}</TableCell>
                    {OPTIONS.map(opt => (
                      <TableCell key={opt.value} align="center">
                        <Radio
                          checked={answers[idx] === opt.value}
                          onChange={() => handleChange(idx, opt.value)}
                          value={opt.value}
                          name={`q${idx}`}
                          required
                          color="primary"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="flex-start" mt={3} mb={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={answers.some(a => a === null)}
            >
              Submit
            </Button>
          </Box>
        </form>
      </Box>
    );
  }
  // Fallback: original UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-8 px-2">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-[#3674b5] mb-6 text-center">Autism Spectrum Screener (RAADS-R Short)</h2>
        {!submitted ? (
          <TableContainer component={Paper} sx={{ maxWidth: 800, mx: 'auto', mt: 4, boxShadow: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary" align="center" sx={{ my: 3 }}>
              Autism Spectrum Screener (RAADS-R Short)
            </Typography>
            <form onSubmit={handleSubmit}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    {OPTIONS.map(opt => (
                      <TableCell key={opt.value} align="center" sx={{ fontWeight: 600 }}>{opt.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {QUESTIONS.map((q, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 500 }}>{idx + 1}. {q.text}</TableCell>
                      {OPTIONS.map(opt => (
                        <TableCell key={opt.value} align="center">
                          <Radio
                            checked={answers[idx] === opt.value}
                            onChange={() => handleChange(idx, opt.value)}
                            value={opt.value}
                            name={`q${idx}`}
                            required
                            color="primary"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box display="flex" justifyContent="center" mt={3} mb={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={answers.some(a => a === null)}
                >
                  Submit
                </Button>
              </Box>
            </form>
          </TableContainer>
        ) : (
          <div className="rounded-xl p-8 shadow-lg text-center bg-blue-100 border border-blue-300"> 
            <h3 className="text-2xl font-bold mb-2 text-[#3674b5]">Your Result</h3>
            <div className="text-lg mb-4">Total Score: <span className="font-bold">{score}</span></div>
            <div className="text-xl mb-4">{result}</div>
            <button
              onClick={handleReset}
              className="mt-6 bg-white text-[#3674b5] border border-[#3674b5] font-semibold py-2 px-6 rounded-lg hover:bg-blue-100 transition"
            >
              Take Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ASDScreener; 