import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { PageWrapper } from '../components/PageWrapper';

// ADHD ASRS v1.1 Screener Questions
const questions = [
  "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
  "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
  "How often do you have problems remembering appointments or obligations?",
  "How often do you feel overly active and compelled to do things, like you were driven by a motor?"
];

const options = [
  { value: 0, label: "Never" },
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Very Often" },
];

interface ADHDScreenerProps {
  onComplete?: (result: { summary: string; details: string; score: number }) => void;
}

const ADHDScreener: React.FC<ADHDScreenerProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleChange = (qIdx: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const getResultText = (score: number) => {
    if (score >= 4) {
      return "Your responses are consistent with symptoms of ADHD. This is not a diagnosis. Please consult a professional for further evaluation.";
    }
    return "Your responses are not consistent with significant ADHD symptoms. If you have concerns, consult a professional.";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some(a => a === null)) return;
    // Calculate score: count of answers >= 2 ("Sometimes" or more)
    const total = answers.reduce((acc: number, val) => (val !== null && val >= 2 ? acc + 1 : acc), 0);
    setScore(total);
    
    if (onComplete) {
      const summary = getResultText(total);
      onComplete({
        summary,
        details: `Your ADHD ASRS score is ${total}. ${summary}`,
        score: total,
      });
    } else {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
    setScore(null);
  };

  if (onComplete) {
    // Only render the form, not the internal result UI
    return (
      <Box px={{ xs: 1, sm: 4, md: 8 }} py={4} width="100%">
        <Typography variant="h4" fontWeight={700} color="primary" align="left" sx={{ mb: 4 }}>
          ADHD Screener (ASRS v1.1)
        </Typography>
        <form onSubmit={handleSubmit}>
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {options.map(opt => (
                    <TableCell key={opt.value} align="center" sx={{ fontWeight: 600 }}>{opt.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((q, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 320, whiteSpace: 'pre-line' }}>{idx + 1}. {q}</TableCell>
                    {options.map(opt => (
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

  // Fallback: original UI for standalone use
  return (
    <PageWrapper variant="other">
      <Box
        sx={{
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          py: 6,
        }}
      >
        <Paper elevation={3} sx={{ maxWidth: 800, width: "100%", p: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 500, color: "#3a73b0", fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            ADHD Screener (ASRS v1.1)
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2, textAlign: 'center' }}>
            ASRS v1.1: Adult ADHD Self-Report Scale. Developed by the World Health Organization (WHO) in collaboration with the Workgroup on Adult ADHD. Source: <a href="https://www.hcp.med.harvard.edu/ncs/asrs.php" target="_blank" rel="noopener noreferrer">hcp.med.harvard.edu/ncs/asrs.php</a>
          </Typography>
          <Alert severity="warning" sx={{ fontWeight: 600, fontSize: 16, mb: 3 }}>
            <b>Disclaimer:</b> This screener does <u>not</u> diagnose you. Only a qualified professional can do that. Your results are for self-reflection and awareness only.
          </Alert>
          <Divider sx={{ mb: 3 }} />
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      {options.map(opt => (
                        <TableCell key={opt.value} align="center" sx={{ fontWeight: 600 }}>{opt.label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((q, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 500, maxWidth: 320, whiteSpace: 'pre-line' }}>{idx + 1}. {q}</TableCell>
                        {options.map(opt => (
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
              <Box display="flex" justifyContent="center" mt={3} mb={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={answers.some(a => a === null)}
                  sx={{ background: "#3a73b0", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  Submit
                </Button>
              </Box>
            </form>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: score !== null && score >= 4 ? "#388e3c" : "#3a73b0", mb: 3 }}>
                {score !== null && getResultText(score)}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ 
                  borderColor: "#3a73b0", 
                  color: "#3a73b0", 
                  fontFamily: "Inter, sans-serif", 
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: "#2d5a8b",
                    backgroundColor: "rgba(58, 115, 176, 0.04)"
                  }
                }}
              >
                Take Again
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </PageWrapper>
  );
};

export default ADHDScreener;