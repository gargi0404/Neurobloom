import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Stack, Alert, MenuItem, Select, FormControl, InputLabel, useMediaQuery } from '@mui/material';
import PHQ9Screener from '../components/PHQ9Screener';
import ASDScreener from '../components/ASDScreener';
import ADHDScreener from './ADHDScreener';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { PageWrapper } from '../components/PageWrapper';

const screenerOptions = [
  { key: 'phq9', label: 'Depression (PHQ-9)' },
  { key: 'asd', label: 'Autism Spectrum (RAADS-R)' },
  { key: 'adhd', label: 'ADHD (ASRS v1.1)' },
];

const ScreenerPage: React.FC = () => {
  const [step, setStep] = useState<'warning' | 'select' | 'test' | 'result'>('warning');
  const [selected, setSelected] = useState('phq9');
  const [result, setResult] = useState<any>(null);
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleStart = () => setStep('test');
  const handleScreenerComplete = async (res: any) => {
    setResult(res);
    setStep('result');
    try {
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/score/screener`, {
        screenerType: selected,
        screenerScore: res.score,
        screenerDetails: res.details,
        screenerRaw: res,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Failed to save screener result:', err);
    }
  };
  const handleRestart = () => {
    setResult(null);
    setStep('select');
  };

  return (
    <PageWrapper variant="other">
      <Box px={{ xs: 1, sm: 4, md: 8 }} py={4} width="100%">
        {step === 'warning' && (
          <Stack spacing={3} alignItems="center">
            <Alert severity="warning" sx={{ fontWeight: 600, fontSize: 18 }}>
              <b>Disclaimer:</b> This test does <u>not</u> diagnose you. Only a qualified professional can do that. Your results are for self-reflection and awareness only.
            </Alert>
            <Button variant="contained" size="large" color="primary" onClick={() => setStep('select')}>Continue</Button>
          </Stack>
        )}
        {step === 'select' && (
          <Stack spacing={4} alignItems="center">
            <Typography variant="h5" fontWeight={700} color="primary" mb={1}>Choose a Screener</Typography>
            <FormControl fullWidth>
              <InputLabel id="screener-select-label">Screener</InputLabel>
              <Select
                labelId="screener-select-label"
                value={selected}
                label="Screener"
                onChange={e => setSelected(e.target.value)}
              >
                {screenerOptions.map(opt => (
                  <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Credits/Attribution */}
            {selected === 'phq9' && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}>
                PHQ-9: Patient Health Questionnaire-9. Developed by Drs. Spitzer, Kroenke, and Williams. Source: <a href="https://www.phqscreeners.com/" target="_blank" rel="noopener noreferrer">phqscreeners.com</a>
              </Typography>
            )}
            {selected === 'asd' && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}>
                RAADS-R: Ritvo Autism Asperger Diagnostic Scale-Revised. Developed by Dr. Riva Ariella Ritvo et al. Source: <a href="https://www.aspietests.org/raads/index.php" target="_blank" rel="noopener noreferrer">aspietests.org</a>
              </Typography>
            )}
            <Button variant="contained" size="large" color="primary" onClick={handleStart}>Start Test</Button>
          </Stack>
        )}
        {step === 'test' && (
          <Box>
            {selected === 'phq9' && <PHQ9Screener onComplete={handleScreenerComplete} />}
            {selected === 'asd' && <ASDScreener onComplete={handleScreenerComplete} />}
            {selected === 'adhd' && <ADHDScreener />}
          </Box>
        )}
        {step === 'result' && (
          <Stack spacing={3} alignItems="center">
            <Typography variant="h5" fontWeight={700} color="primary">Your Results</Typography>
            {result && (
              <Box width="100%">
                {result.summary && <Alert severity="info" sx={{ mb: 2 }}>{result.summary}</Alert>}
                <Typography variant="body1" sx={{ mb: 2 }}>{result.details || 'Thank you for taking the test.'}</Typography>
              </Box>
            )}
            <Alert severity="warning" sx={{ fontWeight: 500 }}>
              If you have concerns about your mental health, please consult a licensed professional. This tool is for self-awareness only.
            </Alert>
            <Button variant="outlined" color="primary" onClick={handleRestart}>Take Another Test</Button>
          </Stack>
        )}
      </Box>
    </PageWrapper>
  );
};

export default ScreenerPage; 