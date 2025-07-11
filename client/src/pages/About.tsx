import React from 'react';
import { Box, Typography, Paper, Grid, Avatar, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import logo from '../logo.jpg';
import Header from '../components/Header';
import { PageWrapper } from '../components/PageWrapper';

const features = [
  { icon: <SportsEsportsIcon color="primary" />, title: 'Cognitive Games', desc: 'Fun, science-backed games to train memory, logic, and emotion recognition.' },
  { icon: <AssessmentIcon color="primary" />, title: 'Screeners', desc: 'Self-assessment tools for depression and autism spectrum (PHQ-9, RAADS-R).' },
  { icon: <PsychologyIcon color="primary" />, title: 'Progress Tracking', desc: 'Visualize your progress and history over time.' },
  { icon: <GroupIcon color="primary" />, title: 'Therapist Support', desc: 'Special dashboard for therapists to monitor and support patients.' },
];

const About: React.FC = () => (
  <PageWrapper variant="other">
    <Header />
    <Box px={{ xs: 2, sm: 6 }} py={6} sx={{ pt: 10 }}>
      <Paper elevation={4} sx={{ maxWidth: 800, mx: 'auto', p: { xs: 3, sm: 6 }, borderRadius: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar src={logo} alt="Neuroblooming Logo" sx={{ width: 64, height: 64, mr: 3, borderRadius: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={900} letterSpacing={2} color="primary.main">Neuroblooming</Typography>
            <Typography variant="subtitle1" color="text.secondary">Digital tools for cognitive wellness</Typography>
          </Box>
        </Box>
        <Typography variant="body1" mb={3}>
          <b>Neuroblooming</b> is a modern web platform designed to help users improve their cognitive and emotional skills through engaging games, self-assessment screeners, and progress tracking. Built for both individuals and therapists, our mission is to make mental wellness accessible, fun, and data-driven.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={700} mb={2}>Key Features</Typography>
        <List>
          {features.map(f => (
            <ListItem key={f.title} disableGutters>
              <ListItemIcon>{f.icon}</ListItemIcon>
              <ListItemText primary={f.title} secondary={f.desc} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={700} mb={2}>Credits & Attribution</Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          - PHQ-9: Patient Health Questionnaire-9. Developed by Drs. Spitzer, Kroenke, and Williams. <a href="https://www.phqscreeners.com/" target="_blank" rel="noopener noreferrer">phqscreeners.com</a><br/>
          - RAADS-R: Ritvo Autism Asperger Diagnostic Scale-Revised. Developed by Dr. Riva Ariella Ritvo et al. <a href="https://www.aspietests.org/raads/index.php" target="_blank" rel="noopener noreferrer">aspietests.org</a><br/>
          - Built with React, Material-UI, Firebase, and open-source resources.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={700} mb={2}>Contact & Team</Typography>
        <Typography variant="body2" color="text.secondary">
          For questions, feedback, or collaboration, contact the Neuroblooming team.<br/>
          <i>(Add your email, team info, or social links here.)</i>
        </Typography>
      </Paper>
    </Box>
  </PageWrapper>
);

export default About; 