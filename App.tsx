import { useState } from 'react'
import './App.css'
import { CssBaseline, ThemeProvider, createTheme, Box, Container, Tab, Tabs } from '@mui/material';
import { StudentManager } from './components/StudentManager/StudentManager';
import RequestForm from './components/RequestForm';
import RequestList from './components/RequestList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#ffc107',
      light: '#ffd54f',
      dark: '#ffa000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans Georgian',
      'Segoe UI',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '1rem',
          padding: '8px 24px',
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="სტუდენტების მართვა" />
            <Tab label="მოთხოვნის გაგზავნა" />
            <Tab label="მოთხოვნების სია" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <StudentManager />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <RequestForm />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <RequestList />
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}

export default App;
