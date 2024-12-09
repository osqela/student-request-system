import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  AppBar,
  Toolbar,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Shuffle as ShuffleIcon, Search as SearchIcon } from '@mui/icons-material';

interface Student {
  id: number;
  name: string;
  class: string;
}

interface Group {
  id: number;
  students: Student[];
}

interface ClassData {
  name: string;
  students: string[];
}

export const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showGroups, setShowGroups] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentsList, setNewStudentsList] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectionTimer, setSelectionTimer] = useState<number | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [availableStudents, setAvailableStudents] = useState<string[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    const savedClasses = localStorage.getItem('classes');
    if (savedStudents) {
      console.log('Loading students from localStorage:', savedStudents);
      setStudents(JSON.parse(savedStudents));
    }
    if (savedClasses) {
      console.log('Loading classes from localStorage:', savedClasses);
      setClasses(JSON.parse(savedClasses));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    console.log('Saving students to localStorage:', students);
    localStorage.setItem('students', JSON.stringify(students));
    console.log('Saving classes to localStorage:', classes);
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [students, classes]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA Install Prompt Triggered');
      console.log('Browser supports PWA:', 'beforeinstallprompt' in window);
      console.log('Service Worker registered:', 'serviceWorker' in navigator);
      setDeferredPrompt(e as any);
    };

    const handleAppInstalled = () => {
      console.log('App was successfully installed');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Install button clicked. Deferred Prompt:', !!deferredPrompt);
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
      setDeferredPrompt(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // ავტომატური კლასის ძიება
    const matchingClasses = classes.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );

    // თუ იპოვა კლასი, დაამატოს მოსწავლეები
    if (matchingClasses.length > 0) {
      matchingClasses.forEach(matchingClass => {
        matchingClass.students.forEach(studentName => {
          const existingStudent = students.find(s => s.name === studentName && s.class === matchingClass.name);
          if (!existingStudent) {
            const newStudent = {
              id: Date.now() + Math.random(),
              name: studentName,
              class: matchingClass.name
            };
            setStudents(prev => [...prev, newStudent]);
          }
        });
      });
    }
  };

  const handleAddStudentFromSearch = () => {
    if (!searchQuery.trim()) return;

    // Find class that matches the search query
    const matchingClass = classes.find(c => c.name === searchQuery);
    if (matchingClass) {
      // Add all students from the matching class
      matchingClass.students.forEach(studentName => {
        const existingStudent = students.find(s => s.name === studentName && s.class === matchingClass.name);
        if (!existingStudent) {
          const newStudent = {
            id: Date.now() + Math.random(),
            name: studentName,
            class: matchingClass.name
          };
          setStudents(prev => [...prev, newStudent]);
        }
      });
      setSearchQuery('');
      showSnackbar(`${matchingClass.name} კლასის მოსწავლეები დაემატა`, 'success');
    } else {
      // Add single student
      const newStudent = {
        id: Date.now(),
        name: searchQuery,
        class: ''
      };
      setStudents(prev => [...prev, newStudent]);
      setSearchQuery('');
      showSnackbar('მოსწავლე წარმატებით დაემატა', 'success');
    }
  };

  const handleAddStudent = (studentName: string) => {
    const newStudent = {
      id: Date.now(),
      name: studentName,
      class: ''
    };
    setStudents(prev => [...prev, newStudent]);
    showSnackbar('მოსწავლე წარმატებით დაემატა', 'success');
  };

  const handleRemoveStudent = (studentId: number) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (students.length <= 1) {
      setShowGroups(false);
    }
    showSnackbar('მოსწავლე წაიშალა', 'success');
  };

  const handleAddClass = () => {
    if (newClassName.trim() && newStudentsList.trim()) {
      const studentNames = newStudentsList
        .split('\n')
        .map(name => name.trim())
        .filter(Boolean);

      console.log('Adding class:', {
        className: newClassName,
        students: studentNames
      });

      setClasses(prev => {
        const existingClassIndex = prev.findIndex(c => c.name === newClassName);
        if (existingClassIndex !== -1) {
          // Update existing class
          const updatedClasses = [...prev];
          updatedClasses[existingClassIndex] = {
            name: newClassName,
            students: studentNames
          };
          
          console.log('Updating existing class:', updatedClasses);
          localStorage.setItem('classes', JSON.stringify(updatedClasses));
          
          return updatedClasses;
        } else {
          // Add new class
          const newClasses = [...prev, {
            name: newClassName,
            students: studentNames
          }];
          
          console.log('Adding new class:', newClasses);
          localStorage.setItem('classes', JSON.stringify(newClasses));
          
          return newClasses;
        }
      });
      
      // Debug: Check localStorage immediately after setting
      console.log('Current localStorage classes:', localStorage.getItem('classes'));
      
      setDialogOpen(false);
      setNewClassName('');
      setNewStudentsList('');
      showSnackbar('კლასი წარმატებით დაემატა', 'success');
    }
  };

  const selectRandomStudent = () => {
    if (students.length === 0) {
      showSnackbar('მოსწავლეების სია ცარიელია', 'error');
      return;
    }

    // Clear existing timer
    if (selectionTimer) {
      clearTimeout(selectionTimer);
    }

    const randomStudent = students[Math.floor(Math.random() * students.length)];
    setSelectedStudent(randomStudent.name);

    // Clear selection after 6 seconds
    const timer = window.setTimeout(() => {
      setSelectedStudent(null);
    }, 6000);
    setSelectionTimer(timer);
  };

  const createGroups = (size: number) => {
    if (students.length < size) {
      showSnackbar(`საჭიროა მინიმუმ ${size} მოსწავლე`, 'error');
      return;
    }

    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    // Calculate optimal group distribution
    const totalGroups = Math.ceil(students.length / size);
    const baseSize = Math.floor(students.length / totalGroups);
    const extraStudents = students.length % totalGroups;

    let currentIndex = 0;
    for (let i = 0; i < totalGroups; i++) {
      const groupSize = i < extraStudents ? baseSize + 1 : baseSize;
      newGroups.push({
        id: Date.now() + i,
        students: shuffledStudents.slice(currentIndex, currentIndex + groupSize)
      });
      currentIndex += groupSize;
    }

    setGroups(newGroups);
    setShowGroups(true);
    showSnackbar('ჯგუფები წარმატებით შეიქმნა', 'success');
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'linear-gradient(-45deg, #FFD700, #90EE90, #32CD32, #FFD700)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        overflow: 'auto',
        '@keyframes gradientBG': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          კლასის დამატება
        </Button>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder="მოძებნე მოსწავლე ან კლასი..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 250,
            '& .MuiInputBase-root': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddStudentFromSearch}
          disabled={!searchQuery.trim()}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          დამატება
        </Button>
        {deferredPrompt && (
          <Button
            variant="contained"
            onClick={handleInstallClick}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            დაყენება
          </Button>
        )}
      </Box>

      <Container 
        maxWidth={false}
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: '10vh',
          pb: '10vh',
          gap: 4,
          transition: 'all 0.3s ease',
        }}
      >
        <Card 
          sx={{
            width: '45%',
            maxWidth: 800,
            minWidth: 400,
            height: showGroups ? 'calc(80vh - 20px)' : 'auto',
            transition: 'all 0.3s ease',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                მოსწავლეები ({students.length})
              </Typography>
              <ToggleButtonGroup
                exclusive
                onChange={(_, value) => value && createGroups(value)}
                size="small"
              >
                {[2, 3, 4, 5, 6, 7].map((size) => (
                  <ToggleButton key={size} value={size}>
                    {size}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<ShuffleIcon />}
              onClick={selectRandomStudent}
              disabled={students.length === 0}
              sx={{ mb: 2 }}
            >
              შემთხვევითი შერჩევა
            </Button>

            {selectedStudent && (
              <Box
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: '#4CAF50',
                  color: 'white',
                  borderRadius: 2,
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  boxShadow: 3,
                  animation: 'fadeIn 0.5s'
                }}
              >
                {selectedStudent}
              </Box>
            )}

            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {students.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <Box>
                    <Typography>{student.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.class}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveStudent(student.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {showGroups && groups.length > 0 && (
          <Card 
            sx={{
              width: '45%',
              maxWidth: 800,
              minWidth: 400,
              height: 'calc(80vh - 20px)',
              position: 'relative',
              animation: showGroups ? 'slideIn 0.5s ease forwards' : 'slideOut 0.5s ease forwards',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              '@keyframes slideIn': {
                from: { transform: 'translateX(100%)', opacity: 0 },
                to: { transform: 'translateX(0)', opacity: 1 },
              },
              '@keyframes slideOut': {
                from: { transform: 'translateX(0)', opacity: 1 },
                to: { transform: 'translateX(100%)', opacity: 0 },
              },
            }}
          >
            <IconButton
              onClick={() => setShowGroups(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500',
                '&:hover': {
                  color: 'error.main',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
            <CardContent 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                pt: '40px', 
                pb: '20px'  
              }}
            >
              <Typography variant="h6" gutterBottom>
                შექმნილი ჯგუფები
              </Typography>
              <Box sx={{ 
                flexGrow: 1, 
                maxHeight: 'calc(100% - 60px)', 
                overflowY: 'auto',
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2 
              }}>
                {groups.map((group, index) => (
                  <Card key={group.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ჯგუფი {index + 1}
                    </Typography>
                    {group.students.map((student) => (
                      <Box
                        key={student.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2">{student.name}</Typography>
                        {student.class && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({student.class})
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(50, 205, 50, 0.5);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(50, 205, 50, 0.8);
          }
        `}
      </style>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 500,
            borderRadius: 3,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#4CAF50', color: 'white' }}>
          კლასის დამატება
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="კლასის ნომერი"
            fullWidth
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            multiline
            rows={4}
            margin="dense"
            label="მოსწავლეების სია"
            placeholder="თითო ხაზზე თითო მოსწავლე"
            fullWidth
            value={newStudentsList}
            onChange={(e) => setNewStudentsList(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            color="error"
          >
            გაუქმება
          </Button>
          <Button 
            onClick={handleAddClass}
            variant="contained"
            sx={{ bgcolor: '#4CAF50' }}
            disabled={!newClassName.trim() || !newStudentsList.trim()}
          >
            შენახვა
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
