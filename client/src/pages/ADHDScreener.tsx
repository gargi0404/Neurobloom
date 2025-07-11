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

const ADHDScreener: React.FC = () => {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleChange = (qIdx: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Calculate score: count of answers >= 2 ("Sometimes" or more)
    const total = answers.reduce((acc: number, val) => (val !== null && val >= 2 ? acc + 1 : acc), 0);
    setScore(total);
    setSubmitted(true);
  };

  const getResultText = () => {
    if (score === null) return "";
    if (score >= 4) {
      return "Your responses are consistent with symptoms of ADHD. This is not a diagnosis. Please consult a professional for further evaluation.";
    }
    return "Your responses are not consistent with significant ADHD symptoms. If you have concerns, consult a professional.";
  };

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
        <Paper elevation={3} sx={{ maxWidth: 600, width: "100%", p: 4, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 500, color: "#3a73b0", fontFamily: "Inter, sans-serif" }}>
            ADHD Screener (ASRS v1.1)
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2, textAlign: 'center' }}>
            ASRS v1.1: Adult ADHD Self-Report Scale. Developed by the World Health Organization (WHO) in collaboration with the Workgroup on Adult ADHD. Source: <a href="https://www.hcp.med.harvard.edu/ncs/asrs.php" target="_blank" rel="noopener noreferrer">hcp.med.harvard.edu/ncs/asrs.php</a>
          </Typography>
          <Alert severity="warning" sx={{ fontWeight: 600, fontSize: 16, mb: 3 }}>
            <b>Disclaimer:</b> This screener does <u>not</u> diagnose you. Only a qualified professional can do that. Your results are for self-reflection and awareness only.
          </Alert>
          <Divider sx={{ mb: 3 }} />
          {questions.map((q, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1, fontWeight: 400, fontFamily: "Inter, sans-serif" }}>{q}</Typography>
              <RadioGroup
                row
                value={answers[idx] ?? ''}
                onChange={e => handleChange(idx, parseInt(e.target.value))}
              >
                {options.map(opt => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio sx={{ color: "#3a73b0" }} />}
                    label={<Typography sx={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}>{opt.label}</Typography>}
                    sx={{ mr: 2 }}
                  />
                ))}
              </RadioGroup>
            </Box>
          ))}
          <Button
            variant="contained"
            sx={{ mt: 2, background: "#3a73b0", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
            onClick={handleSubmit}
            disabled={answers.some(a => a === null) || submitted}
          >
            Submit
          </Button>
          {submitted && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: score !== null && score >= 4 ? "#388e3c" : "#3a73b0" }}>
                {getResultText()}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </PageWrapper>
  );
};

export default ADHDScreener;