import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Radio, Typography, Paper } from '@mui/material';
import { Box, Button } from '@mui/material';

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself—or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed. Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

const OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

function getResult(score: number) {
  if (score <= 4) return { msg: 'Minimal or no signs of depression.', color: 'bg-blue-100', game: null };
  if (score <= 9) return { msg: 'Mild depression.', color: 'bg-blue-200', game: null };
  if (score <= 14) return { msg: 'Moderate depression.', color: 'bg-blue-300', game: 'Logic Zone' };
  if (score <= 19) return { msg: 'Moderately severe depression.', color: 'bg-blue-400', game: 'Logic Zone' };
  return { msg: 'Severe depression. Consider therapist support.', color: 'bg-blue-500', game: 'Logic Zone' };
}

interface PHQ9ScreenerProps {
  onComplete?: (result: { summary: string; details: string; score: number }) => void;
}

const PHQ9Screener: React.FC<PHQ9ScreenerProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(9).fill(null));
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
    const total = answers.reduce((sum: number, val) => sum + (val !== null ? val : 0), 0);
    setScore(total);
    if (onComplete) {
      const result = getResult(total);
      onComplete({
        summary: result.msg,
        details: `Your PHQ-9 score is ${total}. ${result.msg}`,
        score: total,
      });
    } else {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers(Array(9).fill(null));
    setSubmitted(false);
    setScore(0);
  };

  const result = getResult(score);

  if (onComplete) {
    // Only render the form, not the internal result UI
    return (
      <Box px={{ xs: 1, sm: 4, md: 8 }} py={4} width="100%">
        <Typography variant="h4" fontWeight={700} color="primary" align="left" sx={{ mb: 4 }}>
          Depression Screener (PHQ-9)
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
                {PHQ9_QUESTIONS.map((q, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 320, whiteSpace: 'pre-line' }}>{idx + 1}. {q}</TableCell>
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
        <h2 className="text-3xl font-bold text-[#3674b5] mb-6 text-center">Depression Screener (PHQ-9)</h2>
        {!submitted ? (
          <TableContainer component={Paper} sx={{ maxWidth: 700, mx: 'auto', mt: 4, boxShadow: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={700} color="primary" align="center" sx={{ my: 3 }}>
              Depression Screener (PHQ-9)
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
                  {PHQ9_QUESTIONS.map((q, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 500 }}>{idx + 1}. {q}</TableCell>
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
          <div className={`rounded-xl p-8 shadow-lg text-center ${result.color} border border-blue-300`}> 
            <h3 className="text-2xl font-bold mb-2 text-[#3674b5]">Your Result</h3>
            <div className="text-lg mb-4">Total Score: <span className="font-bold">{score}</span></div>
            <div className="text-xl mb-4">{result.msg}</div>
            {result.game && (
              <div className="mt-2 text-lg">
                <span className="font-semibold">Recommended NeuroBloom Game:</span> <span className="underline">{result.game}</span>
              </div>
            )}
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

export default PHQ9Screener; 